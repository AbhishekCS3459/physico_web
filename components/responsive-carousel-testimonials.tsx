"use client"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { motion } from "motion/react"

export default function ResponsiveCarouselTestimonials() {
  const testimonialData = [
    {
      title: "Mobility Restored After Surgery",
      src: "/elderly-woman-smiling.png",
      content:
        "After my hip replacement, home physiotherapy helped me rebuild strength safely. Every session was personalized and I could recover in comfort at home.",
      author: "Margaret Thompson, 72",
      location: "Calgary, AB",
    },
    {
      title: "Back to Active Living",
      src: "/young-father-athletic.jpg",
      content:
        "The care plan for my shoulder injury was excellent. I am back to playing sports with my kids and pain no longer controls my routine.",
      author: "David Chen, 38",
      location: "Airdrie, AB",
    },
    {
      title: "Confident Recovery Journey",
      src: "/hispanic-elderly-woman.jpg",
      content:
        "The therapists explained each step and adjusted treatment weekly. I felt supported, informed, and saw measurable progress every month.",
      author: "Maria Rodriguez, 65",
      location: "Chestermere, AB",
    },
    {
      title: "Convenience With Clinical Quality",
      src: "/middle-aged-asian-man.png",
      content:
        "As a busy professional, at-home appointments made recovery practical. Sessions were punctual, professional, and easy to schedule around work.",
      author: "James Park, 45",
      location: "Cochrane, AB",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            Outcomes That Matter
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Patient Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from our patients across Calgary and surrounding areas
          </p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          className="mx-auto w-full max-w-6xl pb-12"
        >
          <CarouselContent>
            {testimonialData.map((item, index) => (
              <CarouselItem key={index} className="md:basis-1/2 xl:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <Card className="h-full overflow-hidden border border-border/70 bg-card/90 backdrop-blur-sm shadow-md">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <Badge className="absolute left-4 top-4 bg-primary/90 text-primary-foreground">
                        Recovery Story
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-3 flex items-center gap-1">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star key={starIndex} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.content}</p>
                      <div className="border-t border-border/60 pt-4">
                        <p className="font-medium text-foreground">{item.author}</p>
                        <p className="text-sm text-muted-foreground">{item.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 top-auto bottom-0 translate-y-0 md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:-left-3 bg-background/90 border-border hover:bg-background" />
          <CarouselNext className="left-14 top-auto bottom-0 translate-y-0 md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:-right-3 md:left-auto bg-background/90 border-border hover:bg-background" />
        </Carousel>

        <div className="mt-10 sm:mt-12 text-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Happy Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Availability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Service Areas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
