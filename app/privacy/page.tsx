import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <main id="main-content">
      <section className="page-intro"><span className="eyebrow">YOUR PRIVACY MATTERS</span><h1 className="display-title">A clear note<br /><em>about your data.</em></h1><p className="body-copy">This sample privacy notice must be reviewed for your salon&apos;s jurisdiction and real data practices before launch.</p></section>
      <section className="section-wrap policy-content">
        <h2>Information you provide</h2><p>Booking requests collect your name, email address, phone number, selected service, team member, appointment time and any note you choose to share. Contact messages collect your name, email and message.</p>
        <h2>How information is used</h2><p>Information is used to manage appointments and respond to enquiries. Booking records are stored in the configured MongoDB database. Administrators with access may view appointment details to provide salon services.</p>
        <h2>Retention and security</h2><p>Retention periods, hosting region, backups and access processes must be defined by the business. Do not use this placeholder as a substitute for jurisdiction-specific legal review.</p>
        <h2>Contact</h2><p>Replace this section with the salon&apos;s verified privacy contact and instructions for applicable data requests.</p>
      </section>
    </main>
  );
}
