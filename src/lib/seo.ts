import type { Metadata } from "next";
import { site } from "@/lib/site";

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export type JsonLd = { [key: string]: JsonLdValue };

type PageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  image?: string;
  imageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
};

export function absoluteUrl(path = "") {
  if (path.startsWith("http")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${site.url}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function pageMetadata({
  title,
  description,
  path = "/",
  type = "website",
  image = "/opengraph-image",
  imageAlt = "Ellie's Botanics botanical wellness guide",
  publishedTime,
  modifiedTime,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords: site.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: site.locale,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: absoluteUrl(site.logo),
    image: absoluteUrl(site.logo),
    email: site.email,
    telephone: site.phones.map((phone) => phone.label),
    areaServed: site.areaServed.map((area) => ({
      "@type": "AdministrativeArea",
      name: area,
    })),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: site.email,
        telephone: "+919815007269",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi", "Punjabi"],
      },
      {
        "@type": "ContactPoint",
        contactType: "Ayurvedic consultation enquiries",
        email: site.email,
        telephone: "+917717607269",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi", "Punjabi"],
      },
    ],
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    publisher: {
      "@id": `${site.url}/#organization`,
    },
    inLanguage: "en-IN",
  };
}

export function webPageJsonLd({
  path,
  name,
  description,
}: {
  path: string;
  name: string;
  description: string;
}): JsonLd {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: {
      "@id": `${site.url}/#website`,
    },
    about: {
      "@id": `${site.url}/#organization`,
    },
    inLanguage: "en-IN",
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
