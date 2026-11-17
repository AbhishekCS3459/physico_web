import { absoluteUrl, getSiteUrl } from "@/lib/seo"
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/login",
          "/register",
          "/register-staff",
          "/forgot-password",
          "/reset-password",
          "/user-login",
          "/my-bookings",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  }
}
