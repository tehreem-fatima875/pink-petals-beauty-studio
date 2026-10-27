import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Our story",
  description: "Meet the philosophy behind Pink petals, a neighborhood beauty studio made for feeling like yourself.",
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className="page-intro">
        <span className="eyebrow">MORE THAN A MIRROR MOMENT</span>
        <h1 className="display-title">Beauty should feel<br /><em>like coming home.</em></h1>
        <p className="body-copy">Pink petals is a place for thoughtful care, good conversations and a little room to exhale.</p>
      </section>
      <section className="editorial-split about-split">
        <div className="editorial-image"><Image src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1100&q=85" alt="A softly lit beauty studio" fill sizes="(max-width: 720px) 90vw, 44vw" /></div>
        <div className="editorial-copy"><span className="eyebrow">OUR LITTLE PHILOSOPHY</span><h2 className="display-title">Expert hands.<br /><em>Gentle hearts.</em></h2><p className="body-copy">We believe beauty should feel like you. That means listening first, making space for the details that matter to you, and offering thoughtful service without rushing the moment.</p><p className="body-copy">From the welcome at the door to the last look in the mirror, we want every part of your visit to feel considered, calm and entirely your own.</p><div className="signature">With love, the Pink petals team</div></div>
      </section>
      <section className="section-wrap"><div className="story-values"><article><span>01</span><h2>Listen, then create</h2><p>Every visit begins with a real conversation about what you want.</p></article><article><span>02</span><h2>Care without hurry</h2><p>Thoughtful details and enough time to enjoy the experience.</p></article><article><span>03</span><h2>Feel like yourself</h2><p>We celebrate your own sense of beauty, never a one-size-fits-all ideal.</p></article></div></section>
      <section className="page-bottom-cta"><h2>We&apos;d love to welcome you.</h2><Link href="/book" className="button button-primary">Find your feel-good <ArrowUpRight size={15} /></Link></section>
    </main>
  );
}
