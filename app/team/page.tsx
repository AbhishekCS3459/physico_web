import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PersistentCTA } from "@/components/persistent-cta"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Heart, Award, BookOpen, Shield, Star } from "lucide-react"

export default function TeamPage() {
  const teamQualities = [
    "Extensive clinical experience",
    "Passion for patient-centered care",
    "Commitment to ongoing education and innovation",
    "Friendly, approachable, and respectful professionals",
    "Focused on functional recovery in real-life environments",
  ]

  const physiotherapyServices = [
    "Manual Therapy",
    "Therapeutic Exercise",
    "Postural & Movement Retraining",
    "Neuromuscular Re-education",
    "Soft Tissue Release & Myofascial Techniques",
    "Electrotherapy",
    "Taping & Bracing",
    "Education & Self-Management",
  ]

  const otServices = [
    "Home safety assessments & equipment recommendations",
    "Rehabilitation after stroke, surgery, or injury",
    "Support for neurological and chronic conditions",
    "Upper limb therapy and fine motor skill development",
    "Cognitive and memory strategies",
    "Energy conservation and fatigue management",
    "Activities of daily living (ADL) training",
    "Custom adaptive solutions for home and work",
  ]

  const massageServices = [
    "Therapeutic & deep tissue massage",
    "Sports massage for injury prevention & recovery",
    "Relaxation massage for stress relief",
    "Myofascial release",
    "Trigger point therapy",
    "Postural and tension-related treatment",
    "Massage for chronic pain & arthritis",
    "Prenatal and postpartum massage",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-16">
        <div className="container px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Users className="h-4 w-4 mr-1" />
              Meet Our Team
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Experienced, Licensed & <span className="text-primary">Compassionate</span> Professionals
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Our team is made up of experienced, licensed, and compassionate healthcare professionals dedicated to
              delivering high-quality care wherever you are.
            </p>
          </div>

          {/* What Sets Us Apart */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="h-6 w-6 text-primary" />
                What Sets Us Apart
              </CardTitle>
              <CardDescription>Our commitment to excellence in patient care</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamQualities.map((quality, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{quality}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Physiotherapists */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl">Our Physiotherapists</CardTitle>
              <CardDescription>
                Each member of our team is fully qualified and registered, with expertise in a wide range of areas
                including orthopedic rehab, post-surgical recovery, neurological conditions, chronic pain management,
                and mobility training.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Areas of Expertise
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Orthopedic rehabilitation</li>
                      <li>• Post-surgical recovery</li>
                      <li>• Neurological conditions</li>
                      <li>• Chronic pain management</li>
                      <li>• Mobility training</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Continuing Education
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      We stay up to date with the latest techniques and evidence-based practices to ensure you're
                      receiving the best care possible.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Treatment Techniques</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {physiotherapyServices.map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Occupational Therapist */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl">Our Occupational Therapist</CardTitle>
              <CardDescription>
                We're proud to have a skilled Occupational Therapist (OT) on our team to provide comprehensive, holistic
                care tailored to each individual's daily life needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Our OT works closely with clients to improve their independence and quality of life by focusing on
                  meaningful daily activities — whether at home, at work, or in the community. From helping you adapt
                  your environment to retraining skills after injury, our OT ensures that therapy is functional,
                  practical, and truly life-enhancing.
                </p>

                <div>
                  <h4 className="font-semibold mb-3">Services Include</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {otServices.map((service, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2">Why It Matters</h4>
                  <p className="text-sm text-muted-foreground">
                    Occupational therapy is about more than recovery — it's about regaining confidence, control, and
                    independence in the activities that matter most to you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Massage Therapist */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl">Our Massage Therapist</CardTitle>
              <CardDescription>
                We understand that healing isn't just about exercise and mobility — it's also about relaxation,
                recovery, and relieving tension.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Our Registered Massage Therapist (RMT) brings expert hands-on care directly to your home, providing
                  therapeutic treatments designed to reduce pain, improve circulation, ease muscle tension, and support
                  your overall well-being.
                </p>

                <div>
                  <h4 className="font-semibold mb-3">Services Offered</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {massageServices.map((service, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-secondary/5 p-6 rounded-lg border border-secondary/20">
                  <h4 className="font-semibold mb-3">Benefits of In-Home Massage Therapy</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Comfort and privacy of your own space</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">No need to travel post-treatment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Custom-tailored sessions based on your needs</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Seamless integration with other therapies</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Meet Our Team?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Whether you're looking to regain strength after surgery, manage a chronic condition, or simply move
                  with more ease, our team is here to support you every step of the way.
                </p>
                <Button size="lg" className="text-lg px-8">
                  <Users className="h-5 w-5 mr-2" />
                  Book Your Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      <PersistentCTA />
    </div>
  )
}
