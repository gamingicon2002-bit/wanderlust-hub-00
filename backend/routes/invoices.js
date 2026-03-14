const router = require("express").Router();
const { Invoice, InvoiceBrand } = require("../models/Invoice");
const { auth, adminOnly } = require("../middleware/auth");

// --- Invoices ---
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    res.json(await Invoice.find(filter).populate("brand_id").sort("-created_at"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", auth, adminOnly, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).populate("brand_id");
    if (!inv) return res.status(404).json({ error: "Not found" });
    res.json(inv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Invoice.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await Invoice.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try { await Invoice.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Invoice Brands ---
router.get("/brands/all", auth, adminOnly, async (req, res) => {
  try { res.json(await InvoiceBrand.find().sort("-created_at")); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/brands", auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await InvoiceBrand.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/brands/:id", auth, adminOnly, async (req, res) => {
  try { res.json(await InvoiceBrand.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true })); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/brands/:id", auth, adminOnly, async (req, res) => {
  try { await InvoiceBrand.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
