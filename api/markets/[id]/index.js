const { getEntry, summarize } = require("../../_lib/registry");

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.status(405).json({ error: "GET only" });
    return;
  }
  const entry = getEntry(req.query.id);
  if (!entry) {
    res.status(404).json({ error: `unknown market id: ${req.query.id}` });
    return;
  }
  res.status(200).json(summarize(entry.market));
};
