import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/wisdom";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const visualRefreshDate = "2026-07-10";
  const staticRoutes = [
    { path: "", priority: 1, lastModified: visualRefreshDate },
    { path: "/about", priority: 0.8, lastModified: visualRefreshDate },
    { path: "/education", priority: 0.9, lastModified: visualRefreshDate },
    { path: "/editorial-standards", priority: 0.7, lastModified: "2026-07-04" },
    { path: "/contact", priority: 0.8, lastModified: "2026-07-04" },
    { path: "/privacy", priority: 0.4, lastModified: "2026-07-04" },
    { path: "/terms", priority: 0.4, lastModified: "2026-07-04" },
    { path: "/medical-disclaimer", priority: 0.5, lastModified: "2026-07-04" },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: new Date(route.lastModified),
      changeFrequency: "monthly" as const,
      priority: route.priority,
    })),
    ...getAllPosts().map((post) => ({
      url: `${site.url}/education/${post.slug}`,
      lastModified: new Date(post.lastUpdated),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
