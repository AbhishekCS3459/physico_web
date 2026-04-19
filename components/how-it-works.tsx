"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock, Home, Phone } from "lucide-react"
import { motion, useScroll, useTransform } from "motion/react"
import Link from "next/link"
import { useRef } from "react"

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
  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const stepsY = useTransform(scrollYProgress, [0, 1], ["0%", "-4%"])
  const ctaY = useTransform(scrollYProgress, [0, 1], ["0%", "3%"])

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 lg:py-28 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-14">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            Simple Recovery Flow
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Getting professional rehabilitation care at home is simple. Here's how we make it happen for you.
          </p>
        </div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 mb-8 sm:mb-12" style={{ y: stepsY }}>
          {steps.map((step, index) => {
            const StepIcon = step.icon
            return (
              <Card
                key={index}
                className="relative text-center rounded-2xl border border-border/70 bg-card/85 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <StepIcon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{step.description}</p>
                  <div className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block">
                    {step.time}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>

        <motion.div className="text-center" style={{ y: ctaY }}>
          <Button size="lg" className="text-base sm:text-lg px-8 py-6 shadow-md" asChild>
            <Link href="/book">
              <Calendar className="h-5 w-5 mr-2" />
              Start Your Recovery Today
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
