const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, default: "" },
  icon_name: { type: String, default: "" },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SocialLink", socialLinkSchema);
