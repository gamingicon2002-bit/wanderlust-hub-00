const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewer_name: { type: String, required: true },
  reviewer_email: { type: String, required: true },
  rating: { type: Number, default: 5 },
  comment: { type: String, default: "" },
  reviewable_type: { type: String, default: "general" },
  reviewable_id: { type: String, required: true },
  status: { type: String, default: "pending" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
