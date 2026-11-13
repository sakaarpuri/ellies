import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ArohiniShowcase } from "@/components/ArohiniShowcase";
import { ConsultationIntakeSection } from "@/components/ConsultationIntakeSection";
import { getFeaturedPosts } from "@/lib/wisdom";
import "./preview.css";

export const metadata: Metadata = {
  title: "Ellie's Botanics | Alternate Design Preview",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.elliesbotanics.com/" },
};

export default function AlternatePreview() {
  // This comparison is local-only until the owner chooses a new direction.
  if (process.env.NODE_ENV === "production") notFound();
  const posts = getFeaturedPosts(3);
  return (
    <div className="alternate-preview">
      <section className="alternate-hero" aria-labelledby="alternate-title">
        <Image src="/images/arohini-preview-wide.webp" alt="A woman reading at home with Arohini on the table beside her" fill priority sizes="100vw" />
        <div className="alternate-hero-copy">
          <p className="eyebrow">Ayurvedic care. Everyday wellbeing.</p>
          <h1 id="alternate-title">Ellie&apos;s <br />Botanics.</h1>
          <p>Herbal traditions, thoughtful daily care, and a little more space for you.</p>
          <Link className="button primary" href="#meet-arohini">Meet Arohini <ArrowDown size={18} aria-hidden="true" /></Link>
        </div>
      </section>
      <div className="alternate-principles">
        <span>Rooted in Ayurveda</span><span>Quality-approved ingredients</span><span>Care for women 40+</span>
      </div>
      <ArohiniShowcase />
      <section className="alternate-journal" aria-labelledby="alternate-journal-title">
        <div className="alternate-section-heading">
          <div><p className="eyebrow">The journal</p><h2 id="alternate-journal-title">A little knowledge.<br />A more thoughtful routine.</h2></div>
          <Link href="/education" className="text-link">Read the journal <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="alternate-articles">
          {posts.map(post => (
            <article key={post.slug}>
              <Link href={`/education/${post.slug}`}>
                {/* Existing licensed journal photographs are shared with the current site. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.heroImage} alt={post.heroImageAlt} loading="lazy" width="600" height="450" />
                <p className="eyebrow">{post.category}</p><h3>{post.title}</h3><span>{post.readingTime}</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <div className="alternate-consultation"><ConsultationIntakeSection /></div>
    </div>
  );
}
