# Two Doorways — One-Page Summary

**Frontier Forecast 2026 · SoMa, San Francisco**

## Problem
Cities hold enormous, distributed knowledge about their own near future — which storefronts will close, how rents will move, which permits will issue. This knowledge is real but unpriced; there's no instrument for it, only rumor. Existing prediction markets skew toward entertainment and stumble on the hard part: **resolution** (who declares the truth, and can you trust them?).

## Solution
A hyperlocal prediction market with three ideas that reinforce each other:

1. **Two doorways.** One market serves a trader (a mispriced probability to correct) and a resident (insurance against a bad outcome). Accuracy from one side, purpose from the other.
2. **Declared oracle recipes.** Every market ships with a vetted, standardized resolution method — API-resolved, public-data-computed, or attestation — visible *before* trading. The tier is the honesty.
3. **Insiders attest, outsiders trade.** We separate fair edges (understanding public rules) from foul ones (controlling private outcomes). Anyone who can move a resolution is barred from trading it and routed to attestation. Being an insider becomes a credential, not a weapon.

## The domain edge
SF rent moves in three regulatory tiers. The capped tiers (Rent Ordinance, AB 1482) are deterministic — landlords always max the allowable increase — so there's no market there. Real uncertainty lives **upstream** (the CPI input that sets capped increases) and **downstream** (uncapped new builds). We build on those, not the dead middle. This is knowledge only an operator brings.

## What we built
- A play-money **LMSR market maker** (bounded-loss subsidy → liquid thin markets).
- A **market factory** enforcing the insider/outsider trading gate.
- A **live DataSF resolver** (`p4e4-a5a7`) that settles a permit market on stage from the city's own ledger.
- Two live SoMa markets: an allowable-increase CPI market and a permit-status market.

## Why play money
The real-money regulatory picture (Kalshi/CFTC) is unsettled. Play money sidesteps it entirely and keeps the focus on the mechanism — which is the contribution.

## Impact
Better block-scale forecasting creates real economic and social value: renters hedge, operators plan, capital sees signal it can't otherwise price — without extracting the underlying knowledge. *Places hold knowledge. This makes it tradable without making it extractable.*

## Team
Michael Lopez (real estate / property operations, InnerCartography) + finance teammate.
