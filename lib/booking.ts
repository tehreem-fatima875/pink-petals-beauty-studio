import { addDays, addMinutes, format, parseISO } from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { salon } from "@/lib/config";
import { connectMongo, hasMongoConfig } from "@/lib/db";
import { AppointmentModel, ReservationModel } from "@/lib/models";
import { findService, type SalonService } from "@/lib/services";
import { staff } from "@/lib/staff";

export const bookingSchema = z.object({
  name: z.string().trim().min(2).max(80).regex(/^[^\u0000-\u001f\u007f]+$/),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30).regex(/^[+()\d\s.-]+$/),
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  notes: z.string().trim().max(500).optional().default(""),
});

export type BookingInput = z.infer<typeof bookingSchema>;
type LocalStoredAppointment = {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  notes: string;
  status: "confirmed" | "cancelled" | "completed";
  createdAt: string;
};

let localWriteQueue: Promise<void> = Promise.resolve();

function getLocalStorePath() {
  return process.env.PINKPETALS_DEV_STORE || path.join(process.cwd(), "data", "development-appointments.json");
}

export function localDateTime(date: string, time: string) {
  return fromZonedTime(`${date}T${time}:00`, salon.timezone);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function staffCanFit(
  member: (typeof staff)[number],
  date: string,
  slot: { startsAt: Date; endsAt: Date },
) {
  const weekday = parseISO(`${date}T12:00:00`).getDay();
  if (!member.days.includes(weekday)) return false;
  const start = toMinutes(formatInTimeZone(slot.startsAt, salon.timezone, "HH:mm"));
  const end = start + Math.round((slot.endsAt.getTime() - slot.startsAt.getTime()) / 60_000);
  if (start < toMinutes(member.open) || end > toMinutes(member.close)) return false;
  return !member.breaks.some((breakTime) => (
    start < toMinutes(breakTime.end) && end > toMinutes(breakTime.start)
  ));
}

export function getSalonDate(now = new Date()) {
  return formatInTimeZone(now, salon.timezone, "yyyy-MM-dd");
}

export function validateBookingDate(date: string, now = new Date()) {
  const parsed = parseISO(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime()) || formatInTimeZone(localDateTime(date, "12:00"), salon.timezone, "yyyy-MM-dd") !== date) {
    return false;
  }
  const today = getSalonDate(now);
  const lastDate = formatInTimeZone(addDays(localDateTime(today, "12:00"), salon.booking.maximumAdvanceDays), salon.timezone, "yyyy-MM-dd");
  return date >= today && date <= lastDate;
}

function isOpenOnDate(date: string) {
  const weekday = parseISO(`${date}T12:00:00`).getDay();
  const hours = salon.hours[weekday === 0 ? 6 : weekday - 1];
  return hours.open !== null && hours.close !== null;
}

function staffCanPerform(staffId: string, service: SalonService) {
  if (staffId === "any") return staff.filter((member) => member.id !== "any" && member.specialties.includes(service.category));
  const member = staff.find((item) => item.id === staffId);
  return member && member.specialties.includes(service.category) ? [member] : [];
}

export function slotsOverlap(
  first: { startsAt: Date; endsAt: Date },
  second: { startsAt: Date; endsAt: Date },
) {
  return first.startsAt < second.endsAt && first.endsAt > second.startsAt;
}

function canUseDevelopmentStore() {
  return process.env.NODE_ENV === "test"
    || (!hasMongoConfig() && process.env.NODE_ENV !== "production");
}

