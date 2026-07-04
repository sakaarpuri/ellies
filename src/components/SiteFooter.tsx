import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Journal", href: "/education" },
  { label: "Editorial Standards", href: "/editorial-standards" },
  { label: "Medical Disclaimer", href: "/medical-disclaimer" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Link href="/" className="brand-mark">
          <Image
            className="site-logo footer-logo"
            src="/images/eb-logo.jpg"
            alt=""
            width={30}
            height={30}
            unoptimized
          />
          <span>Ellie&apos;s Botanics</span>
        </Link>
      </div>
      <div className="footer-links">
        {footerLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
      <div className="footer-bottom">
        <p>Education, not diagnosis. © 2026 Ellie&apos;s Botanics · {site.email}</p>
      </div>
    </footer>
  );
}
