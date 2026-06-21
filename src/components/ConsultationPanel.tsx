import { consultation } from "@/lib/site";
import Link from "next/link";

export function ConsultationPanel() {
  return (
    <section className="consultation-panel" aria-labelledby="consultation-title">
      <div>
        <p className="eyebrow">Qualified Consultation</p>
        <h2 id="consultation-title">For personal guidance, speak with an Ayurvedic doctor.</h2>
      </div>
      <div className="consultation-details">
        <p>
          Ellie&apos;s Botanics shares general education only. For individual health questions,
          readers may contact {consultation.doctor} for a professional Ayurvedic consultation.
        </p>
        <div className="consultation-links" aria-label="Consultation contact links">
          <Link href="/consultation">Request consultation</Link>
          <a href={consultation.url} target="_blank" rel="noreferrer">
            Visit consultation website
          </a>
          <a href={consultation.phone.href}>{consultation.phone.label}</a>
          <a href={`mailto:${consultation.email}`}>{consultation.email}</a>
          <a href={consultation.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp consultation
          </a>
        </div>
      </div>
    </section>
  );
}
