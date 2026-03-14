const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String, required: true },
  booking_type: { type: String, default: "general" },
  travel_date: String,
  travel_time: String,
  pickup_location: String,
  drop_location: String,
  num_travelers: Number,
  vehicle_type: String,
  rental_option: String,
  reference_id: String,
  reference_name: String,
  notes: String,
  status: { type: String, default: "pending" },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
