/**
 * middleware.mjs — extends markdown content negotiation (see api/docs/[name].js)
 * to the homepage itself. Edge runtime can't read files from disk, so instead
 * of duplicating logic here, an agent asking for text/markdown gets rewritten
 * to the same Node function that already serves README.md — one source of
 * truth, two entry points.
 *
 * .mjs (not .js) because this project's package.json has no "type": "module"
 * — the api/*.js functions are CommonJS and stay that way; only this file
 * needs ESM, per Vercel's edge middleware requirement.
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
