import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { findService, services } from "@/lib/services";

export function generateStaticParams() {
  return services.filter((service) => service.active).map((service) => ({ id: service.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const service = findService(id);
  return service ? {
    title: service.name,
    description: service.description,
  } : {};
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = findService(id);
  if (!service) notFound();
  return (
    <main id="main-content">
      <section className="detail-hero">
        <div className="detail-hero-copy">
          <Link className="text-link" href="/services"><ArrowLeft size={14} /> All services</Link>
          <span className="eyebrow">{service.category} · A PINK PETALS RITUAL</span>
          <h1 className="display-title">{service.name.split(" ").slice(0, -1).join(" ")}<br /><em>{service.name.split(" ").slice(-1)}</em></h1>
          <p className="body-copy">{service.description} Your appointment begins with a conversation so your artist can understand what feels right for you.</p>
          <div className="detail-facts"><span><Clock3 size={15} /> {service.duration} minutes</span><strong>${service.price}</strong></div>
          <Link className="button button-primary" href={`/book?service=${service.id}`}>Book this service <ArrowUpRight size={15} /></Link>
        </div>
        <div className="detail-hero-image"><Image src={service.image} alt={`${service.name} treatment`} fill priority sizes="(max-width: 720px) 100vw, 50vw" /></div>
      </section>
      <section className="section-wrap detail-info">
        <div><span className="eyebrow">YOUR VISIT</span><h2 className="display-title">A moment,<br /><em>just for you.</em></h2></div>
        <div><h2>What to expect</h2><p className="body-copy">{service.description} We&apos;ll talk through your preferences and any sensitivities before getting started. Service times and prices are starting estimates; final recommendations are discussed with your artist.</p><h2>Before you arrive</h2><p className="body-copy">Arrive a few minutes early and let us know about any preferences or accessibility needs when booking. For questions about suitability, please contact the salon before reserving.</p><p className="detail-disclaimer">This beauty service is not medical advice or treatment. Individual experiences can vary.</p></div>
      </section>
      <section className="page-bottom-cta"><h2>Make room for a little lovely.</h2><Link className="button button-primary" href={`/book?service=${service.id}`}>Reserve {service.name} <ArrowUpRight size={15} /></Link></section>
    </main>
  );
}
