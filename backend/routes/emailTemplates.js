const router = require("express").Router();
const EmailTemplate = require("../models/EmailTemplate");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.template_type) filter.template_type = req.query.template_type;
    res.json(await EmailTemplate.find(filter).sort("name"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", auth, adminOnly, async (req, res) => {
  try {
    const item = await EmailTemplate.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await EmailTemplate.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await EmailTemplate.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await EmailTemplate.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
