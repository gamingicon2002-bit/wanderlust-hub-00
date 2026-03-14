const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, default: "" },
  body: { type: String, default: "" },
  template_type: { type: String, default: "general" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
