import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { env } from "../src/config/env.js";

async function seedAdmin() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    const adminEmail = "admin@skillforge.io";
    const adminPassword = "Admin@123456"; // Change this in production

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail, role: "admin" });
    if (existingAdmin) {
      console.log("⚠ Admin user already exists");
      console.log("📧 Email:", adminEmail);
      console.log("\n🔄 Deleting existing admin and creating fresh...");
      await User.deleteOne({ email: adminEmail, role: "admin" });
    }

    // Create admin user (password will be hashed by pre-save hook)
    const admin = new User({
      email: adminEmail,
      password: adminPassword, // Will be auto-hashed by User model pre-save hook
      role: "admin",
      name: "Super Admin",
      emailVerified: true, // Admin is pre-verified
    });

    await admin.save();

    console.log("✓ Admin user created successfully!");
    console.log("\n=================================");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("=================================\n");
    console.log("⚠ IMPORTANT: Change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding admin:", error.message);
    process.exit(1);
  }
}

seedAdmin();
