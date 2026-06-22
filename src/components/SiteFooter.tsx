import Link from "next/link";
import Image from "next/image";
import { navItems, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Link href="/" className="brand-mark">
          <Image
            className="site-logo footer-logo"
            src="/images/eb-logo.jpg"
            alt=""
            width={156}
            height={156}
            unoptimized
          />
          <span className="sr-only">Ellie&apos;s Botanics</span>
        </Link>
        <p>
          Ayurveda-informed herbal education, responsible wellness guidance, and access to
          qualified consultation.
        </p>
      </div>
      <div className="footer-grid">
        <div>
          <p className="footer-title">Explore</p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          <p className="footer-title">Contact</p>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          {site.phones.map((phone) => (
            <a key={phone.href} href={phone.href}>
              {phone.label}
            </a>
          ))}
        </div>
        <div>
          <p className="footer-title">Care Notes</p>
          <Link href="/medical-disclaimer">Medical Disclaimer</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Copyright © 2026 Ellie&apos;s Botanics. All rights reserved.</p>
        <p>Traditional knowledge. Responsible use. Professional guidance.</p>
      </div>
    </footer>
  );
}
