"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  Brain,
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  PackageIcon as MassageIcon,
  Phone,
  Shield,
  Users
} from "lucide-react"
import { CoverageChecker } from "@/components/coverage-checker"
import { formatPrice, hasVisiblePrices, type PricingConfig, type ServiceId } from "@/lib/pricing-config"
import { motion } from "motion/react"
import { useState } from "react"

const SERVICE_UI: Record<ServiceId, { icon: typeof Activity; color: string }> = {
  physiotherapy: { icon: Activity, color: "from-emerald-500 to-teal-600" },
  "occupational-therapy": { icon: Brain, color: "from-blue-500 to-indigo-600" },
  "massage-therapy": { icon: MassageIcon, color: "from-purple-500 to-pink-600" },
}

const serviceAreas = ["Calgary", "Airdrie", "Cochrane", "Crossfield"]

export function InteractivePricingContact({ pricing }: { pricing: PricingConfig }) {
  const [selectedService, setSelectedService] = useState<ServiceId>("physiotherapy")
  const [selectedSession, setSelectedSession] = useState(0)
  const [sessionCount, setSessionCount] = useState(1)
  const current = pricing.services.find((s) => s.id === selectedService) ?? pricing.services[0]
  const currentSession = current.sessions[selectedSession] ?? current.sessions[0]
  const calculateTotal = () => formatPrice((currentSession?.price ?? 0) * sessionCount)

  return (
    <section className="py-16 md:py-24 lg:py-28 bg-gradient-to-br from-background via-muted/10 to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Pricing Section */}
        <motion.div
          className="mb-14 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12 sm:mb-14 lg:mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary/80 text-white border-primary">
              <DollarSign className="h-4 w-4 mr-1" />
              Transparent Pricing
            </Badge>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Fair & Transparent
              </span>
              <br />
              <span className="text-foreground">Pricing Structure</span>
            </h2>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              No hidden fees, no surprises. Direct billing available to most major insurance providers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Interactive Pricing Calculator */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-5 sm:p-8 bg-gradient-to-br from-card via-background to-primary/5 border-2 border-primary/10 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl sm:text-2xl">Pricing Calculator</CardTitle>
                  <CardDescription>Calculate your session costs instantly</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Service Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Select Service</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {pricing.services.map((service) => {
                        const ui = SERVICE_UI[service.id]
                        return (
                          <Button
                            key={service.id}
                            variant={selectedService === service.id ? "default" : "outline"}
                            className={`p-3.5 h-auto min-h-[92px] flex-col gap-2 ${
                              selectedService === service.id
                                ? `bg-gradient-to-r ${ui.color} text-white border-0`
                                : "bg-transparent"
                            }`}
                            onClick={() => {
                              setSelectedService(service.id)
                              setSelectedSession(0)
                            }}
                          >
                            <ui.icon className="h-5 w-5" />
                            <span className="text-xs text-center leading-tight">{service.name}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {(() => {
                    const comingSoon = current.status === "coming-soon"
                    if (!hasVisiblePrices(current)) {
                      return (
                        <>
                          <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                            <p className="text-muted-foreground">
                              {comingSoon
                                ? `${current.name} booking will be available soon.`
                                : "Contact us for pricing and availability."}
                            </p>
                            <Button variant="outline" className="mt-4" asChild>
                              <Link href="/contact">Contact Us</Link>
                            </Button>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            {comingSoon ? (
                              <Button className="flex-1" variant="secondary" disabled>
                                <Calendar className="h-4 w-4 mr-2" />Coming Soon
                              </Button>
                            ) : (
                              <Button className="flex-1 bg-gradient-to-r from-primary to-accent" asChild>
                                <Link href="/book"><Calendar className="h-4 w-4 mr-2" />Book Now</Link>
                              </Button>
                            )}
                            <Button variant="outline" className="bg-transparent" asChild>
                              <Link href="/contact"><Shield className="h-4 w-4 mr-2" />Contact for Info</Link>
                            </Button>
                          </div>
                        </>
                      )
                    }
                    return (
                      <>
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Session Type</Label>
                          <Select
                            value={selectedSession.toString()}
                            onValueChange={(value) => setSelectedSession(Number.parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {current.sessions.map((session, index) => (
                                <SelectItem key={session.id} value={index.toString()}>
                                  {session.label} - {session.durationMinutes} mins - {formatPrice(session.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Number of Sessions</Label>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Button variant="outline" size="icon" onClick={() => setSessionCount(Math.max(1, sessionCount - 1))} disabled={sessionCount <= 1}>-</Button>
                            <Input type="number" value={sessionCount} onChange={(e) => setSessionCount(Math.max(1, Number.parseInt(e.target.value) || 1))} className="text-center w-16 sm:w-20" min="1" />
                            <Button variant="outline" size="icon" onClick={() => setSessionCount(sessionCount + 1)} disabled={sessionCount >= 20}>+</Button>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/10">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold">Estimated Total:</span>
                            <span className="text-3xl font-bold text-primary">{calculateTotal()}</span>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Per Session:</span>
                              <span>{formatPrice(currentSession?.price ?? 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sessions:</span>
                              <span>{sessionCount}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button className="flex-1 bg-gradient-to-r from-primary to-accent" asChild>
                            <Link href="/book"><Calendar className="h-4 w-4 mr-2" />Book Now</Link>
                          </Button>
                          <Button variant="outline" className="bg-transparent">
                            <Shield className="h-4 w-4 mr-2" />Check Insurance
                          </Button>
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </motion.div>

            {/* Service Areas & Coverage Checker */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Coverage Checker */}
              <Card className="p-5 sm:p-6 border-2 border-primary/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Service Area Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Enter Your Postal Code</Label>
                    <CoverageChecker />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {serviceAreas.map((area) => (
                      <div key={area} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {area}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Services */}
              <Card className="p-5 sm:p-6 border-2 border-accent/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    Additional Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pricing.additionalFees.map((fee) => (
                    <div key={fee.id} className="flex justify-between items-center gap-3 text-sm">
                      <span>{fee.label}</span>
                      <span className="font-semibold text-accent">{fee.amount}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center border-2 border-primary/10">
                  <div className="text-2xl font-bold text-primary mb-1">7</div>
                  <div className="text-sm text-muted-foreground">Days a Week</div>
                </Card>
                <Card className="p-4 text-center border-2 border-accent/10">
                  <div className="text-2xl font-bold text-accent mb-1">100+</div>
                  <div className="text-sm text-muted-foreground">Insurance Plans</div>
                </Card>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Contact Section - balanced two-column layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-12 md:mb-14">
            <Badge variant="secondary" className="mb-4 bg-accent/80 text-white border-accent">
              <Users className="h-4 w-4 mr-1" />
              Get In Touch
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
              Ready to Start Your <span className="text-primary">Recovery Journey?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Contact us today to schedule your assessment or ask any questions about our services.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Left: Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="min-h-0"
            >
              <Card className="h-full p-6 md:p-8 bg-card border-2 border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl md:text-2xl">Contact Information</CardTitle>
                  <CardDescription>Multiple ways to reach our team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <a href="tel:5875865566" className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Phone</div>
                        <div className="text-muted-foreground">(587) 586-5566</div>
                      </div>
                    </a>
                    <a href="mailto:info@physiorehabhome.ca" className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Email</div>
                        <div className="text-muted-foreground">info@physiorehabhome.ca</div>
                      </div>
                    </a>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Hours</div>
                        <div className="text-muted-foreground">Monday – Sunday: 8:00 AM – 7:00 PM</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button className="flex-1" asChild>
                      <a href="tel:5875865566">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </a>
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent" asChild>
                      <Link href="/book">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Online
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: Book Your Visit CTA */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="min-h-0"
            >
              <Card className="h-full p-6 md:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/20 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col justify-center h-full min-h-[280px]">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    Book Your Home Visit
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Schedule an initial assessment or follow-up. We come to you with everything needed for your session. Direct billing available.
                  </p>
                  <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Same-day booking when available
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      No travel — we visit you at home
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Guest or login — book either way
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" asChild>
                      <Link href="/book">
                        <Calendar className="h-5 w-5 mr-2" />
                        Book Appointment
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-primary/30 bg-background/50" asChild>
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
