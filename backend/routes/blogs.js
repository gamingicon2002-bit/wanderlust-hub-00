const router = require("express").Router();
const Blog = require("../models/Blog");
const { auth, adminOnly } = require("../middleware/auth");

// GET /api/blogs (public - published only, admin - all)
router.get("/", async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    res.json(await Blog.find(filter).sort("-created_at"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const b = await Blog.findById(req.params.id);
    if (!b) return res.status(404).json({ error: "Not found" });
    res.json(b);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Blog.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await Blog.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await Blog.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/blogs/:id/comments (public)
router.post("/:id/comments", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    blog.comments.push(req.body);
    await blog.save();
    res.status(201).json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/blogs/:blogId/comments/:commentId/status (admin)
router.put("/:blogId/comments/:commentId/status", auth, adminOnly, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    comment.status = req.body.status;
    await blog.save();
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
