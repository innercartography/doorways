/**
 * lmsr.js — Logarithmic Market Scoring Rule, the standard AMM for prediction markets.
 *
 * Why LMSR: it always quotes a price (no counterparty needed), the price is a
 * calibrated probability, and the market maker's total loss is bounded by b*ln(n).
 * That bounded loss is exactly what a play-money "subsidy" is — it's what makes a
 * thin market liquid enough to produce signal. Perfect for a demo.
 *
 * State = share quantities per outcome. Two-outcome (YES/NO) here.
 */

class LMSR {
  /** @param {number} b liquidity parameter — higher = deeper, more subsidy */
  constructor(b = 100) {
    this.b = b;
    this.q = { YES: 0, NO: 0 };
  }

  /** Cost function C(q) = b * ln( sum exp(q_i / b) ) */
  cost(q = this.q) {
    const terms = Object.values(q).map((x) => Math.exp(x / this.b));
    return this.b * Math.log(terms.reduce((a, c) => a + c, 0));
  }

  /** Instantaneous price of an outcome = its share of the softmax. Sums to 1. */
  price(outcome) {
    const terms = Object.fromEntries(
      Object.entries(this.q).map(([k, v]) => [k, Math.exp(v / this.b)])
    );
    const total = Object.values(terms).reduce((a, c) => a + c, 0);
    return terms[outcome] / total;
  }

  /** Cost to buy `shares` of `outcome` = C(q after) - C(q before). */
  costToBuy(outcome, shares) {
    const before = this.cost();
    const after = { ...this.q, [outcome]: this.q[outcome] + shares };
    return this.cost(after) - before;
  }

  /** Execute a buy; returns the play-money cost. */
  buy(outcome, shares) {
    const c = this.costToBuy(outcome, shares);
    this.q[outcome] += shares;
    return c;
  }

  prices() {
    return { YES: this.price("YES"), NO: this.price("NO") };
  }
}

module.exports = { LMSR };

if (require.main === module) {
  const m = new LMSR(100);
  console.log("Start:", m.prices());                      // 50/50
  console.log("Buy 50 YES costs:", m.buy("YES", 50).toFixed(2));
  console.log("After:", m.prices());                      // YES drifts up
  console.log("Buy 120 NO costs:", m.buy("NO", 120).toFixed(2));
  console.log("After:", m.prices());                      // NO overtakes
}
