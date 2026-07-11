/**
 * recipe.js — the "oracle recipe" abstraction.
 *
 * A recipe is a declared, standardized resolution method chosen from a menu,
 * NOT hand-written per market. This is what makes market creation safe: a
 * creator can't invent a sketchy resolution rule, only pick a vetted recipe
 * and supply its parameters.
 */

const RECIPE_TYPES = {
  API_RESOLVED: {
    id: "api_resolved",
    trust: "high",
    label: "API-resolved",
    note: "Settles from a named public endpoint. One field, zero human judgment.",
  },
  PUBLIC_COMPUTED: {
    id: "public_computed",
    trust: "medium",
    label: "Public-data-computed",
    note: "Settles from a published dataset + a published computation method.",
  },
  ATTESTATION: {
    id: "attestation",
    trust: "contingent",
    label: "Attestation",
    note: "Settles from staked observers. Subjective; small-scale only.",
  },
};

/** A market must declare its recipe up front, before trading opens. */
function makeRecipe(type, params) {
  if (!RECIPE_TYPES[type]) throw new Error(`Unknown recipe type: ${type}`);
  return { ...RECIPE_TYPES[type], params, declaredAt: new Date().toISOString() };
}

module.exports = { RECIPE_TYPES, makeRecipe };
