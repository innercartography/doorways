/**
 * registry.js — maps a market id to its live market object + resolver.
 * Shared by the REST API and the MCP server so both surfaces stay in sync
 * with the exact same tested logic (no duplicated resolution rules).
 */

const { permitMarket, cpiMarket } = require("../../src/markets/examples");
const { resolvePermitMarket } = require("../../src/oracles/datasf-permit");
const { resolveCPIMarket } = require("../../src/oracles/bls-cpi");
const { currentPrices } = require("./tradelog");

const MARKETS = {
  [permitMarket.id]: { market: permitMarket, resolve: () => resolvePermitMarket(permitMarket.recipe.params) },
  [cpiMarket.id]: { market: cpiMarket, resolve: () => resolveCPIMarket(cpiMarket.recipe.params) },
};

async function listMarkets() {
  return Promise.all(Object.values(MARKETS).map(({ market }) => summarize(market)));
}

/**
 * Prices come from the durable trade log (api/_lib/tradelog.js), not the
 * market object's in-memory LMSR — that copy resets every cold start and
 * isn't shared across concurrent function instances.
 */
async function summarize(market) {
  const { prices, tradeCount } = await currentPrices(market.id, market.amm.b);
  return {
    id: market.id,
    question: market.question,
    prices,
    tradeCount,
    recipe: { label: market.recipe.label, trust: market.recipe.trust, note: market.recipe.note },
  };
}

function getEntry(id) {
  return MARKETS[id] || null;
}

module.exports = { MARKETS, listMarkets, summarize, getEntry };
