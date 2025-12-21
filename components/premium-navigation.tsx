"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Activity,
  Brain,
  Calendar,
  ChevronDown,
  Clock,
  DollarSign,
  Heart,
  LogIn,
  PackageIcon as MassageIcon,
  Menu,
  Phone,
  Shield,
  Users,
  Zap
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useEffect, useState } from "react"

const navigationItems = [
  {
    name: "Services",
    href: "/services",
    submenu: [
      { name: "Physiotherapy", href: "/services/physiotherapy", icon: Activity },
      { name: "Occupational Therapy", href: "/services/occupational", icon: Brain },
      { name: "Massage Therapy", href: "/services/massage", icon: MassageIcon },
      { name: "Acupuncture & Dry Needling", href: "/services/acupuncture", icon: Zap },
    ],
  },
  { name: "Pricing", href: "/pricing", icon: DollarSign },
  { name: "Direct Billing", href: "/direct-billing", icon: Shield },
  { name: "Team", href: "/team", icon: Users },
]

export function PremiumNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-primary/10 shadow-lg shadow-primary/5"
            : "bg-background/80 backdrop-blur-sm border-b border-border/50"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container flex h-16 lg:h-20 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              className={`h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg transition-all duration-300 ${
                isScrolled ? "shadow-primary/20" : "shadow-primary/10"
              } group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/30`}
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Heart className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-lg lg:text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <span className="hidden sm:inline">Physio Rehab at Home</span>
                <span className="sm:hidden">Physio Rehab</span>
              </span>
              <span className="text-xs text-muted-foreground hidden lg:block">Mobile Healthcare Excellence</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navigationItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.submenu && setActiveSubmenu(item.name)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-2 text-sm xl:text-base font-medium transition-all duration-300 hover:text-primary py-3 px-4 rounded-lg hover:bg-primary/5 group"
                >
                  {item.icon && <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                  {item.name}
                  {item.submenu && <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />}
                </Link>

                {/* Submenu */}
                <AnimatePresence>
                  {item.submenu && activeSubmenu === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-primary/10 rounded-xl shadow-2xl shadow-primary/10 p-2"
                    >
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                            <subItem.icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{subItem.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
              <Clock className="h-4 w-4 text-primary" />
              <span className="hidden xl:inline">8 AM - 7 PM Daily</span>
              <span className="xl:hidden">Open Now</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-sm xl:text-base bg-transparent border-primary/20 hover:border-primary hover:bg-primary/5 min-h-[44px] px-4 xl:px-6 transition-all duration-300"
              asChild
            >
              <a href="tel:587-586-5566">
                <Phone className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
                <span className="hidden xl:inline">(587) 586-5566</span>
                <span className="xl:hidden">Call</span>
              </a>
            </Button>
            <Button
              size="sm"
              className="text-sm xl:text-base min-h-[44px] px-4 xl:px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link href="/book">
                <Calendar className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
                Book Physiotherapy
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-sm xl:text-base min-h-[44px] px-3 transition-all duration-300"
              asChild
            >
              <Link href="/login">
                <LogIn className="h-4 w-4 xl:h-5 xl:w-5 mr-1" />
                <span className="hidden xl:inline">Admin</span>
              </Link>
            </Button>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] min-w-[44px] p-2 hover:bg-primary/5 transition-colors"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 sm:w-96 bg-background/95 backdrop-blur-xl border-l border-primary/10"
            >
              <div className="flex flex-col space-y-6 mt-8">
                {/* Mobile logo */}
                <div className="flex items-center gap-3 pb-6 border-b border-primary/10">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Physio Rehab at Home</div>
                    <div className="text-sm text-muted-foreground">Mobile Healthcare</div>
                  </div>
                </div>

                {/* Mobile navigation items */}
                {navigationItems.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 text-lg font-medium transition-colors hover:text-primary py-3 px-2 min-h-[44px] rounded-lg hover:bg-primary/5"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      {item.name}
                    </Link>
                    {/* Mobile submenu */}
                    {item.submenu && (
                      <div className="ml-8 space-y-2 mt-2">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-center gap-2 text-base text-muted-foreground hover:text-primary py-2 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Mobile CTAs */}
                <div className="pt-6 space-y-4 border-t border-primary/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Open Daily: 8 AM - 7 PM</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-primary/20 hover:bg-primary/5 min-h-[52px] text-base"
                    asChild
                  >
                    <a href="tel:587-586-5566">
                      <Phone className="h-5 w-5 mr-3" />
                      (587) 586-5566
                    </a>
                  </Button>
                  <Button className="w-full justify-start min-h-[52px] text-base bg-gradient-to-r from-primary to-accent" asChild>
                    <Link href="/book" onClick={() => setIsOpen(false)}>
                      <Calendar className="h-5 w-5 mr-3" />
                      Book Physiotherapy
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start min-h-[52px] text-base" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <LogIn className="h-5 w-5 mr-3" />
                      Admin Login
                    </Link>
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="pt-4 space-y-3 border-t border-primary/10">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Licensed & Insured</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-primary" />
                    <span>Direct Billing Available</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <motion.div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-primary/10 p-3 sm:p-4 shadow-2xl shadow-primary/5"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 bg-transparent border-primary/20 hover:bg-primary/5 min-h-[52px] text-base font-medium transition-all duration-300"
              asChild
            >
              <a href="tel:587-586-5566">
                <Phone className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Call Now</span>
                <span className="sm:hidden">Call</span>
              </a>
            </Button>
            <Button
              size="lg"
              className="flex-1 min-h-[52px] text-base font-medium bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link href="/book">
                <Calendar className="h-5 w-5 mr-2" />
                Book Physiotherapy
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.header>

      <motion.div
        className="fixed top-1/2 right-4 z-40 hidden xl:block"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-full shadow-2xl shadow-primary/20">
          <Badge variant="secondary" className="bg-white/90 text-primary border-0 font-semibold">
            <Shield className="h-3 w-3 mr-1" />
            Licensed
          </Badge>
        </div>
      </motion.div>
    </>
  )
}
