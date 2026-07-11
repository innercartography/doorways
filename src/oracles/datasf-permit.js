/**
 * datasf-permit.js — LIVE oracle resolver.
 *
 * Reads the SF Building Permits dataset (DataSF p4e4-a5a7) and settles a market
 * of the form: "Will permit <number> reach status <target> by <deadline>?"
 *
 * No API key needed for moderate volume. This is the resolver we run on stage.
 *
 * Dataset: https://data.sfgov.org/resource/p4e4-a5a7.json
 * Docs:    https://dev.socrata.com/foundry/data.sfgov.org/p4e4-a5a7
 */

const fs = require("fs");
const path = require("path");

const DATASET = "https://data.sfgov.org/resource/p4e4-a5a7.json";
const CACHE_PATH = path.join(__dirname, "..", "..", "data", "permits-cache.json");

/** Read the pre-fetched fallback cache. Returns null if it isn't there. */
function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Fetch a single permit record by permit number.
 * Uses SoQL ($where) to filter server-side. Falls back to the pre-fetched
 * /data cache if the live call fails (venue wifi, DataSF outage) — the demo
 * must never depend on live network as its single point of failure.
 */
async function fetchPermit(permitNumber) {
  try {
    const url = `${DATASET}?permit_number=${encodeURIComponent(permitNumber)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`DataSF returned ${res.status}`);
    const rows = await res.json();
    if (rows[0]) return { record: rows[0], source: "live" };
    throw new Error("no rows from live endpoint");
  } catch (err) {
    const cache = readCache();
    const cached =
      cache?.primary?.find((r) => r.permit_number === permitNumber) ||
      cache?.recentSoMa?.find((r) => r.permit_number === permitNumber);
    if (cached) return { record: cached, source: "cache", cachedAt: cache.fetchedAt, liveError: err.message };
    return { record: null, source: "none", liveError: err.message };
  }
}

/**
 * Resolve a permit-status market.
 *
 * @param {object} market
 * @param {string} market.permitNumber   e.g. "202401019999"
 * @param {string} market.targetStatus   e.g. "issued" (case-insensitive)
 * @param {string} market.deadlineISO    e.g. "2026-09-01"
 * @returns {Promise<{resolved:boolean, outcome:('YES'|'NO'|null), evidence:object}>}
 */
async function resolvePermitMarket(market) {
  const { record, source, cachedAt, liveError } = await fetchPermit(market.permitNumber);
  const now = new Date();
  const deadline = new Date(market.deadlineISO);

  if (!record) {
    // Unknown permit → cannot settle YES; only settles NO once deadline passes.
    return {
      resolved: now > deadline,
      outcome: now > deadline ? "NO" : null,
      evidence: { note: "permit not found in dataset or cache", liveError, checkedAt: now.toISOString() },
    };
  }

  const status = (record.current_status || record.status || "").toLowerCase();
  const hitTarget = status === market.targetStatus.toLowerCase();

  // Prefer the dataset's own status-date field for provenance.
  const statusDate = record.current_status_date || record.status_date || record.issued_date;
  const reachedInTime = hitTarget && statusDate && new Date(statusDate) <= deadline;

  return {
    resolved: reachedInTime || now > deadline,
    outcome: reachedInTime ? "YES" : now > deadline ? "NO" : null,
    evidence: {
      permit_number: record.permit_number,
      current_status: record.current_status || record.status,
      status_date: statusDate,
      street: `${record.street_number || ""} ${record.street_name || ""} ${record.street_suffix || ""}`.trim(),
      source: source === "cache" ? `${CACHE_PATH} (cached ${cachedAt})` : DATASET,
      checkedAt: now.toISOString(),
    },
  };
}

module.exports = { fetchPermit, resolvePermitMarket };

// ── smoke test: node src/oracles/datasf-permit.js ──────────────────────────
if (require.main === module) {
  (async () => {
    console.log("Fetching a few recent SoMa permits to confirm the endpoint...");
    const url = `${DATASET}?$order=filed_date DESC&$limit=3`;
    const res = await fetch(url);
    const rows = await res.json();
    for (const r of rows) {
      console.log(
        `#${r.permit_number}  ${r.street_number || ""} ${r.street_name || ""}  ` +
        `status=${r.current_status || r.status}  (${r.current_status_date || r.status_date || "n/a"})`
      );
    }

    console.log("\nResolving the live demo market — permit 202512101388, 915 Bryant St:");
    const { permitMarket } = require("../markets/examples");
    const result = await resolvePermitMarket(permitMarket.recipe.params);
    console.log(JSON.stringify(result, null, 2));
  })().catch((e) => console.error("Resolver error:", e.message));
}
