/**
 * middleware.js — extends markdown content negotiation (see api/docs/[name].js)
 * to the homepage itself. Edge runtime can't read files from disk, so instead
 * of duplicating logic here, an agent asking for text/markdown gets rewritten
 * to the same Node function that already serves README.md — one source of
 * truth, two entry points.
 *
 * Must be named exactly middleware.js/.ts (not .mjs) — Vercel only recognizes
 * that filename for Routing Middleware. ESM `import`/`export` here works
 * regardless of package.json's "type" field because middleware goes through
 * Vercel's own edge bundler, unlike the CommonJS api/*.js functions.
 */
import { rewrite, next } from "@vercel/functions";

export const config = { matcher: "/" };

export default function middleware(request) {
  const accept = request.headers.get("accept") || "";
  const wantsMarkdown = accept.includes("text/markdown") || !accept.includes("text/html");
  if (wantsMarkdown) {
    return rewrite(new URL("/api/docs/readme", request.url));
  }
  return next();
}
