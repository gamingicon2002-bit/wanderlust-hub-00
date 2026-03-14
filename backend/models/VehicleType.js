const mongoose = require("mongoose");

const vehicleTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  icon: String,
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleType", default: null },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("VehicleType", vehicleTypeSchema);
