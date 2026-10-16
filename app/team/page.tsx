import { EnhancedFooter } from "@/components/enhanced-footer"
import { MainNavigation } from "@/components/main-navigation"
import { PersistentCTA } from "@/components/persistent-cta"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BookOpen, Heart, Shield, Star, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function TeamPage() {
  const teamQualities = [
    "Extensive clinical experience",
    "Passion for patient-centered care",
    "Commitment to ongoing education and innovation",
    "Friendly, approachable, and respectful professionals",
    "Focused on functional recovery in your real-life environments",
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
    <div className="min-h-screen bg-gradient-to-b from-muted/10 via-background to-background">
      <MainNavigation />
      <main className="flex-1 w-full py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-14">
          {/* Header */}
          <section className="relative mb-12 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6 py-10 sm:mb-16 sm:px-10 lg:px-14 lg:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

            <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] xl:gap-20">
              <div className="text-center lg:text-left">
                <Badge className="mb-5 gap-1.5 rounded-full px-4 py-1.5 text-sm">
                  <Users className="h-4 w-4" />
                  Meet Our Team
                </Badge>
                <h1 className="mb-6 text-3xl font-bold leading-tight text-balance sm:text-4xl xl:text-5xl">
                  Experienced, Licensed &{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Compassionate
                  </span>{" "}
                  Professionals
                </h1>
                <p className="mx-auto max-w-3xl text-lg text-foreground text-pretty lg:mx-0 lg:text-xl">
                  Our team is made up of experienced, licensed, and compassionate healthcare professionals dedicated to
                  delivering high-quality care wherever you are.
                </p>

                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4 lg:justify-start">
                  <Button asChild size="lg" className="w-full px-8 text-base shadow-lg transition-all duration-300 hover:shadow-xl sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                    <Link href="/book">
                      <Users className="mr-2 h-5 w-5" />
                      Book Your Assessment
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full px-8 text-base transition-all duration-300 sm:w-auto bg-background/70 border-primary/30 hover:border-primary hover:bg-primary/5">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>

                <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { icon: Award, value: "25+ years", label: "Clinical experience" },
                    { icon: Shield, value: "Licensed", label: "Registered clinicians" },
                    { icon: Heart, value: "At home", label: "Care across Calgary" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div
                      key={value}
                      className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 text-left shadow-sm backdrop-blur"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <dt className="sr-only">{label}</dt>
                        <dd className="text-base font-bold leading-tight">{value}</dd>
                        <dd className="text-sm text-foreground/80">{label}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:max-w-xl">
                <div className="grid grid-cols-2 items-start gap-4 sm:gap-5">
                  {[
                    { src: "/team/bharat-vishembera.jpg", name: "Bharat Vishembera", role: "Physiotherapist", offset: "" },
                    { src: "/team/binod-baranwal.jpg", name: "Binod Baranwal", role: "Occupational Therapist", offset: "mt-10 sm:mt-14" },
                  ].map((member) => (
                    <figure
                      key={member.name}
                      className={`overflow-hidden rounded-3xl border-4 border-background bg-card shadow-xl ${member.offset}`}
                    >
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={member.src}
                          alt={`${member.name}, ${member.role}`}
                          fill
                          sizes="(min-width: 1024px) 22vw, 45vw"
                          className="object-cover object-top"
                          priority
                        />
                      </div>
                      <figcaption className="px-3 py-3 text-center">
                        <p className="text-base font-semibold leading-tight sm:text-lg">{member.name}</p>
                        <p className="text-sm text-primary sm:text-base">{member.role}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
                <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-primary/20 bg-background px-4 py-2 text-sm font-medium shadow-lg sm:text-base">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  Physiotherapy · OT · Massage
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-12">
            {/* Clinician Spotlight — named clinicians first */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center sm:text-left">Clinician Spotlight</h2>
              <p className="text-lg lg:text-xl text-foreground max-w-2xl mx-auto sm:mx-0 text-center sm:text-left">
                A closer look at the therapists who bring evidence-based care to your home—centered on safety, comfort, and functional recovery.
              </p>
              <div className="space-y-8 pt-6">
            {/* Physiotherapist: Bharat Vishembera — featured first */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-2xl overflow-hidden border-2 border-primary/20 shrink-0 bg-muted">
                      <Image
                        src="/team/bharat-vishembera.jpg"
                        alt="Bharat Vishembera, Physiotherapist"
                        fill
                        className="object-cover object-[center_18%]"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-3xl sm:text-4xl">Bharat Vishembera</CardTitle>
                      <CardDescription className="mt-1 text-lg text-primary font-medium">
                        Physiotherapist
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit">PT</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg lg:text-xl text-foreground leading-relaxed">
                  Bharat Vishembera is a highly experienced physiotherapist with over 25 years of clinical practice. He
                  completed his Master’s degree in Applied Musculoskeletal Physiotherapy in England and has worked
                  in a wide range of clinical environments, including hospitals and private clinics in both the UK and
                  Canada.
                </p>
                <p className="text-lg lg:text-xl text-foreground leading-relaxed">
                  Over the years, Bharat Vishembera has completed numerous advanced courses and certifications, gaining
                  extensive expertise in manipulative therapy, sports injury management, and acupuncture. He
                  specializes in the assessment and treatment of musculoskeletal conditions, sports injuries,
                  post-surgical rehabilitation, and chronic pain management.
                </p>
                <p className="text-lg lg:text-xl text-foreground leading-relaxed">
                  His treatment approach combines manual therapy, therapeutic exercise, movement correction, and
                  patient education to support safe, effective, and long-term recovery. Bharat Vishembera is trained in
                  myofascial release, acupuncture, joint manipulation, specific soft tissue mobilization, muscle energy
                  techniques, vestibular rehabilitation, functional exercise, and Kinesio taping.
                </p>
                <p className="text-lg lg:text-xl text-foreground leading-relaxed">
                  Committed to evidence-based practice, Bharat Vishembera regularly participates in professional development
                  courses to stay current with modern physiotherapy techniques. He believes strongly in educating and
                  empowering patients so they can better understand their condition and take an active role in their
                  recovery and long-term health.
                </p>
              </CardContent>
            </Card>
              </div>
            </div>

            {/* Our Physiotherapists */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Our Physiotherapists
                </CardTitle>
                <CardDescription className="text-lg">
                  Each member of our team is fully qualified and registered, with expertise in a wide range of areas
                  including orthopedic rehab, post-surgical recovery, neurological conditions, chronic pain management,
                  and mobility training.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Areas of Expertise
                      </h4>
                      <ul className="space-y-2 text-base lg:text-lg text-foreground">
                        <li>• Orthopedic rehabilitation</li>
                        <li>• Post-surgical recovery</li>
                        <li>• Neurological conditions</li>
                        <li>• Chronic pain management</li>
                        <li>• Mobility training</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Continuing Education
                      </h4>
                      <p className="text-base lg:text-lg text-foreground">
                        We stay up to date with the latest techniques and evidence-based practices to ensure you're
                        receiving the best care possible.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold mb-3">Treatment Techniques</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {physiotherapyServices.map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What Sets Us Apart */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  <Star className="h-6 w-6 text-primary" />
                  What Sets Us Apart
                </CardTitle>
                <CardDescription className="text-lg">Our commitment to excellence in patient care</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {teamQualities.map((quality) => (
                    <div key={quality} className="flex items-start gap-3 p-4 bg-gradient-to-br from-muted/50 to-background rounded-lg border border-primary/10 hover:border-primary/20 hover:shadow-md transition-all duration-300 hover:scale-[1.02] group">
                      <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-base font-medium">{quality}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-2xl overflow-hidden border-2 border-primary/20 shrink-0 bg-muted">
                      <Image
                        src="/team/binod-baranwal.jpg"
                        alt="Binod Baranwal, Occupational Therapist"
                        fill
                        className="object-cover object-[center_20%]"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-3xl sm:text-4xl">Binod Baranwal</CardTitle>
                      <CardDescription className="mt-1 text-lg text-primary font-medium">
                        Occupational Therapist, Diploma in Rehabilitation
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit">OT</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg lg:text-xl text-foreground leading-relaxed">
                  Binod is a dedicated and experienced occupational therapist with over 2 decades of experience
                  enabling individuals to achieve their occupational goals and regain independence in performing
                  leisure activities, work and ADL related concerns.
                </p>
                <p className="text-lg lg:text-xl text-foreground leading-relaxed">
                  With a strong background in physical and cognitive health and passion for holistic well-being,
                  Binod believes in empowering clients through an individual-oriented strength based approach. He is
                  committed to helping you return to performing the daily activities and your meaningful occupation
                  that enhances your quality of life. He ensures that your treatment plan is not only evidence-based
                  but also tailored to your unique goals and passions.
                </p>
                <p className="text-lg lg:text-xl text-foreground leading-relaxed">
                  His skills in Seating Assessment, Cognitive assessment and his creativity enable him to utilize a
                  holistic approach to help clients regain, adapt, or maintain skills for daily living, promoting
                  independence and safety within their own homes.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="text-xs">Seating Assessment</Badge>
                  <Badge variant="outline" className="text-xs">Cognitive Assessment</Badge>
                  <Badge variant="outline" className="text-xs">ADL Training</Badge>
                  <Badge variant="outline" className="text-xs">Holistic Approach</Badge>
                </div>
              </CardContent>
            </Card>

          {/* Occupational Therapist */}
          <Card className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Our Occupational Therapist
              </CardTitle>
              <CardDescription className="text-lg">
                We're proud to have a skilled Occupational Therapist (OT) on our team to provide comprehensive, holistic
                care tailored to each individual's daily life needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-lg lg:text-xl text-foreground leading-relaxed">
                  Our OT works closely with clients to improve their independence and quality of life by focusing on
                  meaningful daily activities — whether at home, at work, or in the community. From helping you adapt
                  your environment to retraining skills after injury, our OT ensures that therapy is functional,
                  practical, and truly life-enhancing.
                </p>

                <div>
                  <h4 className="text-xl font-semibold mb-3">Services Include</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {otServices.map((service) => (
                      <div key={service} className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-base">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                  <h4 className="text-xl font-semibold mb-2">Why It Matters</h4>
                  <p className="text-base lg:text-lg text-foreground">
                    Occupational therapy is about more than recovery — it's about regaining confidence, control, and
                    independence in the activities that matter most to you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Massage Therapist */}
          <Card className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Our Massage Therapist
              </CardTitle>
              <CardDescription className="text-lg">
                We understand that healing isn't just about exercise and mobility — it's also about relaxation,
                recovery, and relieving tension.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-lg lg:text-xl text-foreground leading-relaxed">
                  Our Registered Massage Therapist (RMT) brings expert hands-on care directly to your home, providing
                  therapeutic treatments designed to reduce pain, improve circulation, ease muscle tension, and support
                  your overall well-being.
                </p>

                <div>
                  <h4 className="text-xl font-semibold mb-3">Services Offered</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {massageServices.map((service) => (
                      <div key={service} className="flex items-start gap-2">
                        <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-base">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-secondary/5 p-6 rounded-lg border border-secondary/20">
                  <h4 className="text-xl font-semibold mb-3">Benefits of In-Home Massage Therapy</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-base">Comfort and privacy of your own space</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-base">No need to travel post-treatment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-base">Custom-tailored sessions based on your needs</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-base">Seamless integration with other therapies</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold mb-4">Ready to Meet Our Team?</h3>
                <p className="text-lg lg:text-xl text-foreground mb-6 max-w-2xl mx-auto">
                  Whether you're looking to regain strength after surgery, manage a chronic condition, or simply move
                  with more ease, our team is here to support you every step of the way.
                </p>
                <Button asChild size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/book">
                    <Users className="h-5 w-5 mr-2" />
                    Book Your Assessment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <EnhancedFooter />
      <PersistentCTA />
    </div>
  )
}
