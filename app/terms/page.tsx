import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <main id="main-content">
      <section className="page-intro"><span className="eyebrow">THE FINE PRINT</span><h1 className="display-title">Terms of<br /><em>use.</em></h1><p className="body-copy">Sample terms; seek legal review and replace with the salon&apos;s actual business terms before launch.</p></section>
      <section className="section-wrap policy-content">
        <h2>Website information</h2><p>Service descriptions, prices and availability are provided for general information and may change. Booking is not confirmed until the website returns an appointment reference.</p>
        <h2>Online booking</h2><p>You are responsible for providing accurate contact details. The salon may contact you about the appointment you requested. Do not submit sensitive personal or health information through the booking notes.</p>
        <h2>Business details</h2><p>Replace this sample content with the verified legal name, jurisdiction and terms applicable to the salon.</p>
      </section>
    </main>
  );
}
