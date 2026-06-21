import Link from "next/link";
import { site } from "@/lib/site";

export function ContactCTA() {
  return (
    <section className="contact-band" aria-labelledby="contact-cta-title">
      <div>
        <p className="eyebrow">Begin A Conversation</p>
        <h2 id="contact-cta-title">Questions, collaborations, or thoughtful notes are welcome.</h2>
      </div>
      <div className="contact-actions">
        <Link className="button primary" href="/consultation">
          Request consultation
        </Link>
        <a className="button secondary" href={`mailto:${site.email}`}>
          Email Ellie&apos;s Botanics
        </a>
        <Link className="button secondary" href="/contact">
          Contact details
        </Link>
      </div>
    </section>
  );
}
