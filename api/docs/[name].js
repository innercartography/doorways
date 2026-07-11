/**
 * api/docs/[name].js — markdown content negotiation.
 *
 * Same URL, two representations: an agent asking for text/markdown (or any
 * non-browser client that never sends text/html) gets the raw .md file, a
 * browser gets it wrapped in minimal readable HTML. No duplicated content,
 * one source of truth per doc.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const DOCS = {
  readme: path.join(ROOT, "README.md"),
  "one-pager": path.join(ROOT, "docs", "ONE-PAGER.md"),
  "resolution-spec": path.join(ROOT, "docs", "RESOLUTION-SPEC.md"),
  "demo-script": path.join(ROOT, "docs", "DEMO-SCRIPT.md"),
};

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapHtml(name, md) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Two Doorways — ${escapeHtml(name)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{max-width:780px;margin:2rem auto;padding:0 1.5rem;font-family:-apple-system,system-ui,sans-serif;color:#1a1a1a;line-height:1.55}
  pre{white-space:pre-wrap;word-wrap:break-word;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.95rem}
  a{color:#0b5fff}
  .note{color:#666;font-size:0.85rem;margin-bottom:1.5rem}
</style></head>
<body>
<p class="note">Raw markdown, agent-friendly: <a href="?format=md">?format=md</a>, or send <code>Accept: text/markdown</code>.</p>
<pre>${escapeHtml(md)}</pre>
</body></html>`;
}

module.exports = (req, res) => {
  const name = req.query.name;
  const file = DOCS[name];
  if (!file) {
    res.status(404).end(`Unknown doc: ${name}. Available: ${Object.keys(DOCS).join(", ")}`);
    return;
  }

  const md = fs.readFileSync(file, "utf8");
  const accept = req.headers.accept || "";
  const wantsMarkdown = req.query.format === "md" || accept.includes("text/markdown") || !accept.includes("text/html");

  if (wantsMarkdown) {
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.status(200).end(md);
  } else {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).end(wrapHtml(name, md));
  }
};
