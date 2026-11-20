import { MainNavigation } from "@/components/main-navigation"
import ResponsiveHero from "@/components/responsive-hero"
import { ProofStrip } from "@/components/proof-strip"
import { ValueProposition } from "@/components/value-proposition"
import { ResponsiveServices } from "@/components/responsive-services"
import { HowItWorks } from "@/components/how-it-works"
import ResponsiveCarouselTestimonials from "@/components/responsive-carousel-testimonials"
import { InteractivePricingContact } from "@/components/interactive-pricing-contact"
import { AreasWeServe } from "@/components/areas-we-serve"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { PersistentCTA } from "@/components/persistent-cta"
import { getPricing } from "@/lib/pricing"
import { createPageMetadata, defaultKeywords, siteConfig } from "@/lib/seo"

export const revalidate = 300

export const metadata = createPageMetadata({
  title: `Physio Rehab at Home | Mobile Physiotherapy Calgary`,
  description: siteConfig.description,
  path: "/",
  keywords: defaultKeywords,
})

export default async function HomePage() {
  const pricing = await getPricing()

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="pb-28 lg:pb-0">
        <ResponsiveHero />
        <ProofStrip />
        {/* Crawlable summary for Google (complements client-rendered sections). */}
        <section className="border-y bg-muted/30 py-10 md:py-12" aria-labelledby="seo-about-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="seo-about-heading" className="text-2xl font-bold tracking-tight md:text-3xl">
              Mobile physiotherapy and rehab at home in Calgary
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {siteConfig.name} provides in-home physiotherapy, occupational therapy, and massage therapy across{" "}
              {siteConfig.areaServed.join(", ")}. Licensed clinicians bring assessment and treatment to your home so
              you can recover without clinic travel. Direct billing is available with major Alberta insurers, and visits
              can be booked online seven days a week.
            </p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Post-surgery and injury rehabilitation in your living space</li>
              <li>Seniors-friendly home visits with one-on-one care</li>
              <li>Same-week appointments when availability allows — call {siteConfig.phoneDisplay}</li>
            </ul>
          </div>
        </section>
        <ValueProposition />
        <ResponsiveServices pricing={pricing} />
        <HowItWorks />
        <ResponsiveCarouselTestimonials />
        <InteractivePricingContact pricing={pricing} />
        <AreasWeServe />
      </main>
      <EnhancedFooter />
      <PersistentCTA />
    </div>
  )
}
