const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
  title: String,
  description: String,
  image_url: { type: String, required: true },
  category: String,
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Gallery", gallerySchema);
