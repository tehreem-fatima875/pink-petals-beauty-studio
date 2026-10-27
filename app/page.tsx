import type { Metadata } from "next";
import { HomeFaq, HomeGallery, HomeHero, HomeNotes, HomeQuote, HomeServices, HomeStory } from "@/components/home-sections";
import { salon } from "@/lib/config";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: `${salon.name} — ${salon.tagline}`,
  description: salon.description,
};

export default function HomePage() {
  return (
    <main id="main-content">
      <HomeHero />
      <HomeServices services={services.filter((service) => service.active && service.featured)} />
      <HomeStory />
      <HomeQuote />
      <HomeNotes />
      <HomeGallery />
      <HomeFaq />
      <section className="home-book-cta">
        <span className="eyebrow">YOUR CHAIR IS WAITING</span>
        <h2 className="display-title">Make a little<br /><em>time for you.</em></h2>
        <a className="button button-primary" href="/book">Book an appointment <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  );
}
