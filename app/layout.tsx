import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { salon } from "@/lib/config";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${salon.name} | ${salon.tagline}`,
    template: `%s | ${salon.name}`,
  },
  description: salon.description,
  applicationName: salon.name,
  openGraph: {
    type: "website",
    siteName: salon.name,
    title: `${salon.name} | ${salon.tagline}`,
    description: salon.description,
    images: [{ url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85", width: 1200, height: 630, alt: "Pink petals beauty studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${salon.name} | ${salon.tagline}`,
    description: salon.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f9f5f0",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="announcement"><span>Thoughtful beauty, unrushed.</span><span className="announcement-divider">✳</span><a href="/book">Reserve your visit <span aria-hidden="true">↗</span></a></div>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
