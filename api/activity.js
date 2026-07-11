const { recentActivity } = require("./_lib/tradelog");
const { MARKETS } = require("./_lib/registry");

/**
 * GET /api/activity — recent trades across every market, most recent first.
 * Backs the live feed on the homepage: this is what turns "the price" from
 * a decorative number into something a room full of people visibly move.
 */
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.status(405).json({ error: "GET only" });
    return;
  }
  const trades = await recentActivity(30);
  const enriched = trades.map((t) => ({
    ...t,
    question: MARKETS[t.marketId] ? MARKETS[t.marketId].market.question : t.marketId,
  }));
  res.status(200).json({ trades: enriched });
};
