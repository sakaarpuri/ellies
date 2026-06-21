import type { Metadata } from "next";
import { ConsultationIntakeSection } from "@/components/ConsultationIntakeSection";
import { consultation, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Consultation",
  description:
    "Share a joint comfort concern with Ellie’s Botanics for professional Ayurvedic consultation follow-up.",
};

export default function ConsultationPage() {
  return (
    <>
      <section className="page-hero consultation-hero">
        <p className="eyebrow">Professional Guidance</p>
        <h1>Share a joint comfort concern for consultation follow-up.</h1>
        <p>
          Ellie&apos;s Botanics publishes educational herbal wellness content. For personal
          questions about joint comfort, movement, or routine support, you can share basic details
          so the team can follow up appropriately.
        </p>
      </section>

      <ConsultationIntakeSection />

      <aside className="disclaimer-callout">
        <p className="eyebrow">Responsible Care</p>
        <p>
          This form is for non-emergency consultation follow-up only. Ellie&apos;s Botanics does not
          diagnose, treat, or promise outcomes through website content. For urgent symptoms or
          severe discomfort, contact local emergency or in-person medical care.
        </p>
      </aside>

      <section className="contact-band" aria-labelledby="consultation-contact-title">
        <div>
          <p className="eyebrow">Prefer Direct Contact?</p>
          <h2 id="consultation-contact-title">You can also write to Ellie&apos;s Botanics directly.</h2>
        </div>
        <div className="contact-actions">
          <a className="button primary" href={`mailto:${site.email}`}>
            Email Ellie&apos;s Botanics
          </a>
          <a className="button secondary" href={consultation.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
