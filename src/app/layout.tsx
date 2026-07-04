import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Marcellus } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLdScript } from "@/components/JsonLd";
import { organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  variable: "--font-marcellus",
  weight: "400",
  display: "swap",
});

const defaultMetadata = pageMetadata({
  title: "Ellie's Botanics | Herbal Wisdom for Modern Wellness",
  description: site.description,
  path: "/",
  imageAlt: "Ellie's Botanics botanical editorial wellness card",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Ellie's Botanics | Herbal Wisdom for Modern Wellness",
    template: "%s | Ellie's Botanics",
  },
  description: defaultMetadata.description,
  keywords: defaultMetadata.keywords,
  alternates: defaultMetadata.alternates,
  openGraph: defaultMetadata.openGraph,
  twitter: defaultMetadata.twitter,
  icons: {
    icon: site.logo,
    apple: site.logo,
  },
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "Ayurvedic herbal wellness education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${marcellus.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <JsonLdScript data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
