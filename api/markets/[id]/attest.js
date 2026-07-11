const { getEntry } = require("../../_lib/registry");
const { appendAttestation, listAttestations } = require("../../_lib/attestlog");

/**
 * POST /api/markets/:id/attest  { userId, outcome, confidence, statement }
 *
 * The other half of the insider gate: someone flagged as an insider
 * (canTrade() false) can't buy shares, but they can stake a claim here
 * instead — a statement plus a confidence, reputation not money. This is
 * a stub, not wired into resolution: it proves the gate routes insiders
 * somewhere real instead of just a dead-end 403. Named as a stub on
 * purpose, same discipline as the rest of this project's honesty.
 */
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const entry = getEntry(req.query.id);
  if (!entry) {
    res.status(404).json({ error: `unknown market id: ${req.query.id}` });
    return;
  }
  const { userId, outcome, confidence, statement } = req.body || {};
  if (!userId || !["YES", "NO"].includes(outcome) || typeof confidence !== "number" || confidence < 0 || confidence > 100) {
    res.status(400).json({ error: "body must be { userId: string, outcome: 'YES'|'NO', confidence: 0-100, statement?: string }" });
    return;
  }
  if (entry.market.canTrade(userId)) {
    res.status(403).json({
      ok: false,
      reason: "not flagged as an insider on this market — trade it instead, attestation is for the flagged few",
    });
    return;
  }
  const record = {
    marketId: entry.market.id,
    userId,
    outcome,
    confidence,
    statement: statement || null,
    at: Date.now(),
  };
  await appendAttestation(record);
  const all = await listAttestations(entry.market.id);
  res.status(200).json({
    ok: true,
    note: "attestation recorded — stub: reputation-staked, not yet wired into resolution or scoring",
    attestation: record,
    marketAttestationCount: all.length,
  });
};
