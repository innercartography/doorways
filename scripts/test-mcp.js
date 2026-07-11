const http = require("http");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StreamableHTTPClientTransport } = require("@modelcontextprotocol/sdk/client/streamableHttp.js");

const handler = require("../api/mcp.js");

// Polyfill the Vercel Node runtime's res.status().json() helpers, which a
// plain http.ServerResponse doesn't have, for this local test harness only.
function vercelifyRes(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    if (!res.headersSent) res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
    return res;
  };
  return res;
}

function withBodyParsing(fn) {
  return (req, res) => {
    vercelifyRes(res);
    if (req.method !== "POST") return fn(req, res);
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        req.body = raw ? JSON.parse(raw) : undefined;
      } catch {
        req.body = undefined;
      }
      fn(req, res);
    });
  };
}

const server = http.createServer(withBodyParsing(handler));

server.listen(4141, async () => {
  try {
    const transport = new StreamableHTTPClientTransport(new URL("http://localhost:4141/mcp"));
    const client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(transport);

    console.log("=== tools/list ===");
    const tools = await client.listTools();
    console.log(tools.tools.map((t) => t.name));

    console.log("\n=== tools/call list_markets ===");
    const listResult = await client.callTool({ name: "list_markets", arguments: {} });
    console.log(listResult.content[0].text);

    console.log("\n=== tools/call resolve_market (live permit) ===");
    const resolveResult = await client.callTool({ name: "resolve_market", arguments: { marketId: "permit-915-bryant-issued" } });
    console.log(resolveResult.content[0].text);

    console.log("\n=== tools/call trade (insider blocked) ===");
    const tradeBlocked = await client.callTool({
      name: "trade",
      arguments: { marketId: "permit-915-bryant-issued", userId: "mike.operator", outcome: "YES", shares: 5 },
    });
    console.log(tradeBlocked.content[0].text);

    console.log("\nALL GREEN");
  } catch (e) {
    console.error("TEST FAILED:", e);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
