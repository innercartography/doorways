const { getEntry } = require("../../_lib/registry");
const { placeTrade } = require("../../_lib/tradelog");

/**
 * POST /api/markets/:id/trade  { userId, outcome, shares }
 *
 * The insider gate (market.canTrade) is static config, checked in-memory.
 * The trade itself is durable: placeTrade() replays the shared trade log
 * from Vercel Blob before applying it, so the price this returns is the
 * same one every other visitor's agent sees, not a per-instance copy.
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
  const { userId, outcome, shares } = req.body || {};
  if (!userId || !["YES", "NO"].includes(outcome) || typeof shares !== "number" || shares <= 0) {
    res.status(400).json({ error: "body must be { userId: string, outcome: 'YES'|'NO', shares: number > 0 }" });
    return;
  }
  if (!entry.market.canTrade(userId)) {
    res.status(403).json({
      ok: false,
      reason: "insider — can influence this resolution; route to attestation, not trading",
      note: "insider gate: blocked from trading, routed to attestation",
      attest_instead: `POST /api/markets/${entry.market.id}/attest { userId, outcome, confidence, statement }`,
    });
    return;
  }
  const { cost, after, tradeCount } = await placeTrade(entry.market.id, entry.market.amm.b, userId, outcome, shares);
  res.status(200).json({
    ok: true,
    cost,
    prices: after,
    market: { id: entry.market.id, question: entry.market.question, prices: after, tradeCount },
  });
};
