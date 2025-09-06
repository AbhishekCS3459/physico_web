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
    <section className="py-12 bg-muted/30 border-y">
      <div className="container px-4">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            Trusted Healthcare Provider
          </Badge>
          <h2 className="text-2xl font-semibold text-balance">Why Calgary Families Choose Us</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {trustIndicators.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{item.text}</h3>
                <p className="text-xs text-muted-foreground">{item.subtext}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
