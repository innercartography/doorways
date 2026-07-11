const { listMarkets } = require("../_lib/registry");

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.status(405).json({ error: "GET only" });
    return;
  }
  res.status(200).json({ markets: listMarkets() });
};
