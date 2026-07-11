/**
 * examples.js — the two live SoMa markets we demo.
 */

const { createMarket } = require("./factory");
const { makeRecipe } = require("../oracles/recipe");

// Market 1 — CPI / allowable-increase macro market. Genuine uncertainty upstream.
const cpiMarket = createMarket({
  id: "sf-allowable-2027",
  question: "Will the SF Rent Board allowable increase for 2027 exceed 2.0%?",
  recipe: makeRecipe("API_RESOLVED", {
    source: "BLS CPI-U, SF-Oakland-Hayward, 12mo ending Oct 2026",
    formula: "60% of regional CPI change, per Rent Ordinance",
    resolvesOn: "2026-11 (BLS release)",
  }),
});

// Market 2 — permit market. Settles live on stage from DataSF.
const permitMarket = createMarket({
  id: "permit-somasq-issued",
  question: "Will permit <TBD> reach 'issued' status by 2026-09-01?",
  recipe: makeRecipe("API_RESOLVED", {
    source: "DataSF p4e4-a5a7",
    field: "current_status == 'issued'",
    resolvesOn: "2026-09-01",
  }),
  // Example of the fair/foul rule: the operator on this building can influence it.
  influencers: ["mike.operator"],
});

module.exports = { cpiMarket, permitMarket };
