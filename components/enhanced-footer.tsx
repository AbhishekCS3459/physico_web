"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Facebook,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
} from "lucide-react"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const insurers = [
  "Alberta Health",
  "Blue Cross",
  "Manulife",
  "Sun Life",
  "Great West Life",
  "Desjardins",
  "Industrial Alliance",
  "SSQ Insurance",
  "Chambers of Commerce",
]

const serviceAreas = ["Calgary", "Airdrie", "Okotoks", "Cochrane", "Crossfield", "Chestermere"]

const quickLinks = [
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Direct Billing", href: "/direct-billing" },
  { name: "Our Team", href: "/team" },
  { name: "FAQ", href: "/faq" },
  { name: "Privacy Policy", href: "/privacy" },
]

export function EnhancedFooter() {
  const [postalCode, setPostalCode] = useState("")
  const [coverageResult, setCoverageResult] = useState("")

  const checkCoverage = () => {
    if (postalCode.length >= 3) {
      const firstChar = postalCode.charAt(0).toUpperCase()
      if (["T"].includes(firstChar)) {
        setCoverageResult("✅ We serve your area!")
      } else {
        setCoverageResult("📞 Call us to check coverage")
      }
    }
  }

  return (
    <footer className="flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 border-t border-border/60 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden w-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12 lg:mb-16">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-xl overflow-hidden relative shrink-0 shadow-lg">
                <Image src="/MainLogo.png" alt="Physio Rehab at Home" fill className="object-contain" />
              </div>
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Physio Rehab at Home
                </span>
                <div className="text-sm text-muted-foreground">Mobile Healthcare Excellence</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional mobile rehabilitation services bringing expert physiotherapy, occupational therapy, and
              massage therapy to your home across Calgary and surrounding areas.
            </p>

            {/* Trust badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-primary" />
                <span className="font-medium">Registered Professionals</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-medium">5-Star Rated Service</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="bg-transparent border-primary/20 hover:bg-primary/5">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-transparent border-primary/20 hover:bg-primary/5">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-transparent border-primary/20 hover:bg-primary/5">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contact Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-primary/5 transition-colors">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">(587) 586-5566</div>
                  <div className="text-sm text-muted-foreground">Call or Text</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-primary/5 transition-colors">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold">info@physiorehabhome.ca</div>
                  <div className="text-sm text-muted-foreground">Email Us</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-primary/5 transition-colors">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold">8:00 AM - 7:00 PM</div>
                  <div className="text-sm text-muted-foreground">7 Days a Week</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Service Areas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-3">
              {serviceAreas.map((area, index) => (
                <motion.div
                  key={area}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/areas/${area.toLowerCase()}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors group"
                  >
                    <CheckCircle className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{area}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Coverage checker */}
            <div className="pt-4 border-t border-primary/10">
              <h4 className="font-semibold mb-3">Check Coverage</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Enter postal code (e.g., T2P 1J9)"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="uppercase"
                />
                <Button
                  onClick={checkCoverage}
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent border-primary/20 hover:bg-primary/5"
                >
                  Check Coverage
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                {coverageResult && (
                  <div className="p-2 bg-primary/5 rounded-lg text-sm font-medium text-center">{coverageResult}</div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="font-bold text-lg">Quick Links</h3>
            <div className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="block text-sm hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-primary/5 group"
                  >
                    <span className="flex items-center justify-between">
                      {link.name}
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Emergency notice */}
            <div className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-primary/20">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Emergency Care
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For medical emergencies, call 911. Our services are for rehabilitation and wellness care.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="border-t border-primary/10 pt-12 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h4 className="font-bold text-xl mb-2 flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Direct Billing Partners
            </h4>
            <p className="text-muted-foreground">We work with most major insurance providers</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4">
            {insurers.map((insurer, index) => (
              <motion.div
                key={insurer}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge
                  variant="outline"
                  className="px-4 py-2 bg-background/50 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer"
                >
                  {insurer}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="border-t border-primary/10 pt-6 sm:pt-8 lg:pt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground">&copy; 2024 Physio Rehab. All rights reserved.</p>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link href="/accessibility" className="hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
