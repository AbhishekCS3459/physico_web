import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PersistentCTA } from "@/components/persistent-cta"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, DollarSign, FileText, MapPin } from "lucide-react"

export default function PricingPage() {
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
            {/* Physiotherapy */}
            <Card className="relative border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Physiotherapy</CardTitle>
                <CardDescription>Expert rehabilitation therapy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Initial Assessment (60 mins)</span>
                    <span className="font-semibold">$150</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Follow-Up Session (45 mins)</span>
                    <span className="font-semibold">$150</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Occupational Therapy */}
            <Card className="relative border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Occupational Therapy</CardTitle>
                <CardDescription>Daily living & independence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">Contact us for pricing and availability.</p>
              </CardContent>
            </Card>

            {/* Massage Therapy */}
            <Card className="relative border-2 border-dashed border-muted-foreground/40 hover:border-primary/20 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Massage Therapy</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Coming Soon</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Therapeutic massage by RMT — booking available soon.</p>
              </CardContent>
            </Card>
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
                  <div className="flex justify-between items-center">
                    <span>Travel Fee (outside service area)</span>
                    <span className="font-semibold">$15–$25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Documentation/Forms/Reports</span>
                    <span className="font-semibold">From $40</span>
                  </div>
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
