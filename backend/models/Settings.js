const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  company_name: String,
  tagline: String,
  phone: String,
  whatsapp: String,
  contact_email: String,
  office_address: String,
  smtp_enabled: { type: Boolean, default: false },
  smtp_host: String,
  smtp_port: String,
  smtp_user: String,
  smtp_pass: String,
  smtp_from_email: String,
  smtp_from_name: String,
  whatsapp_enabled: { type: Boolean, default: false },
  whatsapp_api_url: String,
  whatsapp_api_key: String,
  whatsapp_booking_template: String,
  whatsapp_admin_template: String,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Settings", settingsSchema);
