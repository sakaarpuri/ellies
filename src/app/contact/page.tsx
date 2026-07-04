import type { Metadata } from "next";
import Link from "next/link";
import { ContactCTA } from "@/components/ContactCTA";
import { JsonLdScript } from "@/components/JsonLd";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

const description =
  "Contact Ellie’s Botanics in India for Ayurvedic herbal wellness enquiries, consultation follow-up, email, phone, and WhatsApp details.";

export const metadata: Metadata = pageMetadata({
  title: "Contact & Ayurvedic Consultation Enquiries",
  description,
  path: "/contact",
});

const contactFaqs = [
  {
    question: "How can I contact Ellie’s Botanics?",
    answer:
      "Email elliesbotanics@gmail.com or call 9815007269 or 7717607269 for official Ellie’s Botanics enquiries.",
  },
  {
    question: "Can I request Ayurvedic guidance online?",
    answer:
      "Yes. Use the consultation form on the homepage to share your concern and preferred contact details for follow-up.",
  },
  {
    question: "Where does Ellie’s Botanics serve enquiries?",
    answer:
      "Ellie’s Botanics is India-focused, with local relevance for Punjab and consultation enquiries handled through direct follow-up.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="page-hero contact-hero">
        <p className="eyebrow">Contact</p>
        <h1>Reach Ellie&apos;s Botanics directly.</h1>
        <p>
          For consultation requests, editorial questions, professional collaborations, or general
          enquiries, contact the team using the official details below.
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
        <h2>Personal wellness guidance</h2>
        <p>
          Concerns requiring individual assessment can be discussed through a consultation with a
          doctor. Use the consultation form to share the relevant details and preferred method of
          follow-up.
        </p>
        <Link className="button secondary" href="/#joint-comfort-check-in">
          Share a consultation concern
        </Link>
      </section>

      <section className="faq-section compact" aria-labelledby="contact-faq-title">
        <div>
          <p className="eyebrow">Contact FAQ</p>
          <h2 id="contact-faq-title">How enquiries are handled.</h2>
        </div>
        <div className="faq-list">
          {contactFaqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <ContactCTA />
      <JsonLdScript
        data={[
          webPageJsonLd({
            path: "/contact",
            name: "Contact Ellie’s Botanics",
            description,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          faqJsonLd(contactFaqs),
        ]}
      />
    </>
  );
}
