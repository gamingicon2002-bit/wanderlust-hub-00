const router = require("express").Router();
const Vehicle = require("../models/Vehicle");
const { auth, adminOnly } = require("../middleware/auth");

// GET /api/vehicles
router.get("/", async (req, res) => {
  try {
    const { type, sub_type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (sub_type) filter.sub_type = sub_type;
    const vehicles = await Vehicle.find(filter).sort("-created_at");
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/:id
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles (admin)
router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/vehicles/:id (admin)
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/vehicles/:id (admin)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
