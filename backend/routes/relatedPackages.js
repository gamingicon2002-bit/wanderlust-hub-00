const router = require("express").Router();
const RelatedPackage = require("../models/RelatedPackage");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.package_id) filter.package_id = req.query.package_id;
    res.json(await RelatedPackage.find(filter).populate("related_package_id").sort("sort_order"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await RelatedPackage.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await RelatedPackage.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await RelatedPackage.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