async function readLocalAppointments(): Promise<LocalStoredAppointment[]> {
  const localStorePath = getLocalStorePath();
  try {
    const data: unknown = JSON.parse(await readFile(/* turbopackIgnore: true */ localStorePath, "utf8"));
    if (!Array.isArray(data)) throw new Error("Development appointment store must contain a JSON array.");
    return data as LocalStoredAppointment[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function withLocalWriteLock<T>(operation: () => Promise<T>) {
  const pending = localWriteQueue.then(operation);
  localWriteQueue = pending.then(() => undefined, () => undefined);
  return pending;
}

async function getLocalAvailability(date: string, service: SalonService, eligibleStaff: readonly (typeof staff)[number][]) {
  const existing = await readLocalAppointments();
  const candidates = buildCandidateSlots(date, service);
  return candidates
    .filter((slot) => eligibleStaff.some((member) => {
      if (!staffCanFit(member, date, slot)) return false;
      return !existing.some((appointment) => appointment.status !== "cancelled"
        && appointment.staffId === member.id
        && slotsOverlap(slot, {
          startsAt: new Date(appointment.startsAt),
          endsAt: new Date(appointment.endsAt),
        }));
    }))
    .map((slot) => slot.time);
}

export function buildCandidateSlots(date: string, service: SalonService, now = new Date()) {
  if (!validateBookingDate(date, now) || !isOpenOnDate(date)) return [];
  const weekday = parseISO(`${date}T12:00:00`).getDay();
  const hours = salon.hours[weekday === 0 ? 6 : weekday - 1];
  if (!hours.open || !hours.close) return [];
  const [openHour, openMinute] = hours.open.split(":").map(Number);
  const [closeHour, closeMinute] = hours.close.split(":").map(Number);
  const openingMinutes = openHour * 60 + openMinute;
  const closingMinutes = closeHour * 60 + closeMinute;
  const slots: { time: string; startsAt: Date; endsAt: Date }[] = [];

  for (let minute = openingMinutes; minute + service.duration <= closingMinutes; minute += salon.booking.intervalMinutes) {
    const time = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
    const startsAt = localDateTime(date, time);
    const endsAt = addMinutes(startsAt, service.duration);
    const earliestStart = addMinutes(now, salon.booking.minimumLeadMinutes);
    if (startsAt < earliestStart) continue;
    slots.push({ time, startsAt, endsAt });
  }
  return slots;
}

export async function getAvailableAppointments(date: string, serviceId: string, requestedStaffId: string) {
  const service = findService(serviceId);
  if (!service) return { error: "Choose an available service.", slots: [] as string[] };
  if (!validateBookingDate(date)) return { error: "Choose a date within the next 90 days.", slots: [] as string[] };
  const eligibleStaff = staffCanPerform(requestedStaffId, service);
  if (!eligibleStaff?.length) return { error: "Choose a team member who offers this service.", slots: [] as string[] };

  if (canUseDevelopmentStore()) {
    return { slots: await getLocalAvailability(date, service, eligibleStaff) };
  }
  await connectMongo();
  const dayStart = localDateTime(date, "00:00");
  const nextDate = format(addDays(parseISO(`${date}T12:00:00`), 1), "yyyy-MM-dd");
  const dayEnd = localDateTime(nextDate, "00:00");
  const staffIds = eligibleStaff.map((member) => member.id);
  const [appointments, reservations] = await Promise.all([
    AppointmentModel.find({
      staffId: { $in: staffIds },
      status: { $ne: "cancelled" },
      startsAt: { $lt: dayEnd },
      endsAt: { $gt: dayStart },
    }).select("staffId startsAt endsAt").lean(),
    ReservationModel.find({
      staffId: { $in: staffIds },
      startsAt: { $gte: dayStart, $lt: dayEnd },
    }).select("staffId startsAt").lean(),
  ]);
  const candidates = buildCandidateSlots(date, service);
  const available: string[] = [];

  for (const slot of candidates) {
    const matchingStaff = eligibleStaff.some((member) => {
      if (!staffCanFit(member, date, slot)) return false;
      const hasAppointment = appointments.some((appointment) =>
        appointment.staffId === member.id
        && slotsOverlap(slot, { startsAt: appointment.startsAt, endsAt: appointment.endsAt }));
      const hasReservation = reservations.some((reservation) =>
        reservation.staffId === member.id
        && reservation.startsAt >= slot.startsAt
        && reservation.startsAt < slot.endsAt);
      return !hasAppointment && !hasReservation;
    });
    if (matchingStaff) available.push(slot.time);
  }
  return { slots: available };
}

export async function createBooking(input: BookingInput) {
  const service = findService(input.serviceId);
  if (!service) throw new BookingError("That service is no longer available.", 400);
  if (!validateBookingDate(input.date) || !isOpenOnDate(input.date)) {
    throw new BookingError("Choose an available salon date.", 400);
  }
  const slot = buildCandidateSlots(input.date, service).find((candidate) => candidate.time === input.time);
  if (!slot) throw new BookingError("That time is no longer available. Choose another time.", 409);
  const scheduledStaff = staffCanPerform(input.staffId, service)?.filter((member) => staffCanFit(member, input.date, slot));
  if (!scheduledStaff?.length) throw new BookingError("That artist is not scheduled at this time. Choose another time.", 400);

  const reference = `PP-${randomUUID().slice(0, 8).toUpperCase()}`;
  if (canUseDevelopmentStore()) {
    return withLocalWriteLock(async () => {
      const existing = await readLocalAppointments();
      const selectedStaff = scheduledStaff.find((member) => !existing.some((appointment) =>
        appointment.status !== "cancelled"
        && appointment.staffId === member.id
        && slotsOverlap(slot, {
          startsAt: new Date(appointment.startsAt),
          endsAt: new Date(appointment.endsAt),
        })));
      if (!selectedStaff) {
        throw new BookingError("That time was just booked. Please choose another time.", 409);
      }
      const appointment: LocalStoredAppointment = {
        id: randomUUID(),
        reference,
        customerName: input.name,
        customerEmail: input.email.toLowerCase(),
        customerPhone: input.phone,
        serviceId: service.id,
        serviceName: service.name,
        staffId: selectedStaff.id,
        startsAt: slot.startsAt.toISOString(),
        endsAt: slot.endsAt.toISOString(),
        notes: input.notes,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      const localStorePath = getLocalStorePath();
      await mkdir(path.dirname(localStorePath), { recursive: true });
      const temporaryPath = `${localStorePath}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporaryPath, JSON.stringify([...existing, appointment], null, 2), "utf8");
        await rename(temporaryPath, localStorePath);
      } catch (error) {
        const { unlink } = await import("node:fs/promises");
        await unlink(temporaryPath).catch(() => undefined);
        throw error;
      }
      return {
        id: appointment.id,
        reference: appointment.reference,
        name: appointment.customerName,
        email: appointment.customerEmail,
        serviceName: appointment.serviceName,
        staffName: selectedStaff.name,
        date: input.date,
        time: input.time,
        emailConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM),
      };
    });
  }

  await connectMongo();
  await Promise.all([AppointmentModel.init(), ReservationModel.init()]);
  for (const member of scheduledStaff) {
    const reservationId = reference;
    try {
      const reservationSlots: { reservationId: string; staffId: string; startsAt: Date }[] = [];
      for (let start = slot.startsAt; start < slot.endsAt; start = addMinutes(start, salon.booking.intervalMinutes)) {
        reservationSlots.push({ reservationId, staffId: member.id, startsAt: start });
      }
      await ReservationModel.insertMany(reservationSlots, { ordered: true });
      const appointment = await AppointmentModel.create({
        reference,
        customerName: input.name,
        customerEmail: input.email.toLowerCase(),
        customerPhone: input.phone,
        serviceId: service.id,
        serviceName: service.name,
        staffId: member.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        notes: input.notes,
      });
      return {
        id: appointment.id,
        reference: appointment.reference,
        name: appointment.customerName,
        email: appointment.customerEmail,
        serviceName: appointment.serviceName,
        staffName: staff.find((person) => person.id === member.id)?.name ?? member.name,
        date: input.date,
        time: input.time,
        emailConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM),
      };
    } catch (error) {
      await ReservationModel.deleteMany({ reservationId });
      if (error instanceof BookingError) throw error;
      if (error && typeof error === "object" && "code" in error && error.code === 11000) continue;
      throw error;
    }
  }
  throw new BookingError("That time was just booked. Please choose another time.", 409);
}

export class BookingError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "BookingError";
  }
}
