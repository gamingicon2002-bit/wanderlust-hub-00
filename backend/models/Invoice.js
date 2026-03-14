const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, default: "" },
  quantity: { type: Number, default: 1 },
  unit_price: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  sort_order: { type: Number, default: 0 },
});

const invoiceSchema = new mongoose.Schema({
  invoice_number: { type: String, required: true, unique: true },
  customer_name: { type: String, required: true },
  customer_email: String,
  customer_phone: String,
  customer_address: String,
  customer_gst: String,
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "InvoiceBrand" },
  heading: String,
  description: String,
  invoice_date: String,
  due_date: String,
  items: [invoiceItemSchema],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  cgst_percent: Number,
  cgst_amount: Number,
  sgst_percent: Number,
  sgst_amount: Number,
  igst_percent: Number,
  igst_amount: Number,
  total: { type: Number, default: 0 },
  status: { type: String, default: "draft" },
  payment_method: String,
  paid_at: String,
  notes: String,
  terms: String,
  footer_text: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const invoiceBrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo_url: String,
  address: String,
  phone: String,
  email: String,
  gst_number: String,
  bank_details: String,
  is_default: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
const InvoiceBrand = mongoose.model("InvoiceBrand", invoiceBrandSchema);

module.exports = { Invoice, InvoiceBrand };
