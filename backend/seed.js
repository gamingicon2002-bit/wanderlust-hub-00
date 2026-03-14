require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: "admin@admin.com" });
  if (existing) {
    console.log("Super admin already exists");
  } else {
    await User.create({
      email: "admin@admin.com",
      password: "admin123456",
      role: "super_admin",
    });
    console.log("✅ Super admin created: admin@admin.com / admin123456");
  }

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch(console.error);
