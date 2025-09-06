"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Margaret Thompson",
    age: "72",
    location: "Calgary SW",
    service: "Physiotherapy",
    rating: 5,
    quote:
      "After my hip replacement, Sarah came to my home twice a week. The convenience was incredible, and I recovered much faster than expected. Highly recommend!",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Robert Chen",
    age: "45",
    location: "Airdrie",
    service: "Occupational Therapy",
    rating: 5,
    quote:
      "The OT assessment helped make my home safer after my stroke. The therapist was professional and made practical recommendations that really work.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Linda Rodriguez",
    age: "68",
    location: "Calgary NE",
    service: "Massage Therapy",
    rating: 5,
    quote:
      "Weekly massage therapy at home has been a game-changer for my arthritis pain. The therapist is knowledgeable and the direct billing is so convenient.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Client Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            What Our <span className="text-primary">Clients</span> Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Real experiences from Calgary families who've benefited from our mobile therapy services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-primary/20 mr-2" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                <blockquote className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.quote}"</blockquote>

                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {testimonial.name}, {testimonial.age}
                    </div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {testimonial.service}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
