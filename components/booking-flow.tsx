"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { addDays, format, parseISO } from "date-fns";
import { ArrowLeft, ArrowRight, Check, Clock3, Sparkles } from "lucide-react";
import { salon } from "@/lib/config";
import { staff } from "@/lib/staff";
import type { SalonService } from "@/lib/services";

type BookingResult = {
  appointment: {
    reference: string;
    name: string;
    serviceName: string;
    staffName: string;
    date: string;
    time: string;
  };
  emailDelivery: "sent" | "not_configured" | "failed";
};

type CustomerDetails = { name: string; email: string; phone: string; notes: string };

const stepLabels = ["Service", "Artist", "Date", "Time", "Details", "Review"];

function salonToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: salon.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatSlot(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })
    .format(new Date(2000, 0, 1, hour, minute));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export default function BookingFlow({
  services,
  initialService,
  initialStaff,
  storageMode,
}: {
  services: SalonService[];
  initialService?: string;
  initialStaff?: string;
  storageMode: "mongodb" | "development_file" | "not_configured";
}) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(services.some((service) => service.id === initialService) ? initialService! : "");
  const [staffId, setStaffId] = useState(staff.some((person) => person.id === initialStaff) ? initialStaff! : "any");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingResult | null>(null);
  const [customer, setCustomer] = useState<CustomerDetails>({ name: "", email: "", phone: "", notes: "" });
  const today = salonToday();
  const lastDay = format(addDays(parseISO(`${today}T12:00:00`), salon.booking.maximumAdvanceDays), "yyyy-MM-dd");
  const service = services.find((item) => item.id === serviceId);
  const artist = staff.find((item) => item.id === staffId);
  const eligibleStaff = useMemo(() => staff.filter((person) => person.id === "any" || !service || person.specialties.includes(service.category)), [service]);

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([]);
      setAvailabilityMessage("");
      return;
    }
    const controller = new AbortController();
    setAvailabilityLoading(true);
    setAvailabilityMessage("");
    setTime("");
    const query = new URLSearchParams({ service: serviceId, staff: staffId, date });
    fetch(`/api/availability?${query.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { slots?: string[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Unable to find available appointments.");
        setSlots(payload.slots ?? []);
        if (!payload.slots?.length) setAvailabilityMessage("No available times on this date. Try another day.");
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name === "AbortError") return;
        setSlots([]);
        setAvailabilityMessage(requestError instanceof Error ? requestError.message : "Unable to load appointment times.");
      })
      .finally(() => setAvailabilityLoading(false));
    return () => controller.abort();
  }, [date, serviceId, staffId]);

  function continueToNextStep() {
    setError("");
    if (step === 0 && !service) return setError("Choose a service to continue.");
    if (step === 1 && !eligibleStaff.some((person) => person.id === staffId)) return setError("Choose a beauty professional.");
    if (step === 2 && !date) return setError("Choose a date for your visit.");
    if (step === 3 && !time) return setError("Choose one of the available appointment times.");
    if (step === 4) {
      const detailsForm = document.querySelector<HTMLFormElement>("#booking-customer-details");
      if (!detailsForm?.reportValidity()) return;
    }
    setStep((current) => Math.min(5, current + 1));
  }

  async function confirmBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service || !artist || !date || !time) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customer, serviceId, staffId, date, time }),
      });
      const result = await response.json() as BookingResult & { error?: string };
      if (!response.ok) throw new Error(result.error || "We couldn't save your appointment.");
      setConfirmation(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't save your appointment. Please try again.");
      if (requestError instanceof Error && requestError.message.toLowerCase().includes("time")) setStep(3);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="booking-confirmed" role="status">
        <span className="eyebrow"><Check size={14} /> YOUR VISIT IS CONFIRMED</span>
        <h2>We&apos;re looking forward to seeing you, {confirmation.appointment.name}.</h2>
        <p>Your {confirmation.appointment.serviceName} with {confirmation.appointment.staffName} is booked for {formatDate(confirmation.appointment.date)} at {formatSlot(confirmation.appointment.time)}.</p>
        <div className="booking-reference">Reference · {confirmation.appointment.reference}</div>
        {confirmation.emailDelivery === "sent"
          ? <p>Your confirmation email has been sent.</p>
          : confirmation.emailDelivery === "failed"
            ? <p>Your appointment is saved, but we couldn&apos;t send the email confirmation. Please keep your reference above.</p>
            : <p>Your appointment is saved. Email confirmations are not configured yet, so please keep your reference above.</p>}
        <a href="/" className="button button-outline">Back to Pink petals <ArrowRight size={14} /></a>
      </div>
    );
  }

  return (
    <div className="booking-layout">
      <form id="booking-customer-details" className="booking-panel" onSubmit={confirmBooking}>
        <div className="booking-steps" aria-label={`Booking step ${step + 1} of ${stepLabels.length}`}>
          {stepLabels.map((label, index) => (
            <span className={`booking-step-indicator${index === step ? " active" : index < step ? " done" : ""}`} key={label}>
              {index + 1}. {label}
            </span>
          ))}
        </div>

        {step === 0 && (
          <>
            <h2>Choose your treatment</h2>
            <p>A little something just for you.</p>
            <div className="booking-options">
              {services.map((item) => (
                <button className="booking-choice booking-choice-service" type="button" key={item.id} aria-pressed={serviceId === item.id} onClick={() => { setServiceId(item.id); setStaffId("any"); }}>
                  <Image className="booking-choice-image" src={item.image} alt="" width={55} height={65} />
                  <span><strong>{item.name}</strong><small>{item.duration} minutes · ${item.price}<br />{item.description}</small></span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2>Choose your beauty professional</h2>
            <p>Select someone special, or leave it to us to find an available artist.</p>
            <div className="booking-options">
              {eligibleStaff.map((person) => (
                <button className="booking-choice" type="button" key={person.id} aria-pressed={staffId === person.id} onClick={() => setStaffId(person.id)}>
                  {person.image ? <Image className="booking-choice-image" src={person.image} alt="" width={55} height={65} /> : <span className="booking-choice-image artist-placeholder">✿</span>}
                  <span><strong>{person.name}</strong><small>{person.title}</small></span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Pick a day for yourself</h2>
            <p>Times are shown in {salon.timezone}. We&apos;re closed Mondays.</p>
            <label className="booking-form">Your preferred date
              <input type="date" name="appointmentDate" min={today} max={lastDay} value={date} onChange={(event) => setDate(event.target.value)} required />
            </label>
            <p className="booking-summary-note">Appointments may be booked up to {salon.booking.maximumAdvanceDays} days ahead.</p>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Find a time that feels good</h2>
            <p>{date ? formatDate(date) : "Choose a day to see available times."}</p>
            {availabilityLoading ? <p role="status">Checking live availability…</p> : null}
            {availabilityMessage ? <p className="booking-notice" role="status">{availabilityMessage}</p> : null}
            <div className="time-slots" role="group" aria-label="Available appointment times">
              {slots.map((slot) => <button className="time-slot" type="button" key={slot} aria-pressed={time === slot} onClick={() => setTime(slot)}>{formatSlot(slot)}</button>)}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2>How can we reach you?</h2>
            <p>Your details are only used to manage this appointment.</p>
            <div className="booking-form">
              <div className="form-row">
                  <label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={80} value={customer.name} onChange={(event) => setCustomer((details) => ({ ...details, name: event.target.value }))} required /></label>
                  <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} value={customer.email} onChange={(event) => setCustomer((details) => ({ ...details, email: event.target.value }))} required /></label>
              </div>
              <label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={30} pattern="[+()0-9 .-]+" value={customer.phone} onChange={(event) => setCustomer((details) => ({ ...details, phone: event.target.value }))} required /></label>
              <label>A note for your artist <span className="optional">(optional)</span><textarea name="notes" maxLength={500} rows={3} value={customer.notes} onChange={(event) => setCustomer((details) => ({ ...details, notes: event.target.value }))} /></label>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2>One last little look</h2>
            <p>Review your visit before you reserve your time.</p>
            <div className="review-booking">
              <div><span>Treatment</span><strong>{service?.name}</strong></div>
              <div><span>Beauty professional</span><strong>{artist?.name}</strong></div>
              <div><span>Date</span><strong>{date ? formatDate(date) : ""}</strong></div>
              <div><span>Time</span><strong>{time ? formatSlot(time) : ""}</strong></div>
              <div><span>Duration</span><strong>{service?.duration} minutes</strong></div>
              <div className="review-booking-total"><span>Estimated total</span><strong>${service?.price}</strong></div>
            </div>
            <p className="booking-summary-note">No payment is collected online. Please contact the salon at least 24 hours ahead to change or cancel. Update this sample cancellation policy before launch.</p>
          </>
        )}

        {error && <p className="form-status" role="alert">{error}</p>}
        <div className="booking-actions">
          {step > 0
            ? <button className="button button-outline" type="button" onClick={() => { setError(""); setStep((current) => current - 1); }}><ArrowLeft size={14} /> Back</button>
            : <span />}
          {step < 5
            ? <button className="button button-primary" type="button" onClick={continueToNextStep}>Continue <ArrowRight size={14} /></button>
            : <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? "Saving your appointment…" : "Confirm appointment"} <Check size={14} /></button>}
        </div>
      </form>

      <aside className="booking-summary">
        <span className="eyebrow"><Sparkles size={13} /> YOUR VISIT</span>
        <h2>A moment for you</h2>
        <div className="booking-summary-row"><span>Treatment</span><strong>{service?.name ?? "Choose a treatment"}</strong></div>
        <div className="booking-summary-row"><span>Artist</span><strong>{artist?.name ?? "Choose an artist"}</strong></div>
        <div className="booking-summary-row"><span>When</span><strong>{date ? `${format(parseISO(`${date}T12:00:00`), "MMM d")} · ${time ? formatSlot(time) : "Choose a time"}` : "Choose a date"}</strong></div>
        <div className="booking-summary-row"><span>Duration</span><strong>{service ? `${service.duration} min` : "—"}</strong></div>
        <div className="booking-summary-row"><span>Estimated price</span><strong>{service ? `$${service.price}` : "—"}</strong></div>
        <p className="booking-summary-note"><Clock3 size={12} /> Your appointment is only confirmed after the booking system saves it.</p>
        <div className="booking-notice">
          {storageMode === "development_file"
            ? "Development mode: appointments are saved locally in a JSON file. Configure MongoDB before deploying or accepting real customer bookings."
            : storageMode === "not_configured"
              ? "Booking availability needs MongoDB configured. We won't show times or claim a booking was made until the database is connected."
              : "Appointments are stored in the salon booking database. Your visit is only confirmed after saving."}
        </div>
      </aside>
    </div>
  );
}
