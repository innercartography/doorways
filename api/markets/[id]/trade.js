const { getEntry, summarize } = require("../../_lib/registry");

/**
 * POST /api/markets/:id/trade  { userId, outcome, shares }
 *
 * Note for agent callers: this LMSR state lives in the function's memory,
 * not a database. On a serverless platform that means it can reset between
 * cold starts — treat trades here as demo interaction, not durable state.
 * The resolve endpoint reads real, live external data regardless of this.
 */
module.exports = (req, res) => {
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
  const { userId, outcome, shares } = req.body || {};
  if (!userId || !["YES", "NO"].includes(outcome) || typeof shares !== "number" || shares <= 0) {
    res.status(400).json({ error: "body must be { userId: string, outcome: 'YES'|'NO', shares: number > 0 }" });
    return;
  }
  const result = entry.market.trade(userId, outcome, shares);
  if (!result.ok) {
    res.status(403).json({ ...result, note: "insider gate: blocked from trading, routed to attestation" });
    return;
  }
  res.status(200).json({ ...result, market: summarize(entry.market) });
};
