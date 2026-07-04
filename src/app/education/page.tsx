import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { JsonLdScript } from "@/components/JsonLd";
import { JournalList } from "@/components/JournalList";
import { getAllPosts } from "@/lib/wisdom";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

const description =
  "Explore Ellie’s Botanics Herbal Wisdom guide to Ayurvedic herbs, daily wellness, ingredient traditions, and responsible herbal care.";

export const metadata: Metadata = pageMetadata({
  title: "The Journal | Practical Ayurvedic Health Tips",
  description,
  path: "/education",
});

export default function EducationPage() {
  const posts = getAllPosts();

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">The Journal</p>
        <h1>Practical tips for everyday health.</h1>
        <p>
          Short, clear reading on herbs, routines, and safe use — written for everyday life, not
          for specialists.
        </p>
      </section>

      <Suspense fallback={<div className="journal-list" aria-hidden="true" />}>
        <JournalList posts={posts} />
      </Suspense>

      <section className="answer-section" aria-labelledby="journal-context-title">
        <div>
          <p className="eyebrow">Reading Note</p>
          <h2 id="journal-context-title">Use these articles as a starting point.</h2>
        </div>
        <p>
          The journal explains herbs, routines, preparation, and safe use in plain language.
          Personal choices should still consider age, health history, medicines, and a doctor&apos;s
          guidance when needed.
        </p>
      </section>

      <section className="note-panel">
        <h2>Have a question about your own situation?</h2>
        <p>
          Share a short note through the consultation form and Ellie&apos;s Botanics can follow up
          for professional Ayurvedic guidance.
        </p>
        <Link className="button secondary" href="/#joint-comfort-check-in">
          Ask about your situation
        </Link>
      </section>

      <footer className="mini-footer">
        <p>Education, not diagnosis. © 2026 Ellie&apos;s Botanics</p>
      </footer>
      <JsonLdScript
        data={[
          webPageJsonLd({
            path: "/education",
            name: "The Journal",
            description,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Journal", path: "/education" },
          ]),
        ]}
      />
    </>
  );
}
