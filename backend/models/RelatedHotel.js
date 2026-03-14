const mongoose = require("mongoose");

const relatedHotelSchema = new mongoose.Schema({
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RelatedHotel", relatedHotelSchema);
