const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  discount_percent: Number,
  discount_text: String,
  image: String,
  valid_from: String,
  valid_until: String,
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Offer", offerSchema);
