/**
 * bls-cpi.js — LIVE oracle resolver for the CPI / allowable-increase market.
 *
 * Reads the BLS public API for CPI-U, San Francisco-Oakland-Hayward, all items,
 * not seasonally adjusted (series CUURS49BSA0) and applies the Rent Ordinance
 * formula: allowable increase = 60% of the regional CPI % change.
 *
 * The SF-area index is published bi-monthly (Feb/Apr/Jun/Aug/Oct/Dec), so this
 * market can't resolve until the Oct release posts (per RESOLUTION-SPEC.md).
 * Same live+cache-fallback pattern as datasf-permit.js — never single-point-of-
 * failure on venue wifi.
 *
 * API: https://api.bls.gov/publicAPI/v2/timeseries/data/CUURS49BSA0 (no key
 * needed for low request volume; a registration key raises the daily limit).
 */

const fs = require("fs");
const path = require("path");

const BLS_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data";
const CACHE_PATH = path.join(__dirname, "..", "..", "data", "cpi-cache.json");

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return null;
  }
}

/** Fetch a BLS series' data points. Falls back to the pre-fetched /data cache. */
async function fetchSeries(seriesId) {
  try {
    const res = await fetch(`${BLS_URL}/${encodeURIComponent(seriesId)}`);
    if (!res.ok) throw new Error(`BLS returned ${res.status}`);
    const body = await res.json();
    if (body.status !== "REQUEST_SUCCEEDED") throw new Error(body.message?.join("; ") || "BLS request failed");
    const series = body.Results.series.find((s) => s.seriesID === seriesId);
    if (!series) throw new Error(`series ${seriesId} not in response`);
    return { data: series.data, source: "live" };
  } catch (err) {
    const cache = readCache();
    const series = cache && cache.seriesID === seriesId ? cache.Results?.series?.[0] : null;
    if (series) return { data: series.data, source: "cache", cachedAt: cache.fetchedAt, liveError: err.message };
    return { data: null, source: "none", liveError: err.message };
  }
}

/** Find a single (year, period) data point, e.g. period "M10" = October. */
function findPoint(points, year, period) {
  const p = points?.find((d) => d.year === String(year) && d.period === period);
  if (!p || p.value === "-") return null; // "-" = BLS marks this point unreleased/unavailable
  return { ...p, value: Number(p.value) };
}

/**
 * Resolve the allowable-increase market.
 *
 * @param {object} market
 * @param {string} market.seriesId          e.g. "CUURS49BSA0"
 * @param {{year:number,period:string}} market.currentPeriod  e.g. {year:2026, period:"M10"}
 * @param {{year:number,period:string}} market.priorPeriod    e.g. {year:2025, period:"M10"}
 * @param {number} market.formulaMultiplier e.g. 0.6 (Rent Ordinance: 60% of CPI change)
 * @param {number} market.thresholdPct      e.g. 2.0
 * @returns {Promise<{resolved:boolean, outcome:('YES'|'NO'|null), evidence:object}>}
 */
async function resolveCPIMarket(market) {
  const { data, source, cachedAt, liveError } = await fetchSeries(market.seriesId);
  const now = new Date().toISOString();

  if (!data) {
    return { resolved: false, outcome: null, evidence: { note: "CPI series unavailable, live and cached", liveError, checkedAt: now } };
  }

  const current = findPoint(data, market.currentPeriod.year, market.currentPeriod.period);
  const prior = findPoint(data, market.priorPeriod.year, market.priorPeriod.period);

  if (!current || !prior) {
    return {
      resolved: false,
      outcome: null,
      evidence: {
        note: "BLS has not yet published the release this market resolves on",
        have: data.filter((d) => d.value !== "-").map((d) => `${d.periodName} ${d.year}`),
        checkedAt: now,
      },
    };
  }

  const pctChange = ((current.value - prior.value) / prior.value) * 100;
  const allowable = pctChange * market.formulaMultiplier;

  return {
    resolved: true,
    outcome: allowable > market.thresholdPct ? "YES" : "NO",
    evidence: {
      seriesId: market.seriesId,
      currentIndex: current.value,
      priorIndex: prior.value,
      pctChange: Number(pctChange.toFixed(3)),
      formulaMultiplier: market.formulaMultiplier,
      allowableIncreasePct: Number(allowable.toFixed(3)),
      thresholdPct: market.thresholdPct,
      source: source === "cache" ? `${CACHE_PATH} (cached ${cachedAt})` : `${BLS_URL}/${market.seriesId}`,
      checkedAt: now,
    },
  };
}

module.exports = { fetchSeries, resolveCPIMarket };

// ── smoke test: node src/oracles/bls-cpi.js ─────────────────────────────────
if (require.main === module) {
  (async () => {
    console.log("Fetching CUURS49BSA0 (CPI-U, SF-Oakland-Hayward) to confirm the endpoint...");
    const { data, source } = await fetchSeries("CUURS49BSA0");
    for (const d of data.slice(0, 6)) {
      console.log(`${d.periodName} ${d.year}: ${d.value}${d.footnotes?.[0]?.text ? "  (" + d.footnotes[0].text + ")" : ""}`);
    }
    console.log(`(source: ${source})`);

    console.log("\nResolving the demo market — allowable increase 2027 (needs Oct 2026 vs Oct 2025):");
    const { cpiMarket } = require("../markets/examples");
    const result = await resolveCPIMarket(cpiMarket.recipe.params);
    console.log(JSON.stringify(result, null, 2));
  })().catch((e) => console.error("Resolver error:", e.message));
}
