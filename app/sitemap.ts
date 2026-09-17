import type { MetadataRoute } from "next";
import { SITE } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE.url, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/rooms`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/about`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/dining`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/gallery`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/accessibility`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
