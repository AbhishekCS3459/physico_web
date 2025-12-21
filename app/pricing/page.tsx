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
                    <span className="font-semibold">$140</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Follow-Up Session (45 mins)</span>
                    <span className="font-semibold">$130</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Extended Session (60 mins)</span>
                    <span className="font-semibold">$140</span>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Check className="h-4 w-4 text-primary" />
                    Acupuncture/Dry Needling Included
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
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Initial Assessment (60 mins)</span>
                    <span className="font-semibold">$130</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Follow-Up Session (45 mins)</span>
                    <span className="font-semibold">$100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Home Safety Assessment</span>
                    <span className="font-semibold">$150</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Massage Therapy */}
            <Card className="relative border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Massage Therapy</CardTitle>
                <CardDescription>Registered Massage Therapist</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>45 minutes</span>
                    <span className="font-semibold">$85</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>60 minutes</span>
                    <span className="font-semibold">$105</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>90 minutes</span>
                    <span className="font-semibold">$140</span>
                  </div>
                </div>
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
                    <Check className="h-4 w-4 text-primary" />
                    Acupuncture/Dry Needling included in physio sessions
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    No travel fee within Calgary, Airdrie, Okotoks, Cochrane, Crossfield
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
