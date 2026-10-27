import { NextResponse } from "next/server";
import { hasMongoConfig } from "@/lib/db";

export function GET() {
  const databaseConfigured = hasMongoConfig();
  return NextResponse.json({
    status: "ok",
    bookingDatabaseConfigured: databaseConfigured,
    bookingStorageMode: databaseConfigured
      ? "mongodb"
      : process.env.NODE_ENV === "production"
        ? "not_configured"
        : "development_file",
    emailConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM),
  });
}
