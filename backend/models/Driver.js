const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  license_number: String,
  experience_years: { type: Number, default: 0 },
  photo: String,
  is_active: { type: Boolean, default: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Driver", driverSchema);
