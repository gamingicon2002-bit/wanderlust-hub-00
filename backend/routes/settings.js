const router = require("express").Router();
const Settings = require("../models/Settings");
const { auth, adminOnly } = require("../middleware/auth");

// GET /api/settings (public - returns non-sensitive fields)
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    const { smtp_pass, whatsapp_api_key, ...safe } = settings.toObject();
    res.json(safe);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/settings/full (admin - all fields)
router.get("/full", auth, adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/settings (admin)
router.put("/", auth, adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    Object.assign(settings, req.body, { updated_at: new Date() });
    await settings.save();
    res.json(settings);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
