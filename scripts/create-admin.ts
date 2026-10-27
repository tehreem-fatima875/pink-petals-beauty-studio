import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectMongo } from "../lib/db";
import { UserModel } from "../lib/models";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim();
  if (!email || !password || !name) {
    throw new Error("Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME for this one-time bootstrap.");
  }
  if (password.length < 14) throw new Error("ADMIN_PASSWORD must be at least 14 characters.");
  await connectMongo();
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error("An account with this email already exists; no changes were made.");
  await UserModel.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
  });
  console.log(`Administrator ${email} created. Remove the bootstrap environment variables now.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Administrator bootstrap failed.");
  process.exitCode = 1;
});
