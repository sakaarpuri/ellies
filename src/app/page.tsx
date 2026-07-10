import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BotanicalCollage } from "@/components/BotanicalCollage";
import { ConsultationIntakeSection } from "@/components/ConsultationIntakeSection";
import { JsonLdScript } from "@/components/JsonLd";
import { getFeaturedPosts } from "@/lib/wisdom";
import { consultation, doctor } from "@/lib/site";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Ellie’s Botanics | Ayurvedic Herbal Wellness Guidance in India",
  description:
    "Ellie's Botanics offers Ayurveda-informed herbal wellness education, responsible self-care guidance, and consultation enquiries for readers in India and Punjab.",
  path: "/",
});

const ancientPoints = [
  { glyph: "रि", text: "Simple daily routines that fit real life" },
  { glyph: "प्र", text: "Home preparations — teas, powders, and oils" },
  { glyph: "सं", text: "Care that suits your age, season, and routine" },
];

const modernPoints = [
  "Which herb, how much, and how to use it — in plain words",
  "No miracle claims or exaggerated promises",
  "Clear advice on when to see a doctor",
];

export default function Home() {
  const featuredPosts = getFeaturedPosts(3);

  return (
    <>
      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">Ayurvedic Healthcare · Est. Punjab</p>
          <h1>
            Rooted in <span>ancient</span> wisdom. Built for modern health.
          </h1>
          <p>
            Herbal knowledge you can question, check, and trust — from the tradition that has
            practiced it longest.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/#joint-comfort-check-in">
              Start with a question
            </Link>
            <Link className="button secondary" href="/education">
              Read the journal
            </Link>
          </div>
        </div>
        <BotanicalCollage />
      </section>

      <section className="knowing-panel" aria-labelledby="knowing-title">
        <h2 id="knowing-title" className="sr-only">
          Two ways of knowing
        </h2>
        <div>
          <p className="eyebrow sage">The Ancient</p>
          <h3>Wisdom from generations of daily practice.</h3>
          <ul>
            {ancientPoints.map((point) => (
              <li key={point.text}>
                <span>{point.glyph}</span>
                {point.text}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">The Modern</p>
          <h3>Plain answers, honest advice.</h3>
          <ul>
            {modernPoints.map((point) => (
              <li key={point}>
                <span>✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="journal-section" aria-labelledby="journal-title">
        <div className="journal-heading">
          <div>
            <p className="eyebrow">The Journal</p>
            <h2 id="journal-title">Practical tips for everyday health.</h2>
          </div>
          <Link href="/education" className="text-link">
            All articles →
          </Link>
        </div>
        <div className="journal-row-grid">
          {featuredPosts.map((post, index) => (
            <Link key={post.slug} href={`/education/${post.slug}`} className="journal-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{post.title}</strong>
              <small>
                {post.category} · {post.readingTime.replace(" read", "")}
              </small>
            </Link>
          ))}
        </div>
      </section>

      <section className="consult-card" aria-labelledby="consult-card-title">
        <div>
          <p className="eyebrow">Consultation</p>
          <h2 id="consult-card-title">Speak with a qualified Ayurvedic doctor.</h2>
          <p>
            Share your concern in a short form or on WhatsApp. Our team coordinates the rest —
            nothing is stored on this site.
          </p>
        </div>
        <div>
          <div className="doctor-row">
            <div className="doctor-photo">
              <Image src={doctor.image} alt={doctor.name} width={72} height={72} />
            </div>
            <div>
              <p>{doctor.name}</p>
              <small>
                {doctor.credentials} · {doctor.title}
              </small>
            </div>
          </div>
          <div className="consult-actions">
            <Link className="button primary" href="/#joint-comfort-check-in">
              Request a consultation
            </Link>
            <a className="button secondary" href={consultation.whatsapp}>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <ConsultationIntakeSection />

      <a className="floating-whatsapp" href={consultation.whatsapp}>
        <span>WhatsApp us — replies within a day</span>
        <span aria-hidden="true">→</span>
      </a>

      <JsonLdScript
        data={[
          webPageJsonLd({
            path: "/",
            name: "Ellie’s Botanics | Ayurvedic Herbal Wellness Guidance in India",
            description: metadata.description as string,
          }),
          breadcrumbJsonLd([{ name: "Home", path: "/" }]),
        ]}
      />
    </>
  );
}
