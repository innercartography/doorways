const { recentActivity, ensureSeeded } = require("./_lib/tradelog");
const { recentAttestations } = require("./_lib/attestlog");
const { MARKETS } = require("./_lib/registry");

/**
 * GET /api/activity — recent trades AND attestations across every market,
 * merged into one feed, most recent first. Backs the live feed on the
 * homepage and /agent: this is what turns "the price" from a decorative
 * number into something a room full of people visibly move — and shows
 * the other half of the insider gate actually happening, not just a 403.
 *
 * Also lazily seeds any never-traded market with one labeled "seed-bot"
 * trade (see ensureSeeded) — there's no cron on this plan, so priming
 * happens on whichever request notices the market is still empty.
 */
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.status(405).json({ error: "GET only" });
    return;
  }
  await Promise.all(Object.values(MARKETS).map(({ market }) => ensureSeeded(market.id, market.amm.b)));
  const [trades, attestations] = await Promise.all([recentActivity(30), recentAttestations(30)]);
  const questionFor = (marketId) => (MARKETS[marketId] ? MARKETS[marketId].market.question : marketId);
  const merged = [
    ...trades.map((t) => ({ type: "trade", ...t, question: questionFor(t.marketId) })),
    ...attestations.map((a) => ({ type: "attestation", ...a, question: questionFor(a.marketId) })),
  ].sort((a, b) => b.at - a.at).slice(0, 30);
  res.status(200).json({ trades: merged });
};
