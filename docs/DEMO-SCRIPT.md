# 3-Minute Demo Script

**Spine (four beats, no detours):** renter checks their number → trader
corrects the price → insider gets gated, attests instead → market resolves
live. Everything else is backup material, not part of the walk.

## 0:00–0:40 — The renter's number (most legible impact, lead with it)
Open the hero. "Two live SF markets, settled from the city's own data —
not a bookmaker's say-so." Scroll to the market card: "Here's Doorway
Two — the renter's read. Not a trade, not a hedge, just the crowd's live
odds your rent jumps more than 2% next year, for free, before the Rent
Board makes it official in November." Point at the QR: "Scan it, or go to
two-doorways.vercel.app/agent."

## 0:40–1:30 — The trader corrects the price (the room does this, live)
"Same number, second doorway: someone who thinks the crowd is wrong can
trade it." Let a judge or two actually scan and tap "run it now" on
`/agent` while you keep talking — their trade lands in the shared market
and moves the live feed on the projector within seconds. "That's not a
per-person sandbox — everyone just hit the same price."

## 1:30–2:15 — The insider gets gated, and attests instead
"Now watch what happens when someone who can *influence* the outcome
tries to trade it." Tap the insider button on `/agent` — one tap runs
both halves live: blocked from trading (403), then automatically routed
to attest instead — a staked claim, reputation not money, visible in the
same feed a second later, labeled as an attestation, not a trade.
"Insiders attest, outsiders trade. That's not a slogan — you just watched
the block *and* the alternative path both fire, live."

## 2:15–3:00 — Resolve it LIVE
Scroll to "The wire" and click **resolve permit #202512101388 live** —
narrates the real request to DataSF on the projector. "Settles from the
city's own ledger — one field, zero human judgment." (It may read
`resolved: false` — the building's still in triage. That's the honest
answer, not a bug: the market isn't rigged to pay off on demo day.)

## If there's time, or a judge asks "what's technically novel here"
Section 08 on the live page: dual-legible on purpose — `curl
<site>/api/markets` returns the same live data a human sees, a real MCP
server at `/api/mcp` (SEP-1649-discoverable, tested with a real client),
and a deliberate zero on commerce protocols (play money on purpose,
Kalshi/CFTC picture unsettled) — explained, not hidden, in the page's own
FAQ.

## Cut from this pass, on purpose
No "horizon"/"tribes with concentrated knowledge" language on stage —
that's our internal shorthand, not something to spend judge-seconds
translating live. It stays in the README for anyone who reads deeper.

## Fallback
Both resolvers fail over to `/data/*-cache.json` automatically if the
live call errors — tested by killing `fetch` mid-run. If wifi drops on
stage, the resolver output will just say `source: ...cache...` instead of
the live URL — that's expected, say so out loud, don't apologize for it.

Re-run `node scripts/refresh-cache.js` during venue setup so the cache is
as fresh as possible before wifi becomes a risk.
