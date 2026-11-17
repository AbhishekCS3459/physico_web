import { siteConfig } from "@/lib/seo"
import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#047857",
    lang: "en-CA",
    icons: [
      {
        src: "/MainLogo.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
