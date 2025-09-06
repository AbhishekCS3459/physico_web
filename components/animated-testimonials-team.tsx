"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Quote, Award, Users, Heart, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect } from "react"

const testimonials = [
  {
    name: "Margaret Thompson",
    age: "72",
    location: "Calgary SW",
    service: "Physiotherapy",
    rating: 5,
    quote:
      "After my hip replacement, Sarah came to my home twice a week. The convenience was incredible, and I recovered much faster than expected. The personalized care in my own environment made all the difference!",
    avatar: "/elderly-woman-smiling.png",
    condition: "Hip Replacement Recovery",
    duration: "8 weeks",
  },
  {
    name: "Robert Chen",
    age: "45",
    location: "Airdrie",
    service: "Occupational Therapy",
    rating: 5,
    quote:
      "The OT assessment helped make my home safer after my stroke. The therapist was professional and made practical recommendations that really work. My family feels so much more confident now.",
    avatar: "/middle-aged-asian-man.png",
    condition: "Post-Stroke Recovery",
    duration: "12 weeks",
  },
  {
    name: "Linda Rodriguez",
    age: "68",
    location: "Calgary NE",
    service: "Massage Therapy",
    rating: 5,
    quote:
      "Weekly massage therapy at home has been a game-changer for my arthritis pain. The therapist is knowledgeable and the direct billing is so convenient. I can actually enjoy my daily activities again!",
    avatar: "/hispanic-elderly-woman.jpg",
    condition: "Chronic Arthritis",
    duration: "Ongoing",
  },
  {
    name: "David Mitchell",
    age: "34",
    location: "Cochrane",
    service: "Physiotherapy",
    rating: 5,
    quote:
      "As a busy parent, having physio come to my home after my sports injury was perfect. I could still watch my kids while getting treatment. The therapist was amazing and got me back to hockey in no time!",
    avatar: "/young-father-athletic.jpg",
    condition: "Sports Injury",
    duration: "6 weeks",
  },
  {
    name: "Eleanor Watson",
    age: "81",
    location: "Okotoks",
    service: "Occupational Therapy",
    rating: 5,
    quote:
      "The fall prevention program has given me so much confidence. The therapist taught me exercises and made simple changes to my home that have made such a big difference in my daily life.",
    avatar: "/elderly-woman-confident.jpg",
    condition: "Fall Prevention",
    duration: "4 weeks",
  },
]

const teamMembers = [
  {
    name: "Dr. Sarah Johnson",
    title: "Lead Physiotherapist",
    credentials: "BScPT, MSc",
    specialties: ["Orthopedic Rehab", "Post-Surgical Care", "Manual Therapy"],
    experience: "12+ years",
    avatar: "/professional-female-physiotherapist.png",
    bio: "Specializes in orthopedic rehabilitation and has extensive experience in post-surgical recovery programs.",
  },
  {
    name: "Michael Chen",
    title: "Occupational Therapist",
    credentials: "BSc OT, OTR",
    specialties: ["Home Safety", "Neurological Rehab", "Adaptive Equipment"],
    experience: "8+ years",
    avatar: "/professional-male-occupational-therapist.jpg",
    bio: "Expert in home modifications and neurological rehabilitation with a passion for improving daily function.",
  },
  {
    name: "Lisa Rodriguez",
    title: "Registered Massage Therapist",
    credentials: "RMT, Dip MT",
    specialties: ["Therapeutic Massage", "Sports Therapy", "Pain Management"],
    experience: "10+ years",
    avatar: "/professional-female-massage-therapist.png",
    bio: "Combines traditional massage techniques with modern therapeutic approaches for optimal healing.",
  },
  {
    name: "Dr. James Wilson",
    title: "Senior Physiotherapist",
    credentials: "DPT, PhD",
    specialties: ["Geriatric Care", "Balance Training", "Chronic Pain"],
    experience: "15+ years",
    avatar: "/senior-male-physiotherapist.jpg",
    bio: "Dedicated to improving quality of life for seniors through evidence-based rehabilitation programs.",
  },
]

export function AnimatedTestimonialsTeam() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/10 to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container px-4 relative z-10">
        {/* Testimonials Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary/80 text-white border-primary">
              <Heart className="h-4 w-4 mr-1" />
              Client Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Real Results
              </span>
              <br />
              <span className="text-foreground">from Real People</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Discover how our mobile therapy services have transformed lives across Calgary and surrounding areas.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="relative h-[400px] md:h-[350px] overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 100, rotateY: 15 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: -100, rotateY: -15 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Card className="h-full bg-gradient-to-br from-card via-background to-primary/5 border-2 border-primary/10 shadow-2xl">
                    <CardContent className="p-8 md:p-12 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <Quote className="h-12 w-12 text-primary/30" />
                          <div className="flex">
                            {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>

                        <blockquote className="text-lg md:text-xl text-foreground mb-8 leading-relaxed font-medium">
                          "{testimonials[currentTestimonial].quote}"
                        </blockquote>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage
                              src={testimonials[currentTestimonial].avatar || "/placeholder.svg"}
                              alt={testimonials[currentTestimonial].name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {testimonials[currentTestimonial].name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-lg">
                              {testimonials[currentTestimonial].name}, {testimonials[currentTestimonial].age}
                            </div>
                            <div className="text-muted-foreground">{testimonials[currentTestimonial].location}</div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs border-primary/20">
                                {testimonials[currentTestimonial].service}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-accent/20">
                                {testimonials[currentTestimonial].duration}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Condition</div>
                          <div className="font-semibold text-primary">{testimonials[currentTestimonial].condition}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentTestimonial(index)
                      setIsAutoPlaying(false)
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? "bg-primary scale-125" : "bg-primary/30 hover:bg-primary/50"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 bg-transparent"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-accent/80 text-white border-accent">
              <Users className="h-4 w-4 mr-1" />
              Expert Care Team
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Meet Our <span className="text-primary">Licensed Professionals</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Our experienced team of physiotherapists, occupational therapists, and massage therapists are dedicated to
              your recovery and well-being.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="group relative overflow-hidden border-2 border-border hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div
                      className="relative mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                          <Award className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </motion.div>

                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                    <p className="text-primary font-semibold mb-2">{member.title}</p>
                    <p className="text-sm text-muted-foreground mb-4">{member.credentials}</p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium">{member.experience} Experience</span>
                      </div>

                      <div className="space-y-1">
                        {member.specialties.map((specialty, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs border-primary/20 text-primary mr-1 mb-1"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
