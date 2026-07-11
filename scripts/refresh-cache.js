/**
 * refresh-cache.js — re-fetch live DataSF + BLS data into /data as the offline
 * fallback for the resolvers. Run this once during venue setup, right before
 * going on stage, so the cache is as fresh as possible if wifi then drops.
 *
 * Usage: node scripts/refresh-cache.js
 */

const fs = require("fs");
const path = require("path");
const { permitMarket, cpiMarket } = require("../src/markets/examples");

const DATA_DIR = path.join(__dirname, "..", "data");
const PERMIT_DATASET = "https://data.sfgov.org/resource/p4e4-a5a7.json";
const BLS_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data";

async function main() {
  const permitNumber = permitMarket.recipe.params.permitNumber;

  const primary = await (await fetch(`${PERMIT_DATASET}?permit_number=${permitNumber}`)).json();
  const recentSoMa = await (
    await fetch(`${PERMIT_DATASET}?$where=neighborhoods_analysis_boundaries='South of Market'&$order=filed_date DESC&$limit=5`)
  ).json();
  fs.writeFileSync(
    path.join(DATA_DIR, "permits-cache.json"),
    JSON.stringify({ fetchedAt: new Date().toISOString(), primary, recentSoMa }, null, 2)
  );

  const seriesId = cpiMarket.recipe.params.seriesId;
  const cpiData = await (await fetch(`${BLS_URL}/${seriesId}`)).json();
  fs.writeFileSync(
    path.join(DATA_DIR, "cpi-cache.json"),
    JSON.stringify({ fetchedAt: new Date().toISOString(), seriesID: seriesId, ...cpiData }, null, 2)
  );

  console.log("Refreshed data/permits-cache.json and data/cpi-cache.json");
}

main().catch((e) => {
  console.error("Cache refresh failed:", e.message);
  process.exit(1);
});
