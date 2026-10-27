import type { MetadataRoute } from "next";
import { services } from "@/lib/services";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/services", "/about", "/team", "/gallery", "/contact", "/policies", "/privacy", "/terms"];
  return [
    ...paths.map((path) => ({
      url: new URL(path, baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: path === "/" ? "weekly" as const : "monthly" as const,
      priority: path === "/" ? 1 : 0.6,
    })),
    ...services.filter((service) => service.active).map((service) => ({
      url: new URL(`/services/${service.id}`, baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
