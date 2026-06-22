import type { Metadata } from "next";
import { consultation, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description: "Scope of educational content and professional consultation at Ellie's Botanics.",
};

export default function MedicalDisclaimerPage() {
  return (
    <section className="legal-page">
      <p className="eyebrow">Medical Disclaimer</p>
      <h1>Education supported by professional guidance.</h1>
      <p>
        Ellie&apos;s Botanics publishes Ayurveda-informed educational content on herbs, preparation
        methods, and wellness practices. Website content explains general principles; individual
        assessment, diagnosis, and recommendations require consultation with a qualified
        practitioner.
      </p>
      <h2>Personal recommendations</h2>
      <p>
        Consult a qualified practitioner before making changes, particularly during pregnancy or
        nursing, while taking medication, when managing a health condition, or before a procedure.
      </p>
      <h2>Qualified Ayurvedic consultation</h2>
      <p>
        Individual guidance is available from a doctor at{" "}
        <a href={consultation.phone.href}>{consultation.phone.label}</a> or{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <h2>Scope of website content</h2>
      <p>
        Articles and general website content do not assess individual health history, suitability,
        or risk. Those questions belong within a personal consultation.
      </p>
    </section>
  );
}
