const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  sub_type: String,
  model: String,
  capacity: Number,
  price_per_km: Number,
  price_per_day: Number,
  fuel_type: String,
  transmission: String,
  features: [String],
  rental_options: [String],
  image: String,
  images: [String],
  description: String,
  short_description: String,
  brochure_url: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
