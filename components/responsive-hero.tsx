"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, CheckCircle, Clock, Heart, MapPin, Phone, Shield, Star, Users } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useState } from "react"

export default function ResponsiveHero() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const trustIndicators = [
    { icon: Shield, text: "Licensed & Insured", color: "text-primary" },
    { icon: Award, text: "Certified Professionals", color: "text-secondary" },
    { icon: Star, text: "5-Star Rated", color: "text-primary" },
    { icon: Users, text: "500+ Happy Patients", color: "text-secondary" },
  ]

  const quickStats = [
    { number: "24/7", label: "Availability", icon: Clock },
    { number: "Same Day", label: "Booking", icon: CheckCircle },
    { number: "Direct", label: "Billing", icon: Shield },
    { number: "4 Areas", label: "Served", icon: MapPin },
  ]

  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge variant="secondary" className="mb-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Calgary's Premier Mobile Therapy
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Professional <span className="text-primary">Physiotherapy</span> at Your Home
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-xl mx-auto lg:mx-0"
            >
              Certified physiotherapists, occupational therapists, and massage therapists bringing expert care directly
              to your home across Calgary and surrounding areas.
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0"
            >
              {trustIndicators.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex items-center gap-2 justify-center lg:justify-start">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color} shrink-0`} />
                    <span className="text-xs sm:text-sm font-medium text-foreground">{item.text}</span>
                  </div>
                )
              })}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0"
            >
              <Button
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none"
                asChild
              >
                <Link href="/book">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Book Physiotherapy
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 border-2 hover:bg-primary/5 flex-1 sm:flex-none bg-transparent"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Call </span>(587) 586-5566
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 sm:pt-8 max-w-lg mx-auto lg:mx-0"
            >
              {quickStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-1" />
                      <span className="font-bold text-base sm:text-lg text-foreground">{stat.number}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative order-first lg:order-last"
          >
            <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src="/professional-physiotherapist-working-with-elderly-.jpg"
                    alt="Professional physiotherapy session at home"
                    className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover object-center block"
                  />
                  {/* Overlay with key benefits */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-6">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 max-w-md mx-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs sm:text-sm font-medium text-foreground">Available Now</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
                          <span>Calgary & Area</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating testimonial card - Hidden on mobile for cleaner layout */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 hidden xl:block"
            >
              <Card className="bg-background/95 backdrop-blur-sm shadow-xl border-primary/20 max-w-xs">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    "The home physiotherapy was exactly what I needed after surgery. Professional and convenient!"
                  </p>
                  <p className="text-xs font-medium">- Margaret T., Calgary</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
