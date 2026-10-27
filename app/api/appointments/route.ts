import { NextRequest, NextResponse } from "next/server";
import { BookingError, bookingSchema, createBooking } from "@/lib/booking";
import { connectMongo } from "@/lib/db";
import { sendBookingConfirmation } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`booking:${clientKey(request)}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many booking attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 16_384) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }
  } catch {
    return NextResponse.json({ error: "Could not read your booking request." }, { status: 400 });
  }
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Please send valid JSON." }, { status: 400 });
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your details and try again.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await connectMongo();
    const appointment = await createBooking(parsed.data);
    let emailDelivery: "sent" | "not_configured" | "failed" = "not_configured";
    try {
      emailDelivery = await sendBookingConfirmation(appointment);
    } catch (error) {
      emailDelivery = "failed";
      console.error("Booking was saved but confirmation email failed:", error);
    }
    return NextResponse.json({ appointment, emailDelivery }, { status: 201 });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Could not save appointment:", error);
    return NextResponse.json(
      { error: "The booking service is unavailable. Please try again or call the salon." },
      { status: 503 },
    );
  }
}
