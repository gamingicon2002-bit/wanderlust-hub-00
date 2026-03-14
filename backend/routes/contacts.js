const router = require("express").Router();
const Contact = require("../models/Contact");
const { auth, adminOnly } = require("../middleware/auth");

// GET /api/contacts (admin)
router.get("/", auth, adminOnly, async (req, res) => {
  try { res.json(await Contact.find().sort("-created_at")); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/contacts (public)
router.post("/", async (req, res) => {
  try { res.status(201).json(await Contact.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await Contact.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
