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
  Users,
  Zap
} from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

const pricingData = {
  physiotherapy: {
    icon: Activity,
    title: "Physiotherapy",
    color: "from-emerald-500 to-teal-600",
    services: [
      { name: "Initial Assessment", duration: "60 mins", price: 140 },
      { name: "Follow-Up Session", duration: "45 mins", price: 130 },
      { name: "Extended Session", duration: "60 mins", price: 140 },
    ],
  },
  occupationalTherapy: {
    icon: Brain,
    title: "Occupational Therapy",
    color: "from-blue-500 to-indigo-600",
    services: [
      { name: "Initial Assessment", duration: "60 mins", price: 130 },
      { name: "Follow-Up Session", duration: "45 mins", price: 100 },
      { name: "Home Safety Assessment", duration: "60 mins", price: 150 },
    ],
  },
  massageTherapy: {
    icon: MassageIcon,
    title: "Massage Therapy",
    color: "from-purple-500 to-pink-600",
    services: [
      { name: "45 Minute Session", duration: "45 mins", price: 85 },
      { name: "60 Minute Session", duration: "60 mins", price: 105 },
      { name: "90 Minute Session", duration: "90 mins", price: 140 },
    ],
  },
  acupuncture: {
    icon: Zap,
    title: "Acupuncture & Dry Needling",
    color: "from-orange-500 to-red-600",
    services: [{ name: "Included with Physio Session", duration: "Part of session", price: 0 }],
  },
}

const additionalServices = [
  { name: "Travel Fee (outside service area)", price: "15-25" },
  { name: "Documentation/Forms/Reports", price: "From 40" },
]

const serviceAreas = ["Calgary", "Airdrie", "Okotoks", "Cochrane", "Crossfield"]

export function InteractivePricingContact() {
  const [selectedService, setSelectedService] = useState("physiotherapy")
  const [selectedSession, setSelectedSession] = useState(0)
  const [sessionCount, setSessionCount] = useState(1)
  const [postalCode, setPostalCode] = useState("")
  const [coverageResult, setCoverageResult] = useState("")
  const calculateTotal = () => {
    const service = pricingData[selectedService as keyof typeof pricingData]
    const sessionPrice = service.services[selectedSession]?.price || 0
    return sessionPrice * sessionCount
  }

  const checkCoverage = () => {
    if (postalCode.length >= 3) {
      const firstChar = postalCode.charAt(0).toUpperCase()
      if (["T", "T1", "T2", "T3", "T4"].some((code) => postalCode.toUpperCase().startsWith(code))) {
        setCoverageResult("✅ We serve your area! No travel fee applies.")
      } else {
        setCoverageResult("⚠️ Outside our primary service area. Travel fee may apply.")
      }
    }
  }

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/10 to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container px-4 relative z-10">
        {/* Pricing Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary/80 text-white border-primary">
              <DollarSign className="h-4 w-4 mr-1" />
              Transparent Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Fair & Transparent
              </span>
              <br />
              <span className="text-foreground">Pricing Structure</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              No hidden fees, no surprises. Direct billing available to most major insurance providers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Interactive Pricing Calculator */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-gradient-to-br from-card via-background to-primary/5 border-2 border-primary/10 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-2xl">Pricing Calculator</CardTitle>
                  <CardDescription>Calculate your session costs instantly</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Service Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Select Service</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(pricingData).map(([key, service]) => (
                        <Button
                          key={key}
                          variant={selectedService === key ? "default" : "outline"}
                          className={`p-4 h-auto flex-col gap-2 ${
                            selectedService === key
                              ? `bg-gradient-to-r ${service.color} text-white border-0`
                              : "bg-transparent"
                          }`}
                          onClick={() => {
                            setSelectedService(key)
                            setSelectedSession(0)
                          }}
                        >
                          <service.icon className="h-5 w-5" />
                          <span className="text-xs text-center">{service.title}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Session Type Selection */}
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
                        {pricingData[selectedService as keyof typeof pricingData].services.map((session, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {session.name} - {session.duration} - ${session.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Session Count */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Number of Sessions</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSessionCount(Math.max(1, sessionCount - 1))}
                        disabled={sessionCount <= 1}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={sessionCount}
                        onChange={(e) => setSessionCount(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        className="text-center w-20"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSessionCount(sessionCount + 1)}
                        disabled={sessionCount >= 20}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Total Calculation */}
                  <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Estimated Total:</span>
                      <span className="text-3xl font-bold text-primary">${calculateTotal()}</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Per Session:</span>
                        <span>
                          $
                          {pricingData[selectedService as keyof typeof pricingData].services[selectedSession]?.price ||
                            0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessions:</span>
                        <span>{sessionCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-primary to-accent" asChild>
                      <Link href="/book">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now
                      </Link>
                    </Button>
                    <Button variant="outline" className="bg-transparent">
                      <Shield className="h-4 w-4 mr-2" />
                      Check Insurance
                    </Button>
                  </div>
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
              <Card className="p-6 border-2 border-primary/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Service Area Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Enter Your Postal Code</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="T2P 1J9"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="uppercase"
                      />
                      <Button onClick={checkCoverage} variant="outline" className="bg-transparent">
                        Check
                      </Button>
                    </div>
                  </div>
                  {coverageResult && (
                    <div className="p-3 bg-muted rounded-lg text-sm font-medium">{coverageResult}</div>
                  )}
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
              <Card className="p-6 border-2 border-accent/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    Additional Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {additionalServices.map((service, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{service.name}</span>
                      <span className="font-semibold text-accent">${service.price}</span>
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

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-accent/80 text-white border-accent">
              <Users className="h-4 w-4 mr-1" />
              Get In Touch
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Ready to Start Your <span className="text-primary">Recovery Journey?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Contact us today to schedule your assessment or ask any questions about our services.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-gradient-to-br from-card via-background to-accent/5 border-2 border-accent/10">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl">Contact Information</CardTitle>
                  <CardDescription>Multiple ways to reach our team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Phone</div>
                        <div className="text-muted-foreground">(587) 586-5566</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Mail className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold">Email</div>
                        <div className="text-muted-foreground">info@physiorehabhome.ca</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Address</div>
                        <div className="text-muted-foreground">370 Evanston Drive, Calgary, AB T3P0E2</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold">Hours</div>
                        <div className="text-muted-foreground">Monday - Sunday: 8:00 AM - 7:00 PM</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-primary to-accent">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Online
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}
