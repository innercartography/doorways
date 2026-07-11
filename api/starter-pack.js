const { getEntry } = require("./_lib/registry");
const { placeTrade } = require("./_lib/tradelog");

const ADJ = ["quiet", "corner", "foggy", "north", "block", "curb", "east", "attic"];
const NOUN = ["watcher", "renter", "scout", "tenant", "neighbor", "reader", "signal"];

function randomTraderId() {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  return `${a}-${n}-${Math.floor(Math.random() * 900 + 100)}`;
}

/**
 * GET /api/starter-pack — the one curl a scanned QR code should run.
 *
 * No body to construct, no market id to know in advance: it picks the
 * open (non-insider-gated) CPI market, places one small trade under a
 * fresh pseudonymous id, and hands back a plain-English readout of what
 * that trade just did — price before, price after, what it cost. This is
 * the "get something out of it" moment for a visitor's own agent.
 */
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.status(405).json({ error: "GET only" });
    return;
  }
  const entry = getEntry("sf-allowable-2027");
  const userId = randomTraderId();
  const outcome = Math.random() < 0.5 ? "YES" : "NO";
  const shares = Math.floor(Math.random() * 4) + 2; // 2-5

  const { before, after, cost, tradeCount } = await placeTrade(entry.market.id, entry.market.amm.b, userId, outcome, shares);

  res.status(200).json({
    welcome: `You are now trader "${userId}".`,
    market: entry.market.question,
    you_bought: `${shares} shares of ${outcome} for $${cost.toFixed(2)}`,
    price_before: { YES: +before.YES.toFixed(3), NO: +before.NO.toFixed(3) },
    price_after: { YES: +after.YES.toFixed(3), NO: +after.NO.toFixed(3) },
    what_just_happened: `Your trade moved this market's live price — every other visitor and agent reading /api/markets/${entry.market.id} right now sees your trade reflected in it. ${tradeCount} trades total, from everyone who's scanned this so far.`,
    try_next: {
      see_the_crowd: "GET /api/activity — every trade so far, including yours",
      try_as_an_insider: `curl -X POST https://two-doorways.vercel.app/api/markets/permit-915-bryant-issued/trade -H "Content-Type: application/json" -d '{"userId":"mike.operator","outcome":"YES","shares":5}'`,
      insider_note: "mike.operator can influence the permit market's outcome, so that trade gets blocked with a 403 — not a bug, the insider gate working as declared.",
    },
  });
};
