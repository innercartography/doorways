const { getEntry } = require("../../_lib/registry");

module.exports = async (req, res) => {
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
  const result = await entry.resolve();
  res.status(200).json(result);
};
