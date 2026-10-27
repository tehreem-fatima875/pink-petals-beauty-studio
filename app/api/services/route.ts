import { NextResponse } from "next/server";
import { services } from "@/lib/services";

export function GET() {
  return NextResponse.json({ services: services.filter((service) => service.active) });
}
