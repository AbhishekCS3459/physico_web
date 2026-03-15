import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock, Home, Phone } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    icon: Phone,
    title: "Book Your Appointment",
    description: "Call us or book online. We'll discuss your needs and schedule a convenient time.",
    time: "2 minutes",
  },
  {
    icon: Calendar,
    title: "Confirm Details",
    description: "We'll confirm your appointment and send you preparation instructions.",
    time: "24 hours",
  },
  {
    icon: Home,
    title: "We Come to You",
    description: "Our licensed therapist arrives at your home with all necessary equipment.",
    time: "On time",
  },
  {
    icon: CheckCircle,
    title: "Assessment & Treatment",
    description: "Comprehensive evaluation followed by personalized treatment in your space.",
    time: "60-90 minutes",
  },
  {
    icon: Clock,
    title: "Follow-up Care",
    description: "Ongoing support with exercise programs and progress monitoring.",
    time: "Ongoing",
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Getting professional rehabilitation care at home is simple. Here's how we make it happen for you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            return (
            <Card key={index} className="relative text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StepIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{step.description}</p>
                <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                  {step.time}
                </div>
              </CardContent>
            </Card>
          )})}
        </div>

        <div className="text-center">
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/book">
              <Calendar className="h-5 w-5 mr-2" />
              Start Your Recovery Today
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
