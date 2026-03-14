const router = require("express").Router();
const Hotel = require("../models/Hotel");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.destination) filter.destination = req.query.destination;
    if (req.query.is_active !== undefined) filter.is_active = req.query.is_active === "true";
    res.json(await Hotel.find(filter).sort("-created_at"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const h = await Hotel.findById(req.params.id);
    if (!h) return res.status(404).json({ error: "Not found" });
    res.json(h);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Hotel.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await Hotel.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await Hotel.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
