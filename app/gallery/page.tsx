import type { Metadata } from "next";
import GalleryGrid from "@/components/gallery-grid";

export const metadata: Metadata = {
  title: "The studio",
  description: "A glimpse into the Pink petals salon experience.",
};

export default function GalleryPage() {
  return (
    <main id="main-content">
      <section className="page-intro"><span className="eyebrow">A FEEL FOR THE PLACE</span><h1 className="display-title">A little look<br /><em>around here.</em></h1><p className="body-copy">A visual moodboard for your next visit. Images are illustrative and can be replaced with the salon&apos;s own licensed photography.</p></section>
      <section className="section-wrap gallery-page"><GalleryGrid /></section>
    </main>
  );
}
