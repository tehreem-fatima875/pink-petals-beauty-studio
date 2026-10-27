import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { staff } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Meet the team",
  description: "Meet the Pink petals beauty and hair professionals.",
};

export default function TeamPage() {
  const team = staff.filter((person) => person.id !== "any");
  return (
    <main id="main-content">
      <section className="page-intro"><span className="eyebrow">GOOD PEOPLE, GOOD HANDS</span><h1 className="display-title">Meet your<br /><em>beauty people.</em></h1><p className="body-copy">A small team of thoughtful artists, here to listen and help you feel like yourself.</p></section>
      <section className="section-wrap team-grid">
        {team.map((person) => (
          <article className="team-card" key={person.id}>
            <div className="team-image"><Image src={person.image} alt={person.name} fill sizes="(max-width: 720px) 90vw, 30vw" /></div>
            <span className="eyebrow">{person.title}</span><h2>{person.name}</h2><p className="body-copy">A thoughtful beauty professional focused on listening, care and a lovely experience.</p>
            <div className="team-specialties">{person.specialties.join(" · ")}</div>
            <Link className="text-link" href={`/book?staff=${person.id}`}>Book with {person.name.split(" ")[0]} <ArrowUpRight size={14} /></Link>
          </article>
        ))}
      </section>
      <section className="page-bottom-cta"><h2>Not sure who to choose?</h2><Link className="button button-primary" href="/book">Let us find your artist <ArrowUpRight size={14} /></Link></section>
    </main>
  );
}
