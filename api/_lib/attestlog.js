/**
 * attestlog.js — the other half of "insiders attest, outsiders trade."
 *
 * Same event-sourced pattern as tradelog.js: an immutable blob per record,
 * discovered via list(), no read-modify-write. Attestations carry a staked
 * confidence (reputation points, not money) instead of an LMSR cost — this
 * is deliberately not wired into resolution yet. A stub that proves the
 * gate has somewhere real to route insiders, honestly labeled as a stub,
 * beats pretending it affects settlement when it doesn't.
 */

const { put, list } = require("@vercel/blob");

function prefixFor(marketId) {
  return `attestations/${marketId}/`;
}

function keyFor(record) {
  const ts = String(record.at).padStart(14, "0");
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefixFor(record.marketId)}${ts}-${rand}.json`;
}

async function appendAttestation(record) {
  await put(keyFor(record), JSON.stringify(record), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
  return record;
}

async function listAttestations(marketId) {
  const { blobs } = await list({ prefix: prefixFor(marketId) });
  const sorted = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
  return Promise.all(sorted.map((b) => fetch(b.url).then((r) => r.json())));
}

async function recentAttestations(limit = 30) {
  const { blobs } = await list({ prefix: "attestations/" });
  const sorted = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname)).slice(0, limit);
  return Promise.all(sorted.map((b) => fetch(b.url).then((r) => r.json())));
}

module.exports = { appendAttestation, listAttestations, recentAttestations };
