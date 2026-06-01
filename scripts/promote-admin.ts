/**
 * Promote a user to admin by email.
 * Usage: npm run promote-admin -- your@email.com
 */
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    console.error("No .env file found. Add DATABASE_URI to .env first.");
    process.exit(1);
  }

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }

  if (!process.env.DATABASE_URI) {
    console.error("DATABASE_URI is missing from .env");
    process.exit(1);
  }
}

async function main() {
  loadEnv();

  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run promote-admin -- <email>");
    process.exit(1);
  }

  const { default: dbConnect } = await import("../lib/mongoose");
  const { default: User } = await import("../mongo/models/User");

  await dbConnect();

  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email: ${email}`);
    console.error("Register that email in the app first, then run this again.");
    process.exit(1);
  }

  console.log(`✓ ${user.email} is now admin`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
