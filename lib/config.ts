export const salon = {
  name: "Pink petals",
  descriptor: "BEAUTY STUDIO",
  tagline: "Beauty, in full bloom.",
  description:
    "Thoughtful hair, skin and nail rituals in a welcoming neighborhood beauty studio.",
  currency: "USD",
  locale: "en-US",
  timezone: process.env.NEXT_PUBLIC_SALON_TIMEZONE || "America/Los_Angeles",
  address: process.env.NEXT_PUBLIC_SALON_ADDRESS || "Add your salon address before launch",
  phone: process.env.NEXT_PUBLIC_SALON_PHONE || "",
  email: process.env.NEXT_PUBLIC_SALON_EMAIL || "",
  hours: [
    { day: "Monday", open: null, close: null },
    { day: "Tuesday", open: "09:00", close: "18:00" },
    { day: "Wednesday", open: "09:00", close: "18:00" },
    { day: "Thursday", open: "09:00", close: "18:00" },
    { day: "Friday", open: "09:00", close: "18:00" },
    { day: "Saturday", open: "09:00", close: "18:00" },
    { day: "Sunday", open: "09:00", close: "18:00" },
  ],
  booking: {
    intervalMinutes: 30,
    minimumLeadMinutes: 120,
    maximumAdvanceDays: 90,
    cancellationHours: 24,
  },
} as const;
