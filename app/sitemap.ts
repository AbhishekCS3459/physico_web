import { absoluteUrl, publicRoutes } from "@/lib/seo"
import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
