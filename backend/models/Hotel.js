const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, default: "" },
  location: { type: String, default: "" },
  description: String,
  short_description: String,
  image: String,
  images: [String],
  amenities: [String],
  price_per_night: Number,
  rating: Number,
  contact_email: String,
  contact_phone: String,
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Hotel", hotelSchema);
