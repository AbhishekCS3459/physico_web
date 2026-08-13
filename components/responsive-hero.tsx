"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Phone, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

const slides = [
  {
    badge: "Calgary home physiotherapy and rehab care",
    title: "Personalized recovery where you feel best",
    description:
      "From post-surgery rehabilitation to ongoing pain management, our clinicians bring structured, evidence-based care to your home so progress stays consistent and convenient.",
    image: "/hero/stretching.jpg",
    imageAlt: "Guided mobility and stretching session",
    cta: "Book your first visit",
    points: ["Licensed physiotherapists", "Direct billing support", "In-home appointments across Calgary"],
  },
  {
    badge: "In-home visits · Calgary & nearby",
    title: "Expert care without the clinic wait",
    description:
      "We come to you with everything needed for assessment and treatment — at home, work, or a care facility. Same-week visits when available.",
    image: "/hero/home-rehab.jpg",
    imageAlt: "Therapist guiding a rehabilitation exercise",
    cta: "Schedule a home visit",
    points: ["One-on-one sessions", "No travel for you", "Evening appointments on request"],
  },
  {
    badge: "Trusted clinicians",
    title: "Care that feels personal and professional",
    description:
      "Work with licensed therapists who listen first, then build a plan around your goals, your home, and your daily routine.",
    image: "/hero/clinician.jpg",
    imageAlt: "Smiling licensed healthcare clinician",
    cta: "Meet our approach",
    href: "/team",
    points: ["Evidence-based treatment", "Seniors welcome", "Family-friendly visits"],
  },
  {
    badge: "Post-surgery · injury · chronic pain",
    title: "Guided progress, session after session",
    description:
      "Structured plans for recovery after surgery, sports injury, or ongoing pain — so you stay consistent, confident, and moving better at home.",
    image: "/hero/mobility-care.jpg",
    imageAlt: "Active recovery and core strengthening",
    cta: "Start your recovery",
    points: ["Custom exercise plans", "Pain management", "Calgary & nearby areas"],
  },
]

export default function ResponsiveHero() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api || isPaused) return
    const timer = window.setInterval(() => api.scrollNext(), 7000)
    return () => window.clearInterval(timer)
  }, [api, isPaused])

  const goTo = useCallback((index: number) => api?.scrollTo(index), [api])

  return (
    <section
      className="relative isolate overflow-hidden min-h-[86vh] md:min-h-[92vh] flex items-center bg-background"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Carousel setApi={setApi} opts={{ loop: true, align: "start" }} className="w-full">
        <CarouselContent className="ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.title} className="pl-0 basis-full">
              <div className="relative min-h-[86vh] md:min-h-[92vh] flex items-center">
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/55 to-background/20 dark:from-background/86 dark:via-background/62 dark:to-background/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-background/10" />
                </div>

                <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
                  <div className="max-w-3xl xl:max-w-4xl">
                    <Badge className="mb-5 border-primary/30 bg-primary/10 text-primary hover:bg-primary/15">
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      {slide.badge}
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-foreground leading-[1.03]">
                      {slide.title}
                    </h1>
                    <p className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                      {slide.description}
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button size="lg" className="h-12 px-6 shadow-lg shadow-primary/20 text-base" asChild>
                        <Link href={slide.href ?? "/book"}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {slide.cta}
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-12 px-6 bg-background/70 backdrop-blur border-border/70 text-base hover:bg-background/85"
                        asChild
                      >
                        <a href="tel:587-586-5566">
                          <Phone className="h-4 w-4 mr-2" />
                          Call (587) 586-5566
                        </a>
                      </Button>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {slide.points.map((point) => (
                        <div
                          key={point}
                          className="rounded-xl border border-border/70 bg-background/60 backdrop-blur px-3 py-2.5 text-sm text-foreground/90 flex items-center gap-2"
                        >
                          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                          {point}
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/services"
                      className="mt-7 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Explore our services
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute inset-x-0 bottom-6 sm:bottom-10 z-20 flex items-center justify-center gap-3 px-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full bg-background/85 backdrop-blur border-border/70 shadow-md hover:bg-background"
            onClick={() => api?.scrollPrev()}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 rounded-full bg-background/85 backdrop-blur px-3 py-2 border border-border/60 shadow-md">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => goTo(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  current === index ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/35 hover:bg-muted-foreground/60"
                )}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full bg-background/85 backdrop-blur border-border/70 shadow-md hover:bg-background"
            onClick={() => api?.scrollNext()}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </Carousel>
    </section>
  )
}
