import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import type React from "react"
import { Suspense } from "react"
import { Toaster } from "react-hot-toast"
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
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
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
