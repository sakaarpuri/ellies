import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/wisdom";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/education",
    "/contact",
    "/privacy",
    "/terms",
    "/medical-disclaimer",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: new Date("2026-06-17"),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...getAllPosts().map((post) => ({
      url: `${site.url}/education/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
