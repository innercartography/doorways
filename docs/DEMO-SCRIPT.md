# 3-Minute Demo Script

**Goal:** show the mechanism working, land the domain edge, resolve live.

## 0:00–0:30 — The hook (scrollytelling UI open)
"Cities already know their own future — a property manager knows which storefronts
will go dark. That knowledge is unpriced. We built the instrument." Scroll to the
market card. Drag the slider: "The price *is* the probability."

## 0:30–1:15 — The domain edge (scene 03)
"Not all rent is uncertain." Walk the three tiers. "The capped tiers are
deterministic — landlords max the allowable increase every year, so there's no
market. The uncertainty is in the CPI input and the uncapped tier. Knowing that is
the difference between a live market and a dead one." (This is the credibility beat.)

## 1:15–2:00 — Trade it (live, in terminal or UI)
Run a couple of outsider trades on the CPI market; show prices move.
Then: "Now watch what happens when an insider — the operator who can influence a
permit — tries to trade it." Run the permit trade → blocked, routed to attestation.
"Insiders attest. Outsiders trade. That's the conflict-of-interest problem, solved."

## 2:00–2:45 — Resolve it LIVE
`node src/oracles/datasf-permit.js` → real permit statuses stream from DataSF.
"This settles from the city's own ledger — one field, zero human judgment.
No bookmaker. No dispute."

## 2:45–3:00 — The horizon
"A neighborhood is a tribe with concentrated knowledge. Give it an instrument and
its wisdom becomes legible — to itself, and to capital on its own terms. Play money
today, because the mechanism is the point."

## Fallback
If venue wifi drops, use cached responses in /data. Never let the live call be the
single point of failure — pre-fetch during setup.
