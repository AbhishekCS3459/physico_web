import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  weight: ["400", "600", "700"],
})

export const metadata: Metadata = {
  title: "Physio Rehab at Home | Mobile Physiotherapy Calgary",
  description:
    "Professional mobile physiotherapy, occupational therapy, and massage services in Calgary. Direct billing available. Book your in-home rehab session today.",
  keywords:
    "mobile physiotherapy Calgary, home physiotherapy, occupational therapy, massage therapy, direct billing, seniors rehab",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sourceSans.variable} ${playfairDisplay.variable} font-sans text-base leading-relaxed antialiased`}
      >
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
