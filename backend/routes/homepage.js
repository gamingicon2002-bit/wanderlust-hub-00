const router = require("express").Router();
const HomepageSection = require("../models/HomepageSection");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const filter = req.query.active_only !== "false" ? { is_active: true } : {};
    res.json(await HomepageSection.find(filter).sort("sort_order"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:key", async (req, res) => {
  try {
    const s = await HomepageSection.findOne({ section_key: req.params.key });
    if (!s) return res.status(404).json({ error: "Section not found" });
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await HomepageSection.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await HomepageSection.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await HomepageSection.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
