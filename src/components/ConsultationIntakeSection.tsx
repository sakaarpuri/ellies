import { ConsultationIntakeForm } from "@/components/ConsultationIntakeForm";

const expectations = [
  "Complete the short form with your contact details and joint-related concern.",
  "Review and send the prepared email to Ellie’s Botanics.",
  "Our team will contact you to arrange an Ayurvedic consultation.",
];

export function ConsultationIntakeSection() {
  return (
    <section
      id="joint-comfort-check-in"
      className="intake-section"
      aria-labelledby="intake-title"
    >
      <div className="intake-intro">
        <p className="eyebrow">Ayurvedic Consultation</p>
        <h2 id="intake-title">Request guidance for a joint health concern.</h2>
        <p>
          Tell us where you feel discomfort, how long it has been present, and how it affects daily
          movement. Our team will review your message and coordinate a consultation with Dr. Sheetal
          Garg.
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
            <strong>Request a consultation</strong>
            <small>Open the consultation form</small>
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
