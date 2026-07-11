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

const DATASET = "https://data.sfgov.org/resource/p4e4-a5a7.json";

/**
 * Fetch a single permit record by permit number.
 * Uses SoQL ($where) to filter server-side.
 */
async function fetchPermit(permitNumber) {
  const url = `${DATASET}?permit_number=${encodeURIComponent(permitNumber)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`DataSF returned ${res.status}`);
  const rows = await res.json();
  return rows[0] || null;
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
  const record = await fetchPermit(market.permitNumber);
  const now = new Date();
  const deadline = new Date(market.deadlineISO);

  if (!record) {
    // Unknown permit → cannot settle YES; only settles NO once deadline passes.
    return {
      resolved: now > deadline,
      outcome: now > deadline ? "NO" : null,
      evidence: { note: "permit not found in dataset", checkedAt: now.toISOString() },
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
      current_status: record.current_status,
      status_date: statusDate,
      street: `${record.street_number || ""} ${record.street_name || ""}`.trim(),
      source: DATASET,
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
        `status=${r.current_status}  (${r.current_status_date || r.status_date || "n/a"})`
      );
    }
    console.log("\nEndpoint live. Wire a real permit_number into resolvePermitMarket() for the demo.");
  })().catch((e) => console.error("Resolver error:", e.message));
}
