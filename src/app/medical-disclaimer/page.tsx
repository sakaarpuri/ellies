import type { Metadata } from "next";
import { consultation } from "@/lib/site";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description: "Educational-use disclaimer for Ellie&apos;s Botanics.",
};

export default function MedicalDisclaimerPage() {
  return (
    <section className="legal-page">
      <p className="eyebrow">Medical Disclaimer</p>
      <h1>Educational information only.</h1>
      <p>
        Ellie&apos;s Botanics publishes general information about herbs, Ayurveda-inspired ideas,
        and everyday wellness routines. This content is not medical advice and should not replace
        guidance from a qualified professional.
      </p>
      <h2>Speak with a professional</h2>
      <p>
        Before changing your routine, consult a qualified practitioner, especially if you are
        pregnant, nursing, taking medication, managing a health condition, or preparing for a
        procedure.
      </p>
      <h2>Consultation resource</h2>
      <p>
        For Ayurvedic consultation, readers may contact{" "}
        <a href={consultation.url} target="_blank" rel="noreferrer">
          {consultation.name}
        </a>
        , led by {consultation.doctor}, at{" "}
        <a href={consultation.phone.href}>{consultation.phone.label}</a> or{" "}
        <a href={`mailto:${consultation.email}`}>{consultation.email}</a>.
      </p>
      <h2>No personal diagnosis</h2>
      <p>
        Website content cannot evaluate your individual needs, history, or risks. Use it as a
        starting point for better questions, not as a final answer.
      </p>
    </section>
  );
}
