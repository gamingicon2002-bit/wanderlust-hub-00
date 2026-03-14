const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  tour_type: { type: String, default: "group" },
  duration: String,
  price: { type: Number, default: 0 },
  original_price: Number,
  description: String,
  short_description: String,
  image: String,
  images: [String],
  inclusions: [String],
  exclusions: [String],
  itinerary: [String],
  special_features: [String],
  additional_notes: String,
  brochure_url: String,
  is_featured: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Package", packageSchema);
