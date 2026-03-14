const mongoose = require("mongoose");

const homepageSectionSchema = new mongoose.Schema({
  section_key: { type: String, required: true, unique: true },
  title: { type: String, default: "" },
  subtitle: String,
  badge_text: String,
  image_url: String,
  cta_text: String,
  cta_link: String,
  extra_data: mongoose.Schema.Types.Mixed,
  is_active: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HomepageSection", homepageSectionSchema);
