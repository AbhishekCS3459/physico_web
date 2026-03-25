import { MainNavigation } from "@/components/main-navigation"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { PersistentCTA } from "@/components/persistent-cta"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Zap, Shield, Clock, MapPin } from "lucide-react"

const services = [
  {
    title: "Mobile Physiotherapy",
    description: "Comprehensive physiotherapy treatments in the comfort of your home",
    icon: Heart,
    features: [
      "Injury rehabilitation",
      "Post-surgery recovery",
      "Chronic pain management",
      "Movement assessment",
      "Fall prevention program",
    ],
    price: "Starting at $120/session",
  },
  {
    title: "Occupational Therapy",
    description: "Help you regain independence in daily activities and work tasks",
    icon: Users,
    features: ["Daily living skills", "Workplace assessments", "Adaptive equipment", "Cognitive rehabilitation"],
    price: "Starting at $130/session",
  },
  {
    title: "Massage Therapy",
    description: "Therapeutic massage to reduce pain and improve mobility",
    icon: Zap,
    features: ["Deep tissue massage", "Relaxation therapy", "Sports massage", "Injury prevention"],
    price: "Starting at $100/session",
  },
  {
    title: "Seniors Care",
    description: "Specialized care programs designed for older adults",
    icon: Shield,
    features: ["Fall prevention", "Balance training", "Strength maintenance", "Home safety assessments"],
    price: "Starting at $110/session",
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 text-balance">
            Our Services
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty px-2">
            Professional rehabilitation services delivered to your home. Our experienced team provides personalized care
            to help you recover, maintain, and improve your health and mobility.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 mb-12 sm:mb-16">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card key={index} className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 hover:scale-[1.02] group">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                      <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="font-serif text-xl sm:text-xl text-balance">{service.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {service.price}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed text-pretty">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-pretty">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                    Book This Service
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-br from-muted/50 via-background to-primary/5 rounded-xl p-6 sm:p-8 text-center border border-primary/10 shadow-lg">
          <h2 className="font-serif text-xl sm:text-2xl font-bold mb-4 text-balance">Why Choose Mobile Care?</h2>
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-6 sm:mt-8">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Convenient Scheduling</h3>
              <p className="text-sm text-muted-foreground text-pretty">Flexible appointments that fit your schedule</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <MapPin className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Your Comfort Zone</h3>
              <p className="text-sm text-muted-foreground text-pretty">Receive care in familiar surroundings</p>
            </div>
            <div className="flex flex-col items-center text-center sm:col-span-2 lg:col-span-1">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Direct Billing</h3>
              <p className="text-sm text-muted-foreground text-pretty">We handle insurance claims for you</p>
            </div>
          </div>
        </div>
      </main>
      <EnhancedFooter />
      <PersistentCTA />
    </div>
  )
}
