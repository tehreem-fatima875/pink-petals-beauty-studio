import { NextRequest, NextResponse } from "next/server";
import { getAvailableAppointments } from "@/lib/booking";
import { staff } from "@/lib/staff";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const serviceId = request.nextUrl.searchParams.get("service") ?? "";
  const staffId = request.nextUrl.searchParams.get("staff") ?? "any";
  if (!staff.some((person) => person.id === staffId)) {
    return NextResponse.json({ error: "Choose an available team member." }, { status: 400 });
  }
  try {
    const result = await getAvailableAppointments(date, serviceId, staffId);
    if (result.error) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Availability lookup failed:", error);
    return NextResponse.json(
      { error: "Appointment availability is temporarily unavailable. Please try again shortly." },
      { status: 503 },
    );
  }
}
