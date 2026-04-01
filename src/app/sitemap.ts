import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://agents-hub-fawn.vercel.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/audit`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tools`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tasks`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/reports`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/settings`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
