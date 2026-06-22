import { consultation, site } from "@/lib/site";
import Link from "next/link";

export function ConsultationPanel() {
  return (
    <section className="consultation-panel" aria-labelledby="consultation-title">
      <div>
        <p className="eyebrow">Qualified Consultation</p>
        <h2 id="consultation-title">For personal guidance, speak with an Ayurvedic doctor.</h2>
      </div>
      <div className="consultation-details">
        <div className="consultation-links" aria-label="Consultation contact links">
          <Link href="/#joint-comfort-check-in">Share your concern</Link>
          <a href={consultation.phone.href}>{consultation.phone.label}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={consultation.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp consultation
          </a>
        </div>
      </div>
    </section>
  );
}
