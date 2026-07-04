import { ConsultationIntakeForm } from "@/components/ConsultationIntakeForm";

const expectations = [
  "Fill the short form below — two minutes",
  "Send it by email or WhatsApp — you review it first",
  "We call you back to arrange the consultation",
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
        <h2 id="intake-title">Speak with a qualified Ayurvedic doctor.</h2>
        <p>
          Starting with joint and movement concerns. Tell us a little, and our team arranges the
          rest.
        </p>
        <div className="doctor-row dark">
          <div className="doctor-photo" aria-hidden="true">
            photo
          </div>
          <div>
            <p>Ayurvedic doctor</p>
            <small>BAMS · credentials to come</small>
          </div>
        </div>
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
