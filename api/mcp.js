/**
 * api/mcp.js — a real MCP server (SEP-1649 discoverable via /.well-known/mcp.json),
 * not a REST endpoint dressed up as one. Stateless streamable-HTTP transport per the
 * SDK's documented serverless pattern: a fresh McpServer + transport per request,
 * since a Vercel function can't hold a persistent session between invocations.
 *
 * Same underlying registry as the REST API (api/_lib/registry.js) — one set of
 * tested market logic, two protocol surfaces.
 */

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { z } = require("zod");
const { listMarkets, getEntry, summarize } = require("./_lib/registry");
const { placeTrade } = require("./_lib/tradelog");

function textResult(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function buildServer() {
  const server = new McpServer({ name: "two-doorways", version: "1.0.0" }, { capabilities: { tools: {} } });

  server.registerTool(
    "list_markets",
    { description: "List all live Two Doorways prediction markets with their current LMSR prices and declared oracle recipe." },
    async () => textResult({ markets: await listMarkets() })
  );

  server.registerTool(
    "get_market",
    {
      description: "Get one market's question, current price, and declared resolution recipe.",
      inputSchema: { marketId: z.string().describe("e.g. 'permit-915-bryant-issued' or 'sf-allowable-2027'") },
    },
    async ({ marketId }) => {
      const entry = getEntry(marketId);
      if (!entry) return textResult({ error: `unknown market id: ${marketId}` });
      return textResult(await summarize(entry.market));
    }
  );

  server.registerTool(
    "resolve_market",
    {
      description:
        "Resolve a market live against its declared source (DataSF for the permit market, BLS CPI for the allowable-increase market). Returns resolved:false with evidence if the real-world outcome isn't settled yet — that is the honest answer, not an error.",
      inputSchema: { marketId: z.string() },
    },
    async ({ marketId }) => {
      const entry = getEntry(marketId);
      if (!entry) return textResult({ error: `unknown market id: ${marketId}` });
      return textResult(await entry.resolve());
    }
  );

  server.registerTool(
    "trade",
    {
      description:
        "Buy shares of an outcome on a market. Blocked with an explanation if the caller is flagged as an insider on that specific market (can influence its resolution) — insiders attest, they don't trade. Trades persist in a shared log (Vercel Blob) — every caller, human or agent, sees the same price.",
      inputSchema: {
        marketId: z.string(),
        userId: z.string().describe("your agent or user identifier"),
        outcome: z.enum(["YES", "NO"]),
        shares: z.number().positive(),
      },
    },
    async ({ marketId, userId, outcome, shares }) => {
      const entry = getEntry(marketId);
      if (!entry) return textResult({ error: `unknown market id: ${marketId}` });
      if (!entry.market.canTrade(userId)) {
        return textResult({
          ok: false,
          reason: "insider — can influence this resolution; route to attestation, not trading",
          note: "insider gate: blocked from trading, routed to attestation",
        });
      }
      const { cost, after, tradeCount } = await placeTrade(entry.market.id, entry.market.amm.b, userId, outcome, shares);
      return textResult({ ok: true, cost, prices: after, tradeCount });
    }
  );

  return server;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed. POST JSON-RPC to this endpoint." }, id: null });
    return;
  }

  try {
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (err) {
    console.error("MCP request error:", err);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
    }
  }
};
