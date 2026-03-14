const mongoose = require("mongoose");

const relatedPackageSchema = new mongoose.Schema({
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  related_package_id: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RelatedPackage", relatedPackageSchema);
