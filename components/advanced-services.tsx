"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Brain,
  PackageIcon as MassageIcon,
  Users,
  Stethoscope,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
} from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

const services = [
  {
    icon: Activity,
    title: "Physiotherapy",
    description:
      "Comprehensive physical rehabilitation with manual therapy, exercise prescription, and movement analysis",
    features: [
      "Manual Therapy & Joint Mobilization",
      "Customized Exercise Programs",
      "Pain Management Strategies",
    ],
    pricing: {
      initial: 140,
      followUp: 140,
    },
    duration: "60 mins initial / 45 mins follow-up",
    popular: true,
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Brain,
    title: "Occupational Therapy",
    description:
      "Enhance independence and quality of life through functional rehabilitation and environmental adaptation",
    features: [
      "Home Safety Assessments",
      "Adaptive Equipment Training",
      "Cognitive Rehabilitation",
      "Activities of Daily Living",
    ],
    pricing: {}, // Contact for pricing
    duration: "—",
    popular: false,
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: MassageIcon,
    title: "Massage Therapy",
    comingSoon: true,
    description: "Therapeutic massage by registered massage therapists for pain relief, recovery, and wellness. Booking available soon.",
    features: [],
    pricing: {},
    duration: "—",
    popular: false,
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: Users,
    title: "Seniors Specialized Care",
    description: "Tailored rehabilitation programs for older adults focusing on safety, mobility, and independence",
    features: [
      "Fall Prevention Programs",
      "Balance & Strength Training",
      "Mobility Aid Training",
      "Chronic Condition Management",
    ],
    pricing: {
      standard: "Same as Physio",
    },
    duration: "45-60 mins",
    popular: false,
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Stethoscope,
    title: "Post-Surgical Rehabilitation",
    description: "Specialized recovery programs following orthopedic, cardiac, and other surgical procedures",
    features: ["Joint Replacement Recovery", "Surgical Site Care", "Mobility Restoration", "Strength Rebuilding"],
    pricing: {
      standard: "Same as Physio",
    },
    duration: "45-60 mins",
    popular: false,
    color: "from-cyan-500 to-blue-600",
  },
]

export function AdvancedServices() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/20 to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-4 bg-primary/80 text-white border-primary">
            <Star className="h-4 w-4 mr-1" />
            Comprehensive Care Services
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Expert Rehabilitation
            </span>
            <br />
            <span className="text-foreground">Services at Home</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Our licensed therapists provide comprehensive care across multiple specialties, delivering personalized
            treatment in the comfort and convenience of your home.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card
                className={`group relative overflow-hidden border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 ${
                  hoveredCard === index ? "border-primary/30 scale-105" : "border-border hover:border-primary/20"
                }`}
              >
                {service.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-primary text-white border-0 shadow-lg">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                {"comingSoon" in service && (service as { comingSoon?: boolean }).comingSoon && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="border-0">Coming Soon</Badge>
                  </div>
                )}

                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                <CardHeader className="relative z-10">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <service.icon className="h-8 w-8 text-white" />
                  </motion.div>

                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                  <div className="space-y-3">
                    {service.features.length === 0 && "comingSoon" in service && (
                      <p className="text-sm text-muted-foreground">Booking available soon.</p>
                    )}
                    {service.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-start gap-3 text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {service.duration}
                      </div>
                      {"comingSoon" in service && (service as { comingSoon?: boolean }).comingSoon ? null : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Direct Billing
                      </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {Object.entries(service.pricing).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">
                            {key === "initial"
                              ? "Initial Assessment"
                              : key === "followUp"
                                ? "Follow-up Session"
                                : key === "extended"
                                  ? "Extended Session"
                                  : key === "assessment"
                                    ? "Home Assessment"
                                    : key}
                            :
                          </span>
                          <span className="font-semibold text-primary">
                            {typeof value === "number" ? `$${value}` : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {"comingSoon" in service && (service as { comingSoon?: boolean }).comingSoon ? (
                    <Button className="w-full" variant="secondary" size="lg" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                  <Button
                    className={`w-full bg-gradient-to-r ${service.color} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white border-0`}
                    size="lg"
                  >
                    Book {service.title}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12 border border-primary/10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Serving Calgary & Surrounding Areas</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              We provide mobile services throughout Calgary, Airdrie, Okotoks, Cochrane, and Crossfield. All treatments
              include direct billing to most major insurance providers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                View Full Pricing
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary/20 hover:border-primary hover:bg-primary/5 bg-transparent"
              >
                <Shield className="h-5 w-5 mr-2" />
                Insurance Coverage
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
