const router = require("express").Router();
const Gallery = require("../models/Gallery");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    res.json(await Gallery.find(filter).sort("sort_order"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Gallery.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await Gallery.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
