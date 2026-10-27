import { addDays, format } from "date-fns";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { salon } from "@/lib/config";
import {
  bookingSchema,
  buildCandidateSlots,
  createBooking,
  getAvailableAppointments,
  localDateTime,
  staffCanFit,
  slotsOverlap,
  validateBookingDate,
} from "@/lib/booking";
import { services } from "@/lib/services";
import { staff } from "@/lib/staff";

function upcomingOpenDate() {
  let date = addDays(new Date(), 7);
  while (date.getDay() === 1) date = addDays(date, 1);
  return format(date, "yyyy-MM-dd");
}

describe("appointment booking rules", () => {
  it("only accepts real dates inside the configured booking window", () => {
    const valid = upcomingOpenDate();
    expect(validateBookingDate(valid)).toBe(true);
    expect(validateBookingDate("2026-02-31")).toBe(false);
    expect(validateBookingDate("not-a-date")).toBe(false);
    expect(validateBookingDate(format(addDays(new Date(), -1), "yyyy-MM-dd"))).toBe(false);
  });

  it("does not offer Monday appointments", () => {
    let monday = addDays(new Date(), 7);
    while (monday.getDay() !== 1) monday = addDays(monday, 1);
    const date = format(monday, "yyyy-MM-dd");
    expect(buildCandidateSlots(date, services[0])).toEqual([]);
  });

  it("respects service duration and salon closing time", () => {
    const date = upcomingOpenDate();
    const now = new Date(localDateTime(date, "07:00").getTime() - salon.booking.minimumLeadMinutes * 60_000);
    const longService = services.find((service) => service.id === "balayage")!;
    const slots = buildCandidateSlots(date, longService, now);
    expect(slots[0].time).toBe("09:00");
    expect(slots.at(-1)?.time).toBe("15:00");
    expect(slots.every((slot) => slot.endsAt <= localDateTime(date, "18:00"))).toBe(true);
  });

  it("applies the lead-time rule to same-day availability", () => {
    const date = upcomingOpenDate();
    const now = localDateTime(date, "10:10");
    const slots = buildCandidateSlots(date, services[0], now);
    expect(slots.some((slot) => slot.time === "10:00")).toBe(false);
    expect(slots.some((slot) => slot.time === "12:30")).toBe(true);
  });

  it("calculates local salon times across daylight-saving transitions", () => {
    for (const date of ["2026-03-08", "2026-11-01"]) {
      const instant = localDateTime(date, "09:30");
      expect(new Intl.DateTimeFormat("en-US", {
        timeZone: salon.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(instant)).toBe("09:30");
    }
  });

  it("detects conflicting appointment ranges but allows adjacent bookings", () => {
    const first = { startsAt: new Date("2026-11-05T17:00:00Z"), endsAt: new Date("2026-11-05T18:00:00Z") };
    expect(slotsOverlap(first, {
      startsAt: new Date("2026-11-05T17:30:00Z"),
      endsAt: new Date("2026-11-05T18:30:00Z"),
    })).toBe(true);
    expect(slotsOverlap(first, {
      startsAt: new Date("2026-11-05T18:00:00Z"),
      endsAt: new Date("2026-11-05T19:00:00Z"),
    })).toBe(false);
  });

  it("respects individual team schedules and breaks", () => {
    const date = upcomingOpenDate();
    const jules = staff.find((member) => member.id === "jules-martin")!;
    const service = services.find((item) => item.id === "signature-cut")!;
    expect(staffCanFit(jules, date, {
      startsAt: localDateTime(date, "13:00"),
      endsAt: localDateTime(date, "14:00"),
    })).toBe(false);
    expect(staffCanFit(jules, date, {
      startsAt: localDateTime(date, "14:00"),
      endsAt: localDateTime(date, "15:00"),
    })).toBe(true);
    expect(service.duration).toBe(60);
  });

  it("rejects invalid customer booking details", () => {
    expect(bookingSchema.safeParse({
      name: "A",
      email: "not-an-email",
      phone: "x",
      serviceId: "unknown",
      staffId: "any",
      date: "bad-date",
      time: "25:90",
      notes: "",
    }).success).toBe(false);
  });

  it("persists a development booking and prevents simultaneous overlaps", async () => {
    const dataPath = path.join(process.cwd(), "data", `test-${randomUUID()}.json`);
    const previousPath = process.env.PINKPETALS_DEV_STORE;
    process.env.PINKPETALS_DEV_STORE = dataPath;
    await mkdir(path.dirname(dataPath), { recursive: true });

    try {
      let date = addDays(new Date(), 7);
      while (![2, 3, 4, 5, 6].includes(date.getDay())) date = addDays(date, 1);
      const dateString = format(date, "yyyy-MM-dd");
      const input = bookingSchema.parse({
        name: "Test Guest",
        email: "test@example.com",
        phone: "5035550123",
        serviceId: "signature-cut",
        staffId: "any",
        date: dateString,
        time: "09:00",
        notes: "",
      });
      const results = await Promise.allSettled([createBooking(input), createBooking(input)]);
      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);

      const availability = await getAvailableAppointments(dateString, input.serviceId, input.staffId);
      expect(availability.slots).not.toContain("09:00");
      expect(availability.slots).not.toContain("09:30");
    } finally {
      await rm(dataPath, { force: true });
      if (previousPath === undefined) delete process.env.PINKPETALS_DEV_STORE;
      else process.env.PINKPETALS_DEV_STORE = previousPath;
    }
  });
});
