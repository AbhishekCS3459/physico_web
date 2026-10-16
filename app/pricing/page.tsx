import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PersistentCTA } from "@/components/persistent-cta"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPricing } from "@/lib/pricing"
import { formatPrice, hasVisiblePrices, type ServicePricing } from "@/lib/pricing-config"
import { cn } from "@/lib/utils"
import { Clock, DollarSign, FileText, MapPin } from "lucide-react"

export const revalidate = 300

const SERVICE_TAGLINES: Record<ServicePricing["id"], string> = {
  physiotherapy: "Expert rehabilitation therapy",
  "occupational-therapy": "Daily living & independence",
  "massage-therapy": "Therapeutic massage by RMT",
}

export default async function PricingPage() {
  const pricing = await getPricing()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-16">
        <div className="container px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <DollarSign className="h-4 w-4 mr-1" />
              Transparent Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Competitive Rates for <span className="text-primary">Quality Care</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Transparent, competitive rates for personalized care delivered right to your door. Direct billing
              available to most major insurance providers.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pricing.services.map((service) => {
              const comingSoon = service.status === "coming-soon"
              return (
                <Card
                  key={service.id}
                  className={cn(
                    "relative border-2 transition-all duration-300 group",
                    comingSoon
                      ? "border-dashed border-muted-foreground/40 hover:border-primary/20"
                      : "hover:border-primary/20 hover:shadow-xl hover:scale-[1.02]"
                  )}
                >
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {service.name}
                    </CardTitle>
                    {comingSoon ? (
                      <CardDescription className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Coming Soon
                        </span>
                      </CardDescription>
                    ) : (
                      <CardDescription>{SERVICE_TAGLINES[service.id]}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hasVisiblePrices(service) ? (
                      <div className="space-y-3">
                        {service.sessions.map((session) => (
                          <div key={session.id} className="flex justify-between items-center gap-3">
                            <span>
                              {session.label} ({session.durationMinutes} mins)
                            </span>
                            <span className="font-semibold">{formatPrice(session.price)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {comingSoon
                          ? `${SERVICE_TAGLINES[service.id]} — booking available soon.`
                          : "Contact us for pricing and availability."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Additional Services */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl">Additional Services</CardTitle>
              <CardDescription>Extra services and fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {pricing.additionalFees.map((fee) => (
                    <div key={fee.id} className="flex justify-between items-center gap-3">
                      <span>{fee.label}</span>
                      <span className="font-semibold">{fee.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    No travel fee within Calgary area. A travel fee applies for services outside the Calgary area.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Book your initial assessment today. We'll create a personalized treatment plan and handle direct
                  billing with your insurance provider.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg px-8">
                    <Clock className="h-5 w-5 mr-2" />
                    Book Assessment
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                    <FileText className="h-5 w-5 mr-2" />
                    Check Insurance Coverage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      <PersistentCTA />
    </div>
  )
}
