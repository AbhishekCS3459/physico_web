"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Award, Calendar, CheckCircle, Clock, Heart, MapPin, Phone, Shield, Star, Users } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function PremiumHero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-card/50 to-primary/5">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container relative px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <motion.div
            className="space-y-8 z-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Badge
                  variant="secondary"
                  className="text-sm bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Serving Calgary & Surrounding Areas
                </Badge>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Physio Rehab
                </span>
                <br />
                <span className="text-foreground">at Home</span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-pretty max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Expert mobile physiotherapy, occupational therapy, and massage services.
                <span className="text-primary font-semibold"> Personalized care</span> delivered directly to your home
                in Calgary and surrounding areas.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                asChild
              >
                <Link href="/book">
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Physiotherapy
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transform hover:scale-105 transition-all duration-300 bg-transparent"
              >
                <Phone className="h-5 w-5 mr-2" />
                (587) 586-5566
              </Button>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 backdrop-blur-sm">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold text-sm">8 AM - 7 PM</div>
                  <div className="text-xs text-muted-foreground">7 Days a Week</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 backdrop-blur-sm">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold text-sm">Direct Billing</div>
                  <div className="text-xs text-muted-foreground">Most Insurers</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 backdrop-blur-sm">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold text-sm">Licensed</div>
                  <div className="text-xs text-muted-foreground">& Registered</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Main hero card with 3D effect */}
              <motion.div
                className="relative"
                style={{
                  transform: `perspective(1000px) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.01}deg) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.01}deg)`,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <Card className="p-8 bg-gradient-to-br from-card via-background to-primary/5 border-2 border-primary/10 shadow-2xl backdrop-blur-sm">
                  <div className="space-y-8">
                    {/* Center icon with pulse animation */}
                    <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
                      <motion.div
                        className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-6 shadow-lg"
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(5, 150, 105, 0.3)",
                            "0 0 40px rgba(5, 150, 105, 0.5)",
                            "0 0 20px rgba(5, 150, 105, 0.3)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Heart className="h-16 w-16 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Premium Home Care
                      </h3>
                      <p className="text-muted-foreground mt-2">Bringing expert rehabilitation to your doorstep</p>
                    </motion.div>

                    {/* Stats grid with hover animations */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { number: "4", label: "Service Types", icon: Users },
                        { number: "5", label: "Service Areas", icon: MapPin },
                        { number: "100+", label: "Happy Clients", icon: Star },
                        { number: "24/7", label: "Support", icon: CheckCircle },
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          className="p-4 bg-gradient-to-br from-background to-card rounded-xl border border-primary/10 text-center group cursor-pointer"
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 10px 25px rgba(5, 150, 105, 0.15)",
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <stat.icon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <div className="text-3xl font-bold text-primary group-hover:text-accent transition-colors">
                            {stat.number}
                          </div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Service highlights */}
                    <div className="space-y-3">
                      {[
                        "Physiotherapy & Rehabilitation",
                        "Occupational Therapy",
                        "Registered Massage Therapy",
                        "Acupuncture & Dry Needling",
                      ].map((service, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">{service}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-accent rounded-full shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary rounded-full shadow-lg"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
