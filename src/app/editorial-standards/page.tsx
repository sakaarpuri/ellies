import type { Metadata } from "next";
import Link from "next/link";
import { ContactCTA } from "@/components/ContactCTA";
import { JsonLdScript } from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

const description =
  "Ellie’s Botanics editorial standards for Ayurveda-informed herbal wellness education, careful claims, consultation boundaries, and content updates.";

export const metadata: Metadata = pageMetadata({
  title: "Editorial Standards | Responsible Herbal Wellness Education",
  description,
  path: "/editorial-standards",
});

const standards = [
  {
    title: "Traditional knowledge with context",
    body: "Ayurvedic and botanical ideas are explained with attention to preparation, routine, season, individual suitability, and practical limits.",
  },
  {
    title: "Careful health language",
    body: "Articles avoid medical promises, guaranteed outcomes, and one-size-fits-all recommendations. Personal questions belong in qualified consultation.",
  },
  {
    title: "Plain-language education",
    body: "The goal is to make herbal concepts easier to understand so readers can ask better questions and make more informed choices.",
  },
  {
    title: "Review and updates",
    body: "Core pages and Herbal Wisdom articles are reviewed as the site develops, with update dates shown where article content changes.",
  },
];

export default function EditorialStandardsPage() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Editorial Standards</p>
        <h1>Responsible herbal education, written with care.</h1>
        <p>
          Ellie&apos;s Botanics publishes Ayurveda-informed wellness education for readers who want
          clear explanations, practical context, and measured guidance.
        </p>
      </section>

      <section className="standards-grid" aria-label="Editorial standards">
        {standards.map((standard) => (
          <article key={standard.title}>
            <h2>{standard.title}</h2>
            <p>{standard.body}</p>
          </article>
        ))}
      </section>

      <section className="answer-section" aria-labelledby="consultation-boundaries">
        <div>
          <p className="eyebrow">Personal Guidance</p>
          <h2 id="consultation-boundaries">When individual context matters.</h2>
        </div>
        <p>
          General education can explain principles, but personal guidance should consider health
          history, current medicines, routine, age, pregnancy or nursing status, and the nature of
          the concern. Ellie&apos;s Botanics directs personal enquiries toward professional
          consultation rather than generic answers.
        </p>
      </section>

      <section className="note-panel">
        <h2>Questions about content?</h2>
        <p>
          If you notice an unclear explanation or want to ask how a topic should be interpreted,
          write to Ellie&apos;s Botanics directly.
        </p>
        <Link className="button secondary" href="/contact">
          Contact Ellie&apos;s Botanics
        </Link>
      </section>

      <ContactCTA />
      <JsonLdScript
        data={[
          webPageJsonLd({
            path: "/editorial-standards",
            name: "Editorial Standards",
            description,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Editorial Standards", path: "/editorial-standards" },
          ]),
        ]}
      />
    </>
  );
}
