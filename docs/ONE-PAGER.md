# Two Doorways — One-Page Summary

**Frontier Forecast 2026 · SoMa, San Francisco**

## Problem
Cities hold enormous, distributed knowledge about their own near future — which storefronts will close, how rents will move, which permits will issue. This knowledge is real but unpriced; there's no instrument for it, only rumor. Existing prediction markets skew toward entertainment and stumble on the hard part: **resolution** (who declares the truth, and can you trust them?).

## Solution
A hyperlocal prediction market with three ideas that reinforce each other:

1. **Two doorways.** One market serves a trader (a mispriced probability to correct) and a resident (an early, free read on what's coming — before it's official). Accuracy from one side, foresight from the other.
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

## Market potential
Two buyers, two timelines, one flywheel. **Operators (sooner):** ~97% of SF's rental stock is small independent owners, not institutional funds with CoStar and in-house analysts — DataSF gives them a status lookup, not a forecast; we sell the neighborhood's aggregated tacit knowledge (contractors, brokers, neighbors) as a calibrated probability, which works on reputation alone, no real money required, no regulatory exposure. The insider gate is what makes it sellable instead of just gossip. **Renters (viral, free):** the same CPI market's live price becomes a free, shareable stat — "here's the crowd's odds your rent jumps next year" — no payout, no hedge, no insurance question (we considered and killed a literal rent hedge: paying out on your own rent rising reads as personal-loss indemnification, i.e. insurance, a much harder regulatory bar). It's the growth loop: renters checking their number seed the participant density that makes the operator signal worth paying for.

## Impact
Better block-scale forecasting creates real economic and social value, without extracting the underlying knowledge — the neighborhood's own dispersed judgment becomes visible to itself and to the people who currently have no way to access it. *Places hold knowledge. This makes it tradable without making it extractable.*

## Team
Michael Lopez (real estate / property operations, InnerCartography) + finance teammate.
