import type { Metadata } from "next";
import { ContactCTA } from "@/components/ContactCTA";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ellie's Botanics by email or mobile.",
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero contact-hero">
        <p className="eyebrow">Contact</p>
        <h1>Reach Ellie&apos;s Botanics directly.</h1>
        <p>
          For thoughtful questions, collaboration notes, or general enquiries, email or call the
          team using the official details below.
        </p>
      </section>

      <section className="contact-page-grid">
        <article>
          <p className="eyebrow">Email</p>
          <h2>Write to us</h2>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </article>
        <article>
          <p className="eyebrow">Mobile</p>
          <h2>Call directly</h2>
          {site.phones.map((phone) => (
            <a key={phone.href} href={phone.href}>
              {phone.label}
            </a>
          ))}
        </article>
        <article>
          <p className="eyebrow">Website</p>
          <h2>Official domain</h2>
          <a href={site.url}>{site.domain}</a>
        </article>
      </section>

      <section className="note-panel">
        <h2>A note on wellness questions</h2>
        <p>
          Ellie&apos;s Botanics can answer general and education-related questions. Personal health
          decisions should be discussed with a qualified professional who understands your full
          context.
        </p>
      </section>

      <ContactCTA />
    </>
  );
}
