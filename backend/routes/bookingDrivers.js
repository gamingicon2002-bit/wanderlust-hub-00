const router = require("express").Router();
const BookingDriver = require("../models/BookingDriver");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.booking_id) filter.booking_id = req.query.booking_id;
    if (req.query.driver_id) filter.driver_id = req.query.driver_id;
    res.json(await BookingDriver.find(filter).populate("driver_id", "name phone").populate("vehicle_id", "name type").populate("booking_id"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const item = await BookingDriver.findById(req.params.id).populate("driver_id", "name phone").populate("vehicle_id", "name type");
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await BookingDriver.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await BookingDriver.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
