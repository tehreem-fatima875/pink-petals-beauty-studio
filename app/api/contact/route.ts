import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80).regex(/^[^\u0000-\u001f\u007f]+$/),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(`contact:${key}`, 3, 10 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "Please wait before sending another message." }, { status: 429 });
  if (Number(request.headers.get("content-length") ?? 0) > 8192) {
    return NextResponse.json({ error: "Your message is too large." }, { status: 413 });
  }
  let body: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > 8192) {
      return NextResponse.json({ error: "Your message is too large." }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Please send a valid message." }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid name, email and message." }, { status: 400 });
  const { SMTP_HOST, SMTP_FROM, SMTP_TO, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_FROM || !SMTP_TO) {
    return NextResponse.json({ error: "The contact form is not connected yet. Please contact the salon by phone or email." }, { status: 503 });
  }
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: SMTP_USER && SMTP_PASSWORD ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    });
    await transporter.sendMail({
      from: SMTP_FROM,
      to: SMTP_TO,
      replyTo: parsed.data.email,
      subject: `Pink petals website enquiry from ${parsed.data.name}`,
      text: `${parsed.data.name} (${parsed.data.email}) wrote:\n\n${parsed.data.message}`,
    });
    return NextResponse.json({ delivered: true });
  } catch (error) {
    console.error("Contact email delivery failed:", error);
    return NextResponse.json({ error: "We couldn't deliver your message. Please try again later." }, { status: 503 });
  }
}
