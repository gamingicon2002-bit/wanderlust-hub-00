const router = require("express").Router();
const Review = require("../models/Review");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.reviewable_type) filter.reviewable_type = req.query.reviewable_type;
    if (req.query.reviewable_id) filter.reviewable_id = req.query.reviewable_id;
    if (req.query.status) filter.status = req.query.status;
    res.json(await Review.find(filter).sort("-created_at"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/reviews (public)
router.post("/", async (req, res) => {
  try { res.status(201).json(await Review.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/reviews/:id/status (admin)
router.put("/:id/status", auth, adminOnly, async (req, res) => {
  try { res.json(await Review.findByIdAndUpdate(req.params.id, { status: req.body.status, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await Review.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
