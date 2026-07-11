# Two Doorways

**A hyperlocal prediction market that resolves from the city's own data — and knows the difference between an expert and an insider.**

Built for Frontier Forecast 2026 · SoMa, San Francisco.

---

## The one-liner

One market question has two doorways. To a trader tracking regional CPI, it's a mispriced probability to correct. To a tenant, it's insurance against next year's rent increase. Same shares, two motivations — accuracy from one side, purpose from the other. Neither is gambling.

## Why this, why here

Cities already know their own future — that knowledge is real, distributed, and unpriced. There's no instrument for it, only rumor. Two Doorways turns block-scale knowledge into a price, and settles it from public infrastructure instead of a bookmaker's say-so.

## The domain edge (the part nobody else in the room has)

San Francisco rent moves in three regulatory tiers, and knowing which is which separates a live market from a dead one:

| Tier | Behavior | Predictable? |
|------|----------|--------------|
| Rent Ordinance (pre-1979) | Increase = published CPI formula; landlords always max it in a hot market | **Deterministic — no market** |
| AB 1482 (state cap) | Capped at 5% + CPI; also maxed | **Deterministic — no market** |
| New builds (uncapped) | Increase is a real decision | **Genuine uncertainty** |

So the uncertainty doesn't live in "will rent rise." It lives **upstream** in the CPI input that sets every capped increase, and **downstream** in the uncapped tier. We build markets on those two, not the dead middle.

## The oracle recipe (how trust is specified, not assumed)

Every market ships with a declared resolution method, visible before you trade:

1. **API-resolved** *(live on stage)* — permits settle from DataSF `p4e4-a5a7`; CPI markets from the BLS release. One field, zero human judgment.
2. **Public-data-computed** — rent buckets from the Rent Board Housing Inventory (`gdc7-dmcn`): authoritative, penalty-of-perjury, but annual and coarse. Method published up front.
3. **Attestation** — storefront closures via staked local observers. Subjective, small-scale — the frontier problem, named honestly rather than faked.

The tier *is* the honesty. We price the trustworthy-but-slow vs. fast-but-proprietary tradeoff instead of hiding it.

## The innovation: insiders attest, outsiders trade

Some knowledge is expertise; some is influence over the outcome. A market has to tell them apart.

- **Fair (expertise):** knowing the CPI formula sets capped increases. Public rules, privately understood. Belongs in trading.
- **Foul (influence):** knowing you're about to re-list a specific unit at market. Private action you control. Belongs in attestation, never trading.

Participants who can move a resolution are flagged — barred from trading it, routed to attest instead. Being an insider becomes a **credential**, not a weapon. This is the conflict-of-interest problem a property operator feels from the inside, turned into a mechanism.

## What we ship today

- **Create** — a market factory: pose a neighborhood question, attach a declared oracle recipe.
- **Trade** — a play-money automated market maker (LMSR) quotes a live price, no counterparty needed. Accuracy scored in reputation, not dollars → no regulatory exposure.
- **Resolve** — the permit market settles live from DataSF, end to end, on stage.

Two live SoMa markets. One resolution you can watch happen. **Play money on purpose** — the real-money regulatory picture (Kalshi/CFTC) is unsettled, and our contribution is the mechanism, not the wagering.

## The horizon

A neighborhood is a tribe with concentrated knowledge. Give it an instrument and its wisdom becomes legible — to itself first, and to capital on the tribe's terms. Later: autonomous resolvers with onchain identity, staked reputation, and provenance for every settlement. Instruments, not oracles-by-decree.

*Places hold knowledge. This makes it tradable without making it extractable.*

---

## Repo map

```
two-doorways/
├── README.md                  ← you are here (also the pitch)
├── src/
│   ├── markets/               ← market factory + market definitions
│   │   ├── factory.js         ← create a market from (question, oracle recipe)
│   │   └── examples.js        ← the two live SoMa markets (CPI + permit)
│   ├── amm/
│   │   └── lmsr.js            ← play-money pricing (cost fn, price, buy/sell)
│   ├── oracles/
│   │   ├── recipe.js         ← recipe interface + the 3 recipe types
│   │   ├── datasf-permit.js  ← LIVE resolver — reads DataSF p4e4-a5a7
│   │   └── bls-cpi.js        ← CPI resolver stub
│   └── ui/
│       └── index.html        ← the Two Doorways scrollytelling explainer
├── data/                      ← cached API responses for offline demo safety
└── docs/
    ├── ONE-PAGER.md          ← the required one-page summary
    ├── DEMO-SCRIPT.md        ← 3-minute live demo runbook
    └── RESOLUTION-SPEC.md    ← exact settlement rules per market
```

## Run

```bash
# Static UI — just open it
open src/ui/index.html

# Test the live permit resolver against DataSF (no API key needed)
node src/oracles/datasf-permit.js
```

## Deliverables checklist (per hackathon guide)

- [ ] GitHub repository
- [ ] 3-minute demo (see `docs/DEMO-SCRIPT.md`)
- [ ] 5-slide presentation
- [ ] One-page project summary (`docs/ONE-PAGER.md`)
- [x] Live demo — permit market resolves from DataSF on stage

## Scoring map (how each piece earns points)

| Criterion | Weight | Where we win it |
|-----------|--------|-----------------|
| Real-world Impact | 25% | Three-tier domain edge; renter-hedge use case; public-data settlement |
| Technical Execution | 25% | Working LMSR + live DataSF resolution end-to-end |
| Innovation | 20% | Insiders-attest-outsiders-trade; declared oracle recipes |
| Market Potential | 20% | Tribe-scale markets; agent resolvers horizon |
| Presentation | 10% | Scrollytelling explainer + tight deck |
