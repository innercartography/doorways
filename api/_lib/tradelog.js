/**
 * tradelog.js — durable, shared LMSR state via an event-sourced trade log.
 *
 * Vercel functions don't share memory across invocations or instances, so
 * the in-memory LMSR on each market object (src/markets/factory.js) is only
 * ever a scratch calculator, reset on every cold start. The real, shared
 * price is derived by replaying every persisted trade, in order, through a
 * fresh LMSR — same discipline as the oracle recipes: a log is the source
 * of truth, not any one process's memory.
 *
 * Each trade is written as its own immutable blob, never overwritten, so
 * concurrent writers (two attendees curling at once) can't race on a
 * shared file. Worst case two trades land in a slightly different order
 * than they were sent — the LMSR handles that the same as any other trade
 * sequence, it isn't a correctness issue.
 */

const { put, list } = require("@vercel/blob");
const { LMSR } = require("../../src/amm/lmsr");

function prefixFor(marketId) {
  return `trades/${marketId}/`;
}

/** Sortable-by-name key: zero-padded timestamp first, so lexicographic
 * blob-name order is chronological order. */
function keyFor(record) {
  const ts = String(record.at).padStart(14, "0");
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefixFor(record.marketId)}${ts}-${rand}.json`;
}

async function appendTrade(record) {
  await put(keyFor(record), JSON.stringify(record), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
  return record;
}

async function listTrades(marketId) {
  const { blobs } = await list({ prefix: prefixFor(marketId) });
  const sorted = blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
  return Promise.all(sorted.map((b) => fetch(b.url).then((r) => r.json())));
}

/** Replay a market's full trade history into a fresh LMSR. */
async function replay(marketId, b) {
  const trades = await listTrades(marketId);
  const amm = new LMSR(b);
  for (const t of trades) amm.buy(t.outcome, t.shares);
  return { amm, trades };
}

async function currentPrices(marketId, b) {
  const { amm, trades } = await replay(marketId, b);
  return { prices: amm.prices(), tradeCount: trades.length };
}

/** Replay, apply one new trade, persist it, return before/after prices. */
async function placeTrade(marketId, b, userId, outcome, shares) {
  const { amm, trades } = await replay(marketId, b);
  const before = amm.prices();
  const cost = amm.buy(outcome, shares);
  const after = amm.prices();
  const record = { marketId, userId, outcome, shares, cost, at: Date.now() };
  await appendTrade(record);
  return { record, before, after, cost, tradeCount: trades.length + 1 };
}

/** Most recent trades across every market, for the live activity feed. */
async function recentActivity(limit = 30) {
  const { blobs } = await list({ prefix: "trades/" });
  const sorted = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname)).slice(0, limit);
  return Promise.all(sorted.map((b) => fetch(b.url).then((r) => r.json())));
}

/**
 * If a market has never traded, place exactly one small labeled trade so
 * the activity feed and price aren't sitting untouched before the first
 * real visitor. Bounded and one-shot per market — not a perpetual bot,
 * and never disguised as a real person (userId always "seed-bot").
 */
async function ensureSeeded(marketId, b) {
  const trades = await listTrades(marketId);
  if (trades.length > 0) return null;
  const outcome = Math.random() < 0.5 ? "YES" : "NO";
  const shares = 2 + Math.floor(Math.random() * 2);
  const { record } = await placeTrade(marketId, b, "seed-bot", outcome, shares);
  return record;
}

module.exports = { appendTrade, listTrades, replay, currentPrices, placeTrade, recentActivity, ensureSeeded };
