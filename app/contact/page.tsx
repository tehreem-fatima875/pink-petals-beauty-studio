import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/contact-form";
import { salon } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Pink petals beauty studio.",
};

export default function ContactPage() {
  return (
    <main id="main-content">
      <section className="page-intro"><span className="eyebrow">WE WOULD LOVE A LITTLE HELLO</span><h1 className="display-title">Let&apos;s have<br /><em>a conversation.</em></h1><p className="body-copy">Questions about a visit, a service or what might feel right for you? We&apos;re here to help.</p></section>
      <section className="section-wrap contact-grid">
        <div className="contact-details">
          <div className="contact-detail"><MapPin size={17} /><span><strong>Come find us</strong><small>{salon.address}<br />Replace with the salon&apos;s verified address before launch.</small></span></div>
          <div className="contact-detail"><Phone size={17} /><span><strong>Call the studio</strong><small>{salon.phone || "Add a verified salon phone number"}</small></span></div>
          <div className="contact-detail"><Mail size={17} /><span><strong>Send us a note</strong><small>{salon.email || "Add a verified salon email address"}</small></span></div>
          <div><span className="eyebrow">WHEN WE&apos;RE HERE</span>{salon.hours.map((hours) => <p className="contact-hours" key={hours.day}><span>{hours.day}</span><span>{hours.open ? `${hours.open.slice(0, 2)}:00–${hours.close?.slice(0, 2)}:00` : "Closed"}</span></p>)}</div>
          <p className="booking-notice">The address, contact details and hours are setup placeholders. Update them in <code>lib/config.ts</code> or the environment before launch.</p>
        </div>
        <div><span className="eyebrow">SEND A LITTLE NOTE</span><h2 className="display-title contact-form-title">We&apos;re listening.</h2><ContactForm /></div>
      </section>
    </main>
  );
}
