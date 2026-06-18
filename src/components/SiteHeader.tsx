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
          width={132}
          height={132}
          priority
          unoptimized
        />
        <span className="sr-only">Ellie&apos;s Botanics</span>
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
