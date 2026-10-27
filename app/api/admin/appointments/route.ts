import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin";
import { connectMongo } from "@/lib/db";
import { AppointmentModel, ReservationModel, type StoredAppointment } from "@/lib/models";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    await connectMongo();
    const startDate = request.nextUrl.searchParams.get("from");
    const endDate = request.nextUrl.searchParams.get("to");
    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("q")?.trim().slice(0, 80);
    const after = request.nextUrl.searchParams.get("after");
    const filter: Record<string, unknown> = {};
    if (startDate || endDate) {
      filter.startsAt = {
        ...(startDate ? { $gte: new Date(startDate) } : {}),
        ...(endDate ? { $lt: new Date(endDate) } : {}),
      };
    }
    if (status && ["confirmed", "cancelled", "completed"].includes(status)) filter.status = status;
    if (after) {
      const [cursorTime, cursorId] = after.split("|");
      const cursorDate = new Date(cursorTime);
      if (!Number.isNaN(cursorDate.getTime()) && /^[a-f\d]{24}$/i.test(cursorId || "")) {
        filter.$and = [
          { $or: [{ startsAt: { $gt: cursorDate } }, { startsAt: cursorDate, _id: { $gt: cursorId } }] },
        ];
      }
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { customerName: { $regex: escaped, $options: "i" } },
        { customerEmail: { $regex: escaped, $options: "i" } },
        { reference: { $regex: escaped, $options: "i" } },
        { serviceName: { $regex: escaped, $options: "i" } },
      ];
    }
    const appointments = await AppointmentModel.find(filter)
      .sort({ startsAt: 1 })
      .limit(51)
      .lean<StoredAppointment[]>();
    const hasMore = appointments.length > 50;
    const page = hasMore ? appointments.slice(0, 50) : appointments;
    const lastAppointment = page.length > 0 ? page[page.length - 1] : undefined;
    const nextCursor = hasMore && lastAppointment
      ? `${lastAppointment.startsAt.toISOString()}|${lastAppointment._id.toString()}`
      : null;
    return NextResponse.json({ appointments: page, nextCursor });
  } catch (error) {
    console.error("Admin appointment list failed:", error);
    return NextResponse.json({ error: "Could not load appointments." }, { status: 503 });
  }
}

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["cancelled", "completed"]),
});

export async function PATCH(request: NextRequest) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 4096) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid appointment update." }, { status: 400 });
  try {
    await connectMongo();
    const appointment = await AppointmentModel.findOneAndUpdate(
      { _id: parsed.data.id, status: "confirmed" },
      { $set: { status: parsed.data.status } },
      { new: true },
    );
    if (!appointment) return NextResponse.json({ error: "Appointment not found or already updated." }, { status: 409 });
    if (parsed.data.status === "cancelled") {
      await ReservationModel.deleteMany({ reservationId: appointment.reference });
    }
    return NextResponse.json({ appointment: { id: appointment.id, status: appointment.status } });
  } catch (error) {
    console.error("Admin appointment update failed:", error);
    return NextResponse.json({ error: "Could not update the appointment." }, { status: 503 });
  }
}
