import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Phone, Home, CheckCircle, Clock } from "lucide-react"

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
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Getting professional rehabilitation care at home is simple. Here's how we make it happen for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="relative text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
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
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="text-lg px-8 py-6">
            <Calendar className="h-5 w-5 mr-2" />
            Start Your Recovery Today
          </Button>
        </div>
      </div>
    </section>
  )
}
