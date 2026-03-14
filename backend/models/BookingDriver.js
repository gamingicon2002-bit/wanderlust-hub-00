const mongoose = require("mongoose");

const bookingDriverSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  vehicle_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BookingDriver", bookingDriverSchema);
