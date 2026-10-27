import type { Metadata } from "next";
import ServiceGrid from "@/components/service-grid";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Our services",
  description: "Explore hair, color, nail, skin and beauty rituals at Pink petals.",
};

export default function ServicesPage() {
  return (
    <main id="main-content">
      <section className="page-intro">
        <span className="eyebrow">THOUGHTFUL RITUALS, LOVELY RESULTS</span>
        <h1 className="display-title">A little something<br /><em>for every you.</em></h1>
        <p className="body-copy">Explore our treatments, their timing and transparent starting prices. Your artist can help tailor each visit to you.</p>
      </section>
      <section className="section-wrap service-section services-page">
        <ServiceGrid services={services.filter((service) => service.active)} />
      </section>
      <section className="page-bottom-cta"><h2>Found your feel-good?</h2><a className="button button-primary" href="/book">Book a visit <span aria-hidden="true">↗</span></a></section>
    </main>
  );
}
