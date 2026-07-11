/**
 * factory.js — the market factory.
 *
 * Create a market from a question + a declared oracle recipe + an AMM.
 * Enforces the innovation rule: participants who can influence a resolution
 * are flagged and barred from trading (routed to attestation instead).
 */

const { LMSR } = require("../amm/lmsr");

function createMarket({ id, question, recipe, b = 400, influencers = [] }) {
  return {
    id,
    question,
    recipe,
    amm: new LMSR(b),
    influencers: new Set(influencers), // user ids who can move the outcome
    trades: [],

    /** Fair vs foul gate: expertise trades, influence attests. */
    canTrade(userId) {
      return !this.influencers.has(userId);
    },

    trade(userId, outcome, shares) {
      if (!this.canTrade(userId)) {
        return {
          ok: false,
          reason: "insider — can influence this resolution; route to attestation, not trading",
        };
      }
      const cost = this.amm.buy(outcome, shares);
      this.trades.push({ userId, outcome, shares, cost, at: Date.now() });
      return { ok: true, cost, prices: this.amm.prices() };
    },

    prices() {
      return this.amm.prices();
    },
  };
}

module.exports = { createMarket };
