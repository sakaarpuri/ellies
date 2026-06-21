import { ConsultationIntakeForm } from "@/components/ConsultationIntakeForm";

const expectations = [
  "Share your concern, duration, and preferred contact details.",
  "Your message opens as an email to Ellie’s Botanics for review before sending.",
  "The team can follow up and help decide whether professional guidance is appropriate.",
];

export function ConsultationIntakeSection() {
  return (
    <section className="intake-section" aria-labelledby="intake-title">
      <div className="intake-intro">
        <p className="eyebrow">Joint Comfort Check-In</p>
        <h2 id="intake-title">Share what you are experiencing.</h2>
        <p>
          If joint stiffness, movement changes, or daily discomfort are on your mind, share a few
          details so Ellie&apos;s Botanics can follow up with care.
        </p>
        <ol>
          {expectations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>
      <div className="intake-card">
        <ConsultationIntakeForm />
      </div>
    </section>
  );
}
