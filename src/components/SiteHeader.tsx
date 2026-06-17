import Link from "next/link";
import { navItems, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label={`${site.name} home`}>
        <span>Ellie&apos;s</span>
        <strong>Botanics</strong>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <a className="header-contact" href={`mailto:${site.email}`}>
        Write to us
      </a>
    </header>
  );
}
