import type { Metadata } from "next"

/** Public marketing site identity used for titles, OG tags, sitemap and JSON-LD. */
export const siteConfig = {
  name: "Physio Rehab at Home",
  shortName: "Physio Rehab",
  tagline: "Expert Care That Comes to You",
  description:
    "Mobile physiotherapy, occupational therapy, and massage therapy at home in Calgary, Airdrie, Cochrane, Crossfield, and Chestermere. Licensed clinicians, direct billing, and flexible scheduling.",
  phoneDisplay: "(587) 586-5566",
  phoneE164: "+15875865566",
  email: "info@physiorehabhome.ca",
  locale: "en_CA",
  language: "en-CA",
  // Calgary approximate geo for local business markup (mobile clinic / service area business).
  geo: { latitude: 51.0447, longitude: -114.0719 },
  areaServed: ["Calgary", "Airdrie", "Cochrane", "Crossfield", "Chestermere"] as const,
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const,
    opens: "08:00",
    closes: "19:00",
  },
  social: [] as string[],
  ogImagePath: "/professional-physiotherapy-home-visit.jpg",
} as const

const PRODUCTION_FALLBACK = "https://physiorehabhome.ca"

/** Absolute site origin. Prefers NEXT_PUBLIC_APP_URL; ignores localhost for public SEO URLs. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "")
  if (raw && !/localhost|127\.0\.0\.1/i.test(raw)) return raw
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`
  }
  return PRODUCTION_FALLBACK
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl()
  if (!path || path === "/") return base
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

type PageSeoInput = {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
}

/** Builds Next.js Metadata for a public (or noindex) page with OG/Twitter/canonical. */
export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = siteConfig.ogImagePath,
  noIndex = false,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  const isHome = path === "/"
  const fullTitle = isHome ? title : `${title} | ${siteConfig.name}`

  return {
    // Home uses an absolute title; other pages use the root title template.
    title: isHome ? { absolute: title } : title,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  }
}

export const defaultKeywords = [
  "mobile physiotherapy Calgary",
  "home physiotherapy Calgary",
  "in-home physio Calgary",
  "physiotherapy at home Calgary",
  "occupational therapy Calgary home visit",
  "massage therapy at home Calgary",
  "seniors physiotherapy Calgary",
  "post surgical rehab Calgary",
  "direct billing physiotherapy Calgary",
  "Airdrie physiotherapy home visit",
  "Cochrane mobile physiotherapy",
]

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Physiotherapy",
    "@id": `${getSiteUrl()}/#business`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    description: siteConfig.description,
    url: getSiteUrl(),
    telephone: siteConfig.phoneE164,
    email: siteConfig.email,
    image: absoluteUrl(siteConfig.ogImagePath),
    logo: absoluteUrl("/MainLogo.png"),
    priceRange: "$$",
    currenciesAccepted: "CAD",
    paymentAccepted: "Cash, Credit Card, Direct Billing",
    areaServed: siteConfig.areaServed.map((name) => ({
      "@type": "City",
      name,
      addressCountry: "CA",
      addressRegion: "AB",
    })),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Calgary",
      addressRegion: "AB",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    openingHoursSpecification: siteConfig.openingHours.days.map((day) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: day,
      opens: siteConfig.openingHours.opens,
      closes: siteConfig.openingHours.closes,
    })),
    sameAs: siteConfig.social,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "In-home rehabilitation services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mobile Physiotherapy" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Occupational Therapy" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Massage Therapy" } },
      ],
    },
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": `${getSiteUrl()}/#business` },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export const publicRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/pricing", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/book", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/team", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/direct-billing", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
] as const
