"use client"

import { Badge } from "@/components/ui/badge"
import { Award, Clock, MapPin, Shield, Users } from "lucide-react"

const trustIndicators = [
  {
    icon: Shield,
    text: "Direct Billing Available",
    subtext: "15+ Insurance Partners",
  },
  {
    icon: Clock,
    text: "7 Days a Week",
    subtext: "Flexible Scheduling",
  },
  {
    icon: Award,
    text: "Licensed Therapists",
    subtext: "Certified Professionals",
  },
  {
    icon: Users,
    text: "500+ Happy Clients",
    subtext: "Trusted in Calgary",
  },
  {
    icon: MapPin,
    text: "Calgary & Area",
    subtext: "Mobile Service",
  },
]

export function ProofStrip() {
  return (
    <section className="py-12 sm:py-14 lg:py-16 bg-gradient-to-b from-background to-muted/30 border-y border-border/50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 lg:mb-10">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            Trusted Healthcare Provider
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">Why Calgary Families Choose Us</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {trustIndicators.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="group rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-sm lg:text-base mb-1">{item.text}</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">{item.subtext}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
