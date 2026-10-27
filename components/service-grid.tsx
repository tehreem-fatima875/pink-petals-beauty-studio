"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SalonService } from "@/lib/services";

const filters = ["All", "Hair", "Color", "Nails", "Skin", "Beauty"] as const;

export default function ServiceGrid({
  services,
  compact = false,
}: {
  services: SalonService[];
  compact?: boolean;
}) {
  const [category, setCategory] = useState<(typeof filters)[number]>("All");
  const [search, setSearch] = useState("");
  const visible = useMemo(() => services
    .filter((service) => category === "All" || service.category === category)
    .filter((service) => `${service.name} ${service.description} ${service.category}`.toLowerCase().includes(search.toLowerCase()))
    .slice(0, compact ? 4 : undefined), [category, compact, search, services]);

  return (
    <>
      {!compact && (
        <div className="service-controls">
          <div className="service-filter" role="group" aria-label="Filter services by category">
            {filters.map((filter) => (
              <button
                className="filter-chip"
                type="button"
                key={filter}
                aria-pressed={category === filter}
                onClick={() => setCategory(filter)}
              >
                {filter === "Skin" ? "Skin & facials" : filter === "Beauty" ? "Brows & beauty" : filter}
              </button>
            ))}
          </div>
          <label className="service-search-label">
            <span className="sr-only">Search services</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a treatment…" />
          </label>
        </div>
      )}
      <div className="service-grid" aria-live="polite">
        {visible.map((service) => (
          <article className="service-card" key={service.id}>
            <Link href={`/services/${service.id}`} className="service-card-image" aria-label={`Learn about ${service.name}`}>
              <Image src={service.image} alt={`${service.name} at Pink petals`} fill sizes="(max-width: 720px) 48vw, (max-width: 1050px) 45vw, 24vw" />
            </Link>
            <div className="service-card-body">
              <span className="service-card-category">{service.category}</span>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className="service-card-meta"><span><Clock3 size={12} /> {service.duration} min</span><strong>${service.price}</strong></div>
              <Link className="service-card-link" href={`/book?service=${service.id}`}>Reserve this ritual <ArrowUpRight size={13} /></Link>
            </div>
          </article>
        ))}
        {visible.length === 0 && <p className="service-empty">No treatments match that search. Try another name or category.</p>}
      </div>
    </>
  );
}
