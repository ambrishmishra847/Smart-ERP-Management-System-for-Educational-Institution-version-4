import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { ROLES } from "../utils/constants.js";

dotenv.config();

const [, , name, username, password] = process.argv;

if (!name || !username || !password) {
  console.log('Usage: npm run create-admin -- "Admin Name" username password');
  process.exit(1);
}

try {
  await connectDB();

  const normalizedUsername = String(username).trim().toLowerCase();
  const derivedEmail = `${normalizedUsername}@smarterp.local`;

  const existingUser = await User.findOne({
    $or: [{ username: normalizedUsername }, { email: derivedEmail }],
  });

  if (existingUser) {
    console.log("An admin with this username already exists.");
    process.exit(1);
  }

  const admin = await User.create({
    name: String(name).trim(),
    username: normalizedUsername,
    email: derivedEmail,
    password,
    role: ROLES.SUPER_ADMIN,
  });

  console.log("Admin created successfully.");
  console.log(`Name: ${admin.name}`);
  console.log(`Username: ${admin.username}`);
  console.log(`Email: ${admin.email}`);
  process.exit(0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
