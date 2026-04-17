import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { ROLES } from "../utils/constants.js";

dotenv.config();

const [, , identifier, password] = process.argv;

if (!identifier || !password) {
  console.log("Usage: npm run admin-login -- <email> <password>");
  process.exit(1);
}

try {
  await connectDB();

  const admin = await User.findOne({ email: String(identifier).trim().toLowerCase(), role: ROLES.SUPER_ADMIN }).select("+password");

  if (!admin || !(await admin.matchPassword(password))) {
    console.log("Invalid admin credentials.");
    process.exit(1);
  }

  console.log("Admin authenticated successfully.");
  console.log(`Name: ${admin.name}`);
  console.log(`Role: ${admin.role}`);
  console.log(`Token: ${generateToken({ id: admin._id, role: admin.role })}`);
  process.exit(0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
