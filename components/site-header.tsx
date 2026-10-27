"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { salon } from "@/lib/config";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "Our story" },
  { href: "/team", label: "The team" },
  { href: "/gallery", label: "The studio" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 24);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <Link className="brand" href="/" onClick={() => setOpen(false)} aria-label={`${salon.name} home`}>
        <span className="brand-symbol" aria-hidden="true">✿</span>
        <span className="brand-word">Pink petals<small>{salon.descriptor}</small></span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>
      <Link className="header-book" href="/book">Book an appointment <ArrowUpRight size={15} strokeWidth={1.6} /></Link>
      <button
        className="menu-button"
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((state) => !state)}
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={reducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {navLinks.map((link) => <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
            <Link href="/book" className="mobile-book" onClick={() => setOpen(false)}>Book an appointment <ArrowUpRight size={16} /></Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
