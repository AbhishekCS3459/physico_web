import { absoluteUrl } from "@/lib/seo"
import type { MetadataRoute } from "next"

/** Private app areas — must not block /, /services, /book, etc. */
const privatePaths = [
  "/admin/",
  "/api/",
  "/login",
  "/register",
  "/register-staff",
  "/forgot-password",
  "/reset-password/",
  "/user-login",
  "/my-bookings",
]

/**
 * Public marketing pages are fully crawlable.
 * Google's "No information is available for this page" is usually robots.txt —
 * we explicitly Allow Googlebot on the whole site except private paths.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: privatePaths,
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: privatePaths,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
