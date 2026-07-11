const { listMarkets } = require("../_lib/registry");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.status(405).json({ error: "GET only" });
    return;
  }
  res.status(200).json({ markets: await listMarkets() });
};
