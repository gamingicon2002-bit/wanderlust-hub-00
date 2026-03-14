const router = require("express").Router();
const Notification = require("../models/Notification");
const { auth } = require("../middleware/auth");

// GET /api/notifications (own notifications)
router.get("/", auth, async (req, res) => {
  try { res.json(await Notification.find({ user_id: req.user._id }).sort("-created_at").limit(50)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", auth, async (req, res) => {
  try { res.json(await Notification.findByIdAndUpdate(req.params.id, { is_read: true }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/notifications/mark-all-read
router.put("/mark-all-read", auth, async (req, res) => {
  try { await Notification.updateMany({ user_id: req.user._id, is_read: false }, { is_read: true }); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
