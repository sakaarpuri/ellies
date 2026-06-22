import { ConsultationIntakeForm } from "@/components/ConsultationIntakeForm";

const expectations = [
  "Share your concern, duration, and preferred contact details.",
  "Your message opens as an email to Ellie’s Botanics for review before sending.",
  "The team can follow up and help decide whether professional guidance is appropriate.",
];

export function ConsultationIntakeSection() {
  return (
    <section
      id="joint-comfort-check-in"
      className="intake-section"
      aria-labelledby="intake-title"
    >
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
      <details className="intake-disclosure">
        <summary>
          <span>
            <strong>Share your concern</strong>
            <small>Open the private check-in form</small>
          </span>
          <span className="disclosure-icon" aria-hidden="true" />
        </summary>
        <div className="intake-card">
          <ConsultationIntakeForm />
        </div>
      </details>
    </section>
  );
}
