import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking & cancellation policy" };

export default function PoliciesPage() {
  return (
    <main id="main-content">
      <section className="page-intro"><span className="eyebrow">THE LITTLE DETAILS</span><h1 className="display-title">Our booking<br /><em>policies.</em></h1><p className="body-copy">Sample policy copy; review and replace with your salon&apos;s actual terms before launch.</p></section>
      <section className="section-wrap policy-content">
        <h2>Appointments</h2><p>Online requests are confirmed only when the booking system saves the appointment and provides a reference number. Please arrive on time for your visit.</p>
        <h2>Changes and cancellations</h2><p>Please contact the salon at least 24 hours before your appointment to request a change or cancellation. Specific fees and refund terms must be set by the business before this policy is published.</p>
        <h2>Pricing</h2><p>Service prices shown on the website are starting prices. Any changes to the scope or price should be discussed with you before the service begins.</p>
        <h2>Accessibility and sensitivities</h2><p>Let the salon know about accessibility needs, allergies, or product sensitivities before your visit so the team can discuss accommodations.</p>
      </section>
    </main>
  );
}
