/**
 * registry.js — maps a market id to its live market object + resolver.
 * Shared by the REST API and the MCP server so both surfaces stay in sync
 * with the exact same tested logic (no duplicated resolution rules).
 */

const { permitMarket, cpiMarket } = require("../../src/markets/examples");
const { resolvePermitMarket } = require("../../src/oracles/datasf-permit");
const { resolveCPIMarket } = require("../../src/oracles/bls-cpi");

const MARKETS = {
  [permitMarket.id]: { market: permitMarket, resolve: () => resolvePermitMarket(permitMarket.recipe.params) },
  [cpiMarket.id]: { market: cpiMarket, resolve: () => resolveCPIMarket(cpiMarket.recipe.params) },
};

function listMarkets() {
  return Object.values(MARKETS).map(({ market }) => summarize(market));
}

function summarize(market) {
  return {
    id: market.id,
    question: market.question,
    prices: market.prices(),
    recipe: { label: market.recipe.label, trust: market.recipe.trust, note: market.recipe.note },
  };
}

function getEntry(id) {
  return MARKETS[id] || null;
}

module.exports = { MARKETS, listMarkets, summarize, getEntry };
