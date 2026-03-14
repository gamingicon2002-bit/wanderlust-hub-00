const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  short_description: String,
  image: String,
  images: [String],
  highlights: [String],
  best_time: String,
  brochure_url: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Destination", destinationSchema);
