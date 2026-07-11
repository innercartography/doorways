/**
 * dev-server.js — minimal local stand-in for `vercel dev` that needs no login.
 * Serves public/ statically, routes /api/* to the same handler files Vercel
 * would use, and replicates the vercel.json rewrites. Good enough to verify
 * behavior before a real deploy; not a production server.
 *
 * Usage: node scripts/dev-server.js [port=3000]
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const PORT = Number(process.argv[2]) || 3000;

const MIME = { ".html": "text/html", ".txt": "text/plain", ".xml": "application/xml", ".json": "application/json" };

const REWRITES = {
  "/one-pager": "/api/docs/one-pager",
  "/resolution-spec": "/api/docs/resolution-spec",
  "/demo-script": "/api/docs/demo-script",
  "/readme": "/api/docs/readme",
};

function vercelifyRes(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(body)); return res; };
  return res;
}

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.method !== "POST") return resolve(undefined);
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : undefined); } catch { resolve(undefined); }
    });
  });
}

function serveStatic(reqPath, res) {
  let filePath = path.join(PUBLIC, decodeURIComponent(reqPath));
  if (reqPath === "/") filePath = path.join(PUBLIC, "index.html");
  // mirror vercel.json's "cleanUrls": true — /agent -> public/agent.html
  if ((!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) && fs.existsSync(filePath + ".html")) {
    filePath += ".html";
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404); res.end("Not found: " + reqPath); return;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  vercelifyRes(res);
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = REWRITES[url.pathname] || url.pathname;

  req.query = Object.fromEntries(url.searchParams);
  req.body = await parseBody(req);

  try {
    if (pathname === "/api/markets") {
      return require(path.join(ROOT, "api", "markets", "index.js"))(req, res);
    }
    let m = pathname.match(/^\/api\/markets\/([^/]+)\/resolve$/);
    if (m) { req.query.id = m[1]; return require(path.join(ROOT, "api", "markets", "[id]", "resolve.js"))(req, res); }
    m = pathname.match(/^\/api\/markets\/([^/]+)\/trade$/);
    if (m) { req.query.id = m[1]; return require(path.join(ROOT, "api", "markets", "[id]", "trade.js"))(req, res); }
    m = pathname.match(/^\/api\/markets\/([^/]+)\/attest$/);
    if (m) { req.query.id = m[1]; return require(path.join(ROOT, "api", "markets", "[id]", "attest.js"))(req, res); }
    m = pathname.match(/^\/api\/markets\/([^/]+)$/);
    if (m) { req.query.id = m[1]; return require(path.join(ROOT, "api", "markets", "[id]", "index.js"))(req, res); }
    if (pathname === "/api/mcp") {
      return require(path.join(ROOT, "api", "mcp.js"))(req, res);
    }
    if (pathname === "/api/activity") {
      return require(path.join(ROOT, "api", "activity.js"))(req, res);
    }
    if (pathname === "/api/starter-pack") {
      return require(path.join(ROOT, "api", "starter-pack.js"))(req, res);
    }
    m = pathname.match(/^\/api\/docs\/([^/]+)$/);
    if (m) { req.query.name = m[1]; return require(path.join(ROOT, "api", "docs", "[name].js"))(req, res); }

    return serveStatic(pathname, res);
  } catch (err) {
    console.error(err);
    res.writeHead(500); res.end("Internal error: " + err.message);
  }
});

server.listen(PORT, () => console.log(`Dev server: http://localhost:${PORT}`));
