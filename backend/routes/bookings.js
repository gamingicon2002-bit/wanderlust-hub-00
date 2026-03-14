const router = require("express").Router();
const Booking = require("../models/Booking");
const { auth, adminOnly } = require("../middleware/auth");

// GET /api/bookings (admin)
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const { status, booking_type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (booking_type) filter.booking_type = booking_type;
    res.json(await Booking.find(filter).populate("driver_id", "name phone").sort("-created_at"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/bookings/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id).populate("driver_id", "name phone");
    if (!b) return res.status(404).json({ error: "Not found" });
    res.json(b);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/bookings (public - customer creates booking)
router.post("/", async (req, res) => {
  try { res.status(201).json(await Booking.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/bookings/:id (admin)
router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await Booking.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/bookings/:id/status (admin)
router.put("/:id/status", auth, adminOnly, async (req, res) => {
  try {
    res.json(await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status, updated_at: new Date() }, { new: true }));
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/bookings/:id/assign-driver (admin)
router.put("/:id/assign-driver", auth, adminOnly, async (req, res) => {
  try {
    res.json(await Booking.findByIdAndUpdate(req.params.id, { driver_id: req.body.driver_id, updated_at: new Date() }, { new: true }));
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE /api/bookings/:id (admin)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await Booking.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
