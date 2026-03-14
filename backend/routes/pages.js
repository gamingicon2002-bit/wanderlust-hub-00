const router = require("express").Router();
const Page = require("../models/Page");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const filter = req.query.active_only === "true" ? { is_active: true } : {};
    res.json(await Page.find(filter).sort("title"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const p = await Page.findOne({ slug: req.params.slug, is_active: true });
    if (!p) return res.status(404).json({ error: "Page not found" });
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Page.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await Page.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await Page.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
