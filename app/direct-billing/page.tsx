import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PersistentCTA } from "@/components/persistent-cta"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Shield, FileText, Phone, AlertCircle } from "lucide-react"

export default function DirectBillingPage() {
  const insuranceProviders = [
    "Blue Cross",
    "Manulife",
    "Sun Life",
    "Canada Life",
    "Green Shield",
    "Desjardins",
    "Industrial Alliance",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-16">
        <div className="container px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Shield className="h-4 w-4 mr-1" />
              Insurance Accepted
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              <span className="text-primary">Direct Billing</span> Available
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              We make your rehabilitation process as smooth and stress-free as possible by offering direct billing to
              most major insurance providers.
            </p>
          </div>

          {/* How It Works */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl">How Direct Billing Works</CardTitle>
              <CardDescription>Simple, hassle-free process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">We Submit Claims</h3>
                  <p className="text-sm text-muted-foreground">
                    We submit the claim directly to your insurance provider on your behalf
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Full Coverage</h3>
                  <p className="text-sm text-muted-foreground">
                    If your plan covers the full amount, there's no out-of-pocket cost
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Pay Difference</h3>
                  <p className="text-sm text-muted-foreground">
                    If a portion is not covered, you'll only pay the difference
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Providers */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl">We Direct Bill To</CardTitle>
              <CardDescription>Major insurance providers accepted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {insuranceProviders.map((provider) => (
                  <div key={provider} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="font-medium">{provider}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="font-medium">And many more</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Important Note</p>
                  <p className="text-sm text-amber-700">
                    Coverage varies depending on your individual plan. We recommend checking with your provider to
                    confirm eligibility for direct billing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl">Benefits of Direct Billing</CardTitle>
              <CardDescription>Why choose direct billing with us</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">No Upfront Payments</h4>
                      <p className="text-sm text-muted-foreground">No need to pay and wait for reimbursement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Less Paperwork</h4>
                      <p className="text-sm text-muted-foreground">We handle all the insurance paperwork for you</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Faster Processing</h4>
                      <p className="text-sm text-muted-foreground">Direct submission speeds up the approval process</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Focus on Recovery</h4>
                      <p className="text-sm text-muted-foreground">Spend your energy on healing, not paperwork</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Questions About Your Coverage?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Our team is here to help verify your insurance coverage and set up direct billing. Contact us to
                  discuss your specific plan details.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg px-8">
                    <Phone className="h-5 w-5 mr-2" />
                    Call (587) 586-5566
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                    <FileText className="h-5 w-5 mr-2" />
                    Check My Coverage
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
