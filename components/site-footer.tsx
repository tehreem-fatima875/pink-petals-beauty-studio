import Link from "next/link";
import { Instagram, MapPin, Phone, Mail } from "lucide-react";
import { salon } from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link className="brand footer-brand" href="/">
            <span className="brand-symbol" aria-hidden="true">✿</span>
            <span className="brand-word">Pink petals<small>{salon.descriptor}</small></span>
          </Link>
          <p>Good beauty. Good people.<br />A little more you.</p>
          <a className="footer-social" href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
            <Instagram size={17} strokeWidth={1.5} />
          </a>
        </div>
        <div>
          <h2>Find your ritual</h2>
          <Link href="/services">All services</Link>
          <Link href="/team">Meet the team</Link>
          <Link href="/gallery">The studio</Link>
          <Link href="/book">Book an appointment</Link>
        </div>
        <div>
          <h2>Come by</h2>
          <p><MapPin size={14} />{salon.address}</p>
          <p><Phone size={14} />{salon.phone || "Add a salon phone number"}</p>
          <p><Mail size={14} />{salon.email || "Add a salon email address"}</p>
        </div>
        <div>
          <h2>Our hours</h2>
          {salon.hours.map((hours) => (
            <p className="footer-hours" key={hours.day}>
              <span>{hours.day}</span><span>{hours.open ? `${hours.open.slice(0, 2)}–${hours.close?.slice(0, 2)}` : "Closed"}</span>
            </p>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {salon.name}. The details are yours to make real.</span>
        <div><Link href="/policies">Booking &amp; cancellation</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </div>
    </footer>
  );
}
