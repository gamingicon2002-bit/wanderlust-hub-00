const router = require("express").Router();
const Destination = require("../models/Destination");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try { res.json(await Destination.find().sort("-created_at")); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const d = await Destination.findById(req.params.id);
    if (!d) return res.status(404).json({ error: "Not found" });
    res.json(d);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Destination.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await Destination.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await Destination.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
