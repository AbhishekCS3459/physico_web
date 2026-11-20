import { JsonLd } from "@/components/json-ld"
import { ThemeProvider } from "@/components/theme-provider"
import {
  defaultKeywords,
  getSiteUrl,
  localBusinessJsonLd,
  siteConfig,
  websiteJsonLd,
} from "@/lib/seo"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import type React from "react"
import { Suspense } from "react"
import { Toaster } from "react-hot-toast"
import "./globals.css"

// Self-hosted so Vercel builds never call Google Fonts (next/font/google can crash on
// extensionless /l/font?kit= URLs: Cannot read properties of null (reading '1')).
const playfairDisplay = localFont({
  src: [
    { path: "./fonts/playfair-display-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/playfair-display-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-playfair",
  display: "swap",
})

const sourceSans = localFont({
  src: [
    { path: "./fonts/source-sans-3-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/source-sans-3-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/source-sans-3-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-source-sans",
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ecfdf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `Physio Rehab at Home | Mobile Physiotherapy Calgary`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: defaultKeywords,
  authors: [{ name: siteConfig.name, url: getSiteUrl() }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "health",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: getSiteUrl(),
    siteName: siteConfig.name,
    title: `Physio Rehab at Home | Mobile Physiotherapy Calgary`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `Physio Rehab at Home | Mobile Physiotherapy Calgary`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  // Keep this tag permanently so Search Console stays verified.
  verification: {
    google: "kigAOEkumdvHjlt5k04LxGxHQdXJh6jVR7QPgTFFARE",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-CA" suppressHydrationWarning>
      <body
        className={`${sourceSans.variable} ${playfairDisplay.variable} font-sans text-lg leading-relaxed antialiased`}
      >
        <JsonLd data={localBusinessJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            storageKey="physio-theme"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster 
              position="top-right"
              reverseOrder={false}
              gutter={12}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                className: '',
                duration: 4000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  padding: '16px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
                  fontSize: '14px',
                  fontWeight: '500',
                  maxWidth: '420px',
                  backdropFilter: 'blur(8px)',
                },
                success: {
                  duration: 4000,
                  style: {
                    background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 10px 40px rgba(5, 150, 105, 0.2), 0 2px 8px rgba(5, 150, 105, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#059669',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.95) 0%, rgba(239, 68, 68, 0.95) 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 10px 40px rgba(230, 57, 70, 0.2), 0 2px 8px rgba(230, 57, 70, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#e63946',
                  },
                },
                loading: {
                  style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--primary)',
                    boxShadow: '0 10px 40px rgba(5, 150, 105, 0.1), 0 2px 8px rgba(5, 150, 105, 0.05)',
                  },
                  iconTheme: {
                    primary: 'var(--primary)',
                    secondary: 'var(--primary-foreground)',
                  },
                },
              }}
            />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
