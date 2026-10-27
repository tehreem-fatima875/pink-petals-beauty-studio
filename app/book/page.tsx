import type { Metadata } from "next";
import BookingFlow from "@/components/booking-flow";
import { salon } from "@/lib/config";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Book an appointment",
  description: "Choose a Pink petals salon service and request an appointment.",
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; staff?: string }>;
}) {
  const { service, staff: staffId } = await searchParams;
  return (
    <main id="main-content">
      <section className="page-intro booking-intro-page">
        <span className="eyebrow">YOUR MOMENT STARTS HERE</span>
        <h1 className="display-title">Let&apos;s make a little<br /><em>time for you.</em></h1>
        <p className="body-copy">A few details and we&apos;ll help you find a time. Appointments are shown in {salon.timezone}.</p>
      </section>
      <section className="section-wrap booking-section">
        <BookingFlow
          services={services.filter((item) => item.active)}
          initialService={service}
          initialStaff={staffId}
          storageMode={process.env.MONGODB_URI ? "mongodb" : process.env.NODE_ENV === "production" ? "not_configured" : "development_file"}
        />
      </section>
    </main>
  );
}
