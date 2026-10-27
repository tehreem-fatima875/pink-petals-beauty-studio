import nodemailer from "nodemailer";

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

export async function sendBookingConfirmation(input: {
  email: string;
  name: string;
  reference: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
}) {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  if (!host || !from) return "not_configured" as const;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  await transporter.sendMail({
    from,
    to: input.email,
    subject: `Your Pink petals appointment · ${input.reference}`,
    text: [
      `Hello ${input.name},`,
      "",
      `Your ${input.serviceName} appointment with ${input.staffName} is confirmed.`,
      `Date: ${input.date}`,
      `Time: ${input.time}`,
      `Reference: ${input.reference}`,
      "",
      "If you need to change your appointment, please contact the salon.",
    ].join("\n"),
  });
  return "sent" as const;
}
