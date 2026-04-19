"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Home, Sparkles, TrendingUp, UserCheck } from "lucide-react"

const valueProps = [
  {
    icon: Home,
    title: "Convenience",
    description: "No travel required. We bring professional therapy equipment and expertise directly to your home.",
    highlight: "Save Time & Energy",
  },
  {
    icon: UserCheck,
    title: "One-on-One Care",
    description: "Personalized treatment plans with dedicated therapist attention in a comfortable environment.",
    highlight: "Focused Treatment",
  },
  {
    icon: TrendingUp,
    title: "Faster Recovery",
    description: "Consistent home-based therapy leads to better outcomes and faster rehabilitation progress.",
    highlight: "Better Results",
  },
  {
    icon: CreditCard,
    title: "Direct Billing",
    description:
      "We handle insurance paperwork directly with 15+ major insurers. No upfront costs for covered services.",
    highlight: "No Hassle",
  },
  {
    icon: Sparkles,
    title: "Safe & Hygienic",
    description: "All equipment sanitized between visits. COVID-safe protocols ensure your family's health protection.",
    highlight: "Peace of Mind",
  },
]

export function ValueProposition() {
  return (
    <section className="py-16 md:py-24 lg:py-28 bg-background">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-14">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            Why Choose Mobile Therapy
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance tracking-tight">
            Healthcare That Comes to <span className="text-primary">You</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Experience the convenience and effectiveness of professional rehabilitation services in your own home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon
            return (
              <Card
                key={index}
                className="group h-full rounded-2xl border border-border/60 bg-card/85 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl tracking-tight">{prop.title}</CardTitle>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                      {prop.highlight}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{prop.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
