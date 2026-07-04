import Link from "next/link";
import Image from "next/image";
import { navItems, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label={`${site.name} home`}>
        <Image
          className="site-logo header-logo"
          src="/images/eb-logo.jpg"
          alt=""
          width={40}
          height={40}
          priority
          unoptimized
        />
        <span>Ellie&apos;s Botanics</span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
        ))}
      </nav>
      <Link className="header-contact" href="/#joint-comfort-check-in">
        Consult a doctor
      </Link>
      <details className="mobile-nav">
        <summary aria-label="Open menu">
          <span />
          <span />
        </summary>
        <nav aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
