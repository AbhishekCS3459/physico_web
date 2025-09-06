import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Brain, Package as Massage, Users, Stethoscope, Zap } from "lucide-react"

const services = [
  {
    icon: Activity,
    title: "Physiotherapy",
    description: "Manual therapy, exercise prescription, and movement rehabilitation",
    features: ["Manual Therapy", "Dry Needling", "Exercise Programs", "Pain Management"],
  },
  {
    icon: Brain,
    title: "Occupational Therapy",
    description: "Home safety assessments and daily living skill improvement",
    features: ["Home Safety", "Adaptive Equipment", "Cognitive Rehab", "Fall Prevention"],
  },
  {
    icon: Massage,
    title: "Massage Therapy",
    description: "Therapeutic massage for pain relief and relaxation",
    features: ["Deep Tissue", "Relaxation", "Sports Massage", "Injury Recovery"],
  },
  {
    icon: Users,
    title: "Seniors Care",
    description: "Specialized programs for older adults and mobility challenges",
    features: ["Balance Training", "Strength Building", "Mobility Aids", "Safety Training"],
  },
  {
    icon: Stethoscope,
    title: "Post-Surgical Rehab",
    description: "Recovery support after orthopedic and other surgeries",
    features: ["Joint Replacement", "Wound Care", "Mobility Restoration", "Pain Control"],
  },
  {
    icon: Zap,
    title: "Neurological Rehab",
    description: "Specialized care for stroke, spinal cord, and brain injuries",
    features: ["Stroke Recovery", "Spinal Cord", "Brain Injury", "Movement Retraining"],
  },
]

export function ServicesOverview() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Rehabilitation Services</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our licensed therapists provide expert care across multiple specialties, all in the comfort and convenience
            of your home.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full bg-transparent">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
