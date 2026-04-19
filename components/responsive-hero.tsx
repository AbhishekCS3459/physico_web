"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Phone, ShieldCheck, Sparkles } from "lucide-react"
import { motion, useScroll, useTransform } from "motion/react"
import Link from "next/link"
import { useRef } from "react"

export default function ResponsiveHero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"])
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"])

  const backgroundImages = [
    "/hero-clinic.png",
    "/professional-physiotherapy-home-visit.jpg",
    "/professional-physiotherapist-working-with-elderly-.jpg",
  ]

  const trustPoints = [
    "Licensed physiotherapists",
    "Direct billing support",
    "In-home appointments across Calgary",
  ]

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden min-h-[86vh] md:min-h-[92vh] flex items-center bg-background"
    >
      <div className="absolute inset-0">
        {backgroundImages.map((imageSrc, index) => (
          <motion.img
            key={imageSrc}
            src={imageSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ y: bgY }}
            initial={{ opacity: index === 0 ? 1 : 0, scale: 1.02 }}
            animate={{ opacity: [0, 0, 1, 1, 0], scale: [1.02, 1, 1, 1.03, 1.02] }}
            transition={{
              duration: 18,
              times: [0, 0.15, 0.35, 0.7, 1],
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 6,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-background/82 via-background/62 to-background/20 dark:from-background/84 dark:via-background/68 dark:to-background/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/12 to-transparent dark:from-background/74 dark:via-background/20 dark:to-transparent" />
      </div>

      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: glowY }}>
        <div className="absolute -top-24 left-[20%] h-64 w-64 rounded-full bg-primary/15 blur-3xl dark:bg-primary/10" />
        <div className="absolute bottom-0 right-[15%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-400/10" />
      </motion.div>

      <motion.div
        className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28"
        style={{ y: contentY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl xl:max-w-4xl"
        >
          <Badge className="mb-5 border-primary/30 bg-primary/10 text-primary hover:bg-primary/15">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Calgary home physiotherapy and rehab care
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-foreground leading-[1.03]">
            Personalized recovery
            <br className="hidden sm:block" /> where you feel best
          </h1>
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            From post-surgery rehabilitation to ongoing pain management, our clinicians bring structured, evidence-based
            care to your home so progress stays consistent and convenient.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button size="lg" className="h-12 px-6 shadow-lg shadow-primary/20 text-base" asChild>
              <Link href="/book">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Book your first visit
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
            {trustPoints.map((point) => (
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
        </motion.div>
      </motion.div>
    </section>
  )
}
