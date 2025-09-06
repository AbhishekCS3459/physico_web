import { EnhancedFooter } from "@/components/enhanced-footer"
import { MainNavigation } from "@/components/main-navigation"
import { PersistentCTA } from "@/components/persistent-cta"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Mail, MapPin, Phone, Send } from "lucide-react"

export default function ContactPage() {
  const serviceAreas = ["Calgary", "Airdrie", "Okotoks", "Cochrane", "Crossfield"]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <MainNavigation />
      <main className="py-16">
        <div className="container px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Phone className="h-4 w-4 mr-1" />
              Get In Touch
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Contact <span className="text-primary">Physio Rehab at Home</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Ready to start your journey to better health? We're here to answer your questions and schedule your first
              appointment.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Contact Information</CardTitle>
                  <CardDescription>Get in touch with us directly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Address</h4>
                      <p className="text-muted-foreground">
                        370 Evanston Drive
                        <br />
                        Calgary, Alberta, Canada
                        <br />
                        T3P 0E2
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Phone</h4>
                      <p className="text-muted-foreground">
                        <a href="tel:587-586-5566" className="hover:text-primary transition-colors">
                          (587) 586-5566
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email</h4>
                      <p className="text-muted-foreground">
                        <a href="mailto:info@physiorehab.com" className="hover:text-primary transition-colors">
                          info@physiorehab.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Hours</h4>
                      <p className="text-muted-foreground">
                        Open 7 Days a Week
                        <br />
                        Monday to Sunday: 8:00 AM – 7:00 PM
                        <br />
                        <span className="text-sm">Evening appointments available upon request</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Service Areas</CardTitle>
                  <CardDescription>We serve Calgary and surrounding communities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviceAreas.map((area) => (
                      <div key={area} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{area}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Travel fees may apply for locations outside our standard service area. Contact us to confirm
                    coverage in your area.
                  </p>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Quick Actions</CardTitle>
                  <CardDescription>Get started right away</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button size="lg" className="w-full text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Online Appointment
                  </Button>
                  <Button variant="outline" size="lg" className="w-full text-lg bg-transparent">
                    <Phone className="h-5 w-5 mr-2" />
                    Call (587) 586-5566
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <CardDescription>We'll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-first-name" className="text-base font-medium">
                        First Name
                      </Label>
                      <Input id="contact-first-name" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="contact-last-name" className="text-base font-medium">
                        Last Name
                      </Label>
                      <Input id="contact-last-name" className="mt-2" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-phone" className="text-base font-medium">
                        Phone Number
                      </Label>
                      <Input id="contact-phone" type="tel" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="contact-email" className="text-base font-medium">
                        Email Address
                      </Label>
                      <Input id="contact-email" type="email" className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact-service" className="text-base font-medium">
                      Service Interested In
                    </Label>
                    <Input
                      id="contact-service"
                      placeholder="e.g., Physiotherapy, Occupational Therapy"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-message" className="text-base font-medium">
                      Message
                    </Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Tell us about your needs, questions, or how we can help you..."
                      className="mt-2"
                      rows={5}
                    />
                  </div>

                  <Button size="lg" className="w-full text-lg">
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Notice */}
          <Card className="mt-12 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Emergency Situations</h4>
                  <p className="text-sm text-amber-700">
                    If you're experiencing a medical emergency, please call 911 immediately. Our services are for
                    non-emergency rehabilitation and therapy needs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <EnhancedFooter />
      <PersistentCTA />
    </div>
  )
}
