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
    // Params resolveCPIMarket() actually reads:
    seriesId: "CUURS49BSA0",
    currentPeriod: { year: 2026, period: "M10" },
    priorPeriod: { year: 2025, period: "M10" },
    formulaMultiplier: 0.6,
    thresholdPct: 2.0,
  }),
});

// Market 2 — permit market. Settles live on stage from DataSF.
// Permit #202512101388, 915 Bryant St (SoMa) — new 8-story mixed-use residential
// build, 14 units. Filed 2025-12-10, still "triage" as of this writing: genuine
// uncertainty, and exactly the uncapped/new-build tier the domain edge names.
const permitMarket = createMarket({
  id: "permit-915-bryant-issued",
  question: "Will permit #202512101388 (915 Bryant St) reach 'issued' status by 2026-09-01?",
  recipe: makeRecipe("API_RESOLVED", {
    source: "DataSF p4e4-a5a7",
    field: "current_status == 'issued'",
    resolvesOn: "2026-09-01",
    // Params resolvePermitMarket() actually reads:
    permitNumber: "202512101388",
    targetStatus: "issued",
    deadlineISO: "2026-09-01",
  }),
  // Example of the fair/foul rule: the operator on this building can influence it.
  influencers: ["mike.operator"],
});

module.exports = { cpiMarket, permitMarket };
