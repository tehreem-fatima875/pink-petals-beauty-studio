# Pink petals

A luxury editorial salon website built with **Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, MongoDB/Mongoose, Zod, Auth.js and Nodemailer**.

## Requirements

- Node.js 22.12 or newer
- MongoDB connection string for live appointment availability and bookings
- SMTP credentials for real appointment and contact email delivery

## Development

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set the environment variables in `.env.local` before enabling bookings:

- `MONGODB_URI` — MongoDB connection string for production booking storage. Development mode uses a labelled local JSON store if this is not set; production refuses bookings until MongoDB is configured.
- `AUTH_SECRET` — generate a long secret with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- `NEXT_PUBLIC_SITE_URL` — public canonical site origin.
- `NEXT_PUBLIC_SALON_ADDRESS`, `NEXT_PUBLIC_SALON_PHONE`, `NEXT_PUBLIC_SALON_EMAIL`, `NEXT_PUBLIC_SALON_TIMEZONE` — verified salon settings.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_TO` — optional real email delivery. Without these, bookings are still stored when MongoDB is configured, but the confirmation clearly says email delivery is not configured.

In `npm run dev`, when `MONGODB_URI` is absent, bookings use the clearly labelled local development store at `data/development-appointments.json` so the flow can be exercised without an external service. This single-process file adapter is for development only; production requires MongoDB. If `MONGODB_URI` is set but unreachable, the app reports the storage failure rather than falling back.

The sample location, testimonials, team photos, services, prices, opening hours, and schedules are editable demonstration content. Replace it with confirmed business information and approved imagery before publishing. The testimonials are explicitly labelled as samples. No payments, customer accounts, newsletter, gift cards, loyalty balances, or customer self-service cancellations are enabled.

## First administrator

Create a MongoDB database and set `MONGODB_URI`, `AUTH_SECRET`, and temporary `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` values. Use a unique password of at least 14 characters. Then run:

```powershell
npm run admin:bootstrap
```

The bootstrap creates one administrator and refuses to overwrite an existing account. Remove the temporary administrator environment values after the command finishes. There is no public admin registration route. Staff can sign in at `/admin/login`; only administrators can change appointment statuses.

## Booking behavior

- Appointment dates use `NEXT_PUBLIC_SALON_TIMEZONE`, opening hours, service duration, a 30-minute booking interval, two-hour minimum lead time, and a 90-day advance window.
- Each professional has a service specialty, weekly work schedule, and break in `lib/staff.ts`.
- Mongoose appointment records store UTC instants. A unique reservation-slot index prevents simultaneous overlapping bookings across application processes. Cancelled reservations are released.
- Server-side Zod validation, rechecked availability, and a booking-attempt rate limit protect booking submissions.
- The included in-process rate limiter is suitable for a single-instance starter. Use a shared rate-limit store at deployment if running multiple instances.
- The API returns an appointment reference only after the booking is stored.
- Email status is reported as sent, not configured, or failed; failed SMTP delivery does not falsely imply the email was sent.

## Commands

```powershell
npm run dev
npm run typecheck
npm test
npm run build
npm start
```

## Structure

- `app/` — App Router pages, metadata, and public/admin API routes
- `components/` — reusable responsive site, booking, and admin UI
- `lib/config.ts` — business identity, contact settings, hours and booking rules
- `lib/services.ts`, `lib/staff.ts` — editable demonstration catalog and staff schedules
- `lib/booking.ts`, `lib/models.ts`, `lib/db.ts` — validated booking logic and MongoDB persistence
- `scripts/create-admin.ts` — explicit, non-destructive initial administrator setup

The live business address, contact details, service details, final policies, approved photography, SMTP delivery and MongoDB deployment need the salon owner&apos;s confirmed information and credentials before launch.
