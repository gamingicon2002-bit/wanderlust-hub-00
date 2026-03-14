require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

// Connect MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/vehicle-types", require("./routes/vehicleTypes"));
app.use("/api/packages", require("./routes/packages"));
app.use("/api/destinations", require("./routes/destinations"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/drivers", require("./routes/drivers"));
app.use("/api/hotels", require("./routes/hotels"));
app.use("/api/blogs", require("./routes/blogs"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/contacts", require("./routes/contacts"));
app.use("/api/invoices", require("./routes/invoices"));
app.use("/api/offers", require("./routes/offers"));
app.use("/api/pages", require("./routes/pages"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/social-links", require("./routes/socialLinks"));
app.use("/api/homepage", require("./routes/homepage"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/booking-drivers", require("./routes/bookingDrivers"));
app.use("/api/related-hotels", require("./routes/relatedHotels"));
app.use("/api/related-packages", require("./routes/relatedPackages"));
app.use("/api/email-templates", require("./routes/emailTemplates"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
