const router = require("express").Router();
const Driver = require("../models/Driver");
const User = require("../models/User");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", auth, adminOnly, async (req, res) => {
  try { res.json(await Driver.find().populate("vehicles", "name type").populate("user_id", "email").sort("-created_at")); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const d = await Driver.findById(req.params.id).populate("vehicles", "name type");
    if (!d) return res.status(404).json({ error: "Not found" });
    res.json(d);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Driver.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await Driver.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// POST /api/drivers/:id/create-account (create login for driver)
router.post("/:id/create-account", auth, adminOnly, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.create({ email, password, role: "user" });
    await Driver.findByIdAndUpdate(req.params.id, { user_id: user._id, email });
    res.json({ success: true, user_id: user._id });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await Driver.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
