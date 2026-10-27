"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ServiceGrid from "@/components/service-grid";
import type { SalonService } from "@/lib/services";

const photos = [
  { src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=82", alt: "A calming facial ritual" },
  { src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=82", alt: "Thoughtful nail care" },
  { src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=82", alt: "A stylist at work" },
  { src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=82", alt: "A welcoming beauty studio" },
];

const faqs = [
  { q: "How do I book an appointment?", a: "Choose a service, a beauty professional, and a time through our online booking flow. Your request is confirmed only after it has been saved by the booking system." },
  { q: "What is your cancellation policy?", a: "Please contact the salon at least 24 hours before your visit if you need to change or cancel. Replace this sample policy with your final business terms before launch." },
  { q: "Can I ask for help choosing a service?", a: "Of course. Send us a note through the contact page and our team can help you find the right appointment." },
];

export function HomeHero() {
  const reducedMotion = useReducedMotion();
  const reveal = (delay: number) => reducedMotion ? {} : {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay },
  };
  return (
    <>
      <section className="home-hero">
          <div className="hero-content">
            <motion.div className="eyebrow" {...reveal(0.08)}>A NEIGHBORHOOD BEAUTY HOUSE</motion.div>
            <motion.h1 className="hero-title" {...reveal(0.17)}><span>Beauty, in</span><em>full bloom.</em></motion.h1>
            <motion.p {...reveal(0.28)}>A little time for you. Thoughtful hands, lovely rituals, and space to feel a little more like yourself.</motion.p>
            <motion.div className="hero-actions" {...reveal(0.37)}>
              <Link className="button button-primary" href="/book">Book an appointment <ArrowUpRight size={15} /></Link>
              <Link className="text-link" href="/services">Explore our services <ArrowDown size={13} /></Link>
            </motion.div>
            <motion.div className="hero-proof" {...reveal(0.47)}><span className="proof-stars" aria-label="Sample review content">✳ ✳ ✳</span><span>Good beauty. Good people.</span></motion.div>
          </div>
          <motion.div className="hero-photo" initial={reducedMotion ? false : { clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} transition={{ duration: 1, delay: 0.12 }}>
            <Image src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1500&q=88" alt="A beauty professional styling a guest's hair" fill priority sizes="(max-width: 720px) 100vw, 58vw" />
            <div className="hero-note"><span>✿</span>your little<br />happy place</div>
            <div className="hero-image-caption"><span>THE PINK PETALS EXPERIENCE</span><span>01 / A moment to feel like you</span></div>
          </motion.div>
          <span className="hero-side-label">A SOFTER KIND OF SALON EXPERIENCE</span>
      </section>
      <div className="trust-strip" aria-label="Salon specialties">
          <span>Thoughtful hair</span><span>Skin rituals</span><span>Manicures</span><span>Beauty, at your pace</span>
      </div>
    </>
  );
}

export function HomeServices({ services }: { services: SalonService[] }) {
  return (
    <section className="section-wrap service-section" id="services">
      <div className="section-heading">
        <div><span className="eyebrow">A LITTLE SOMETHING FOR YOU</span><h2 className="display-title">Choose your<br /><em>kind of lovely.</em></h2></div>
        <p>Thoughtful treatments, unrushed moments, and the kind of care that lets you just exhale.</p>
      </div>
      <div className="section-services-grid"><ServiceGrid services={services} compact /></div>
      <div className="section-cta"><Link className="button button-outline" href="/services">Explore all services <ArrowRight size={14} /></Link></div>
    </section>
  );
}

export function HomeStory() {
  return (
    <section className="editorial-split">
      <div className="editorial-image">
        <Image src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1100&q=85" alt="Soft daylight in a calm beauty studio" fill sizes="(max-width: 720px) 90vw, 44vw" />
      </div>
      <div className="editorial-copy">
        <span className="eyebrow">MORE THAN A MIRROR MOMENT</span>
        <h2 className="display-title">Beauty should<br />feel like<br /><em>coming home.</em></h2>
        <p className="body-copy">Pink petals is a little space for good conversations, expert hands, and beauty that feels like you. No pressure. No rushing. Just really lovely care.</p>
        <p className="body-copy">Come as you are. Leave feeling a little more like yourself.</p>
        <Link className="button button-outline" href="/about">A little more about us <ArrowUpRight size={15} /></Link>
        <div className="signature">With love, the Pink petals team</div>
      </div>
    </section>
  );
}

export function HomeNotes() {
  const notes = [
    { text: "“I walked in needing a trim and walked out feeling like the main character. The team is just the loveliest.”", name: "Emma R.", service: "Hair guest" },
    { text: "“A warm welcome, thoughtful advice, and a color that feels so much like me.”", name: "Lauren M.", service: "Color guest" },
    { text: "“A quiet hour for myself and the loveliest facial. I already know I'll be back.”", name: "Nina T.", service: "Skin guest" },
  ];
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <div><span className="eyebrow">KIND WORDS, WARM HEARTS</span><h2 className="display-title">Little notes<br /><em>from our guests.</em></h2></div>
        <p>These example testimonials are placeholders. Replace them with genuine, approved customer feedback before publishing.</p>
      </div>
      <div className="review-grid">
        {notes.map((note) => (
          <article className="review-card" key={note.name}>
            <div className="review-stars" aria-hidden="true">✳ ✳ ✳</div>
            <blockquote>{note.text}</blockquote>
            <div className="review-credit"><span><strong>{note.name}</strong><small>{note.service} · sample testimonial</small></span></div>
          </article>
        ))}
      </div>
      <p className="review-sample-note">Sample testimonial copy — not verified customer reviews.</p>
    </section>
  );
}

export function HomeGallery() {
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <div><span className="eyebrow">A FEEL FOR THE PLACE</span><h2 className="display-title">Come as you are.<br /><em>Stay a little.</em></h2></div>
        <Link className="text-link" href="/gallery">Visit the gallery <ArrowUpRight size={14} /></Link>
      </div>
      <div className="gallery-strip">
        {photos.map((photo, index) => (
          <Link href="/gallery" className="gallery-tile" key={photo.src} aria-label={`Open salon gallery, image ${index + 1}`}>
            <Image src={photo.src} alt={photo.alt} width={600} height={700} sizes="(max-width: 720px) 45vw, 23vw" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomeFaq() {
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <div><span className="eyebrow">THE LITTLE DETAILS</span><h2 className="display-title">A few things<br /><em>you might wonder.</em></h2></div>
        <Link className="text-link" href="/policies">View our policies <ArrowUpRight size={14} /></Link>
      </div>
      <div className="faq-list">
        {faqs.map((faq) => <details className="faq-item" key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
      </div>
    </section>
  );
}

export function HomeQuote() {
  return <section className="quote-band"><span><Sparkles size={20} /></span><blockquote>“The best kind of beauty makes you feel <em>more like you.</em>”</blockquote><small>A LITTLE PINK PETALS PROMISE</small></section>;
}
