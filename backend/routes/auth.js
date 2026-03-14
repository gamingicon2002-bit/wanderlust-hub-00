const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth, adminOnly, superAdminOnly } = require("../middleware/auth");

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    user.last_sign_in_at = new Date();
    await user.save();
    res.json({ token: signToken(user._id), user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register (admin only)
router.post("/register", auth, superAdminOnly, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.create({ email, password, role: role || "admin" });
    res.status(201).json({ success: true, user_id: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", auth, (req, res) => {
  res.json({ id: req.user._id, email: req.user.email, role: req.user.role });
});

// PUT /api/auth/change-password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!(await req.user.comparePassword(current_password))) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    req.user.password = new_password;
    await req.user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users (admin list all users)
router.get("/users", auth, superAdminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["admin", "super_admin", "moderator"] } })
      .select("-password").sort("-created_at");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id/role
router.put("/users/:id/role", auth, superAdminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ error: "Cannot change own role" });
    await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id/password (admin reset password)
router.put("/users/:id/password", auth, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.password = req.body.new_password;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/users/:id
router.delete("/users/:id", auth, superAdminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ error: "Cannot delete yourself" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
