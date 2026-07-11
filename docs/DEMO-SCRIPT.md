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
Scroll to section 07 ("The wire") on the deployed site and click **"Resolve
permit #202512101388 live"** — the trace narrates the real request to DataSF
on the projector. (Terminal fallback: `node src/oracles/datasf-permit.js`.)
"This settles from the city's own ledger — one field, zero human judgment.
No bookmaker. No dispute." (It'll read `resolved: false` — the building is
still in triage, which is the honest answer and the whole point: the market
isn't rigged to pay off on demo day.)

## 2:45–3:00 — The horizon
"A neighborhood is a tribe with concentrated knowledge. Give it an instrument and
its wisdom becomes legible — to itself, and to capital on its own terms. Play money
today, because the mechanism is the point."

## If there's time, or a judge asks "what's technically novel here"
Scroll to section 08. This site is dual-legible on purpose: `curl
<site>/api/markets` returns the same live data a human sees, and there's a real
MCP server at `/api/mcp` — not a REST endpoint dressed up as one, an actual
SEP-1649-discoverable server (`/.well-known/mcp.json`), tested with a real MCP
client. Built to the isitagentready.com checklist deliberately, including the
one category we score zero on by design: no commerce protocols, because the
markets are play money on purpose (regulatory picture unsettled) and bolting a
payment rail onto an unlicensed instrument would be the wrong kind of
"agent-ready." Section 08 has an explorable FAQ if a judge wants to poke at the why.

## Fallback
Both resolvers (`datasf-permit.js`, `bls-cpi.js`) already fail over to
`/data/permits-cache.json` and `/data/cpi-cache.json` automatically if the live
call errors — this was tested by killing `fetch` mid-run and confirming
identical resolution logic runs off the cache. Nothing to do live on stage; just
know that if wifi drops, the resolver output will say `source: ...cache...`
instead of the live DataSF/BLS URL, and that's expected, not a failure.

Re-run `node scripts/refresh-cache.js` during venue setup so the cache is as
fresh as possible before wifi becomes a risk.
