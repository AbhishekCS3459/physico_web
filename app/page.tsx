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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="pb-28 lg:pb-0">
        <ResponsiveHero />
        <ProofStrip />
        <ValueProposition />
        <ResponsiveServices />
        <HowItWorks />
        <ResponsiveCarouselTestimonials />
        <InteractivePricingContact />
        <AreasWeServe />
      </main>
      <EnhancedFooter />
      <PersistentCTA />
    </div>
  )
}
