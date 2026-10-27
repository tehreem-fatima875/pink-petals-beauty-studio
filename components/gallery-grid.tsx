"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const images = [
  { category: "The studio", src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85", alt: "Sunlit salon interior" },
  { category: "Hair", src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85", alt: "Stylist creating a salon look" },
  { category: "Skin", src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85", alt: "Relaxing facial treatment" },
  { category: "Nails", src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85", alt: "Manicure in soft natural light" },
  { category: "The studio", src: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=85", alt: "Beauty salon detail" },
  { category: "Hair", src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=85", alt: "Hair and beauty portrait" },
  { category: "Nails", src: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1200&q=85", alt: "Nail polish detail" },
  { category: "Skin", src: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=85", alt: "Skincare ritual" },
];

export default function GalleryGrid() {
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const filtered = images.map((image, index) => ({ ...image, index })).filter((image) => category === "All" || image.category === category);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected !== null && !dialog.open) dialog.showModal();
    if (selected === null && dialog.open) dialog.close();
  }, [selected]);

  return (
    <>
      <div className="service-filter" role="group" aria-label="Filter gallery">
        {["All", "The studio", "Hair", "Skin", "Nails"].map((filter) => (
          <button key={filter} type="button" className="filter-chip" aria-pressed={category === filter} onClick={() => setCategory(filter)}>{filter}</button>
        ))}
      </div>
      <div className="gallery-grid">
        {filtered.map((image) => (
          <button className="gallery-item" type="button" key={image.src} onClick={() => setSelected(image.index)} aria-label={`View ${image.alt}`}>
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 720px) 48vw, 32vw" />
          </button>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        className="gallery-lightbox"
        aria-label={selected === null ? "Gallery image" : images[selected].alt}
        onClose={() => setSelected(null)}
        onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}
      >
        {selected !== null && <>
          <button type="button" className="lightbox-close" aria-label="Close image" onClick={() => setSelected(null)}><X size={22} /></button>
          <Image src={images[selected].src} alt={images[selected].alt} width={1200} height={900} sizes="90vw" />
          <p>{images[selected].alt}</p>
        </>}
      </dialog>
    </>
  );
}
