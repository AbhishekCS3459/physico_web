import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Mail, MapPin, Clock, Shield } from "lucide-react"

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

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PR</span>
              </div>
              <span className="font-bold text-lg">Physio Rehab at Home</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional mobile rehabilitation services bringing expert care to your home across Calgary and
              surrounding areas.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              Licensed & Insured
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>(403) 555-0123</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@physiorehabhome.ca</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Serving Calgary & Area</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>7 Days a Week, 8 AM - 8 PM</span>
              </div>
            </div>
          </div>

          {/* Service Areas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Service Areas</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {serviceAreas.map((area) => (
                <Link key={area} href={`/areas/${area.toLowerCase()}`} className="hover:text-primary transition-colors">
                  {area}
                </Link>
              ))}
            </div>
            <div className="pt-2">
              <Input placeholder="Enter your postal code" className="mb-2" />
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Check Coverage
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/services" className="block hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="/pricing" className="block hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/direct-billing" className="block hover:text-primary transition-colors">
                Direct Billing
              </Link>
              <Link href="/team" className="block hover:text-primary transition-colors">
                Our Team
              </Link>
              <Link href="/faq" className="block hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link href="/privacy" className="block hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cancellation" className="block hover:text-primary transition-colors">
                Cancellation Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Insurers */}
        <div className="border-t mt-8 pt-8">
          <h4 className="font-semibold mb-4 text-center">We Direct Bill These Insurers</h4>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            {insurers.map((insurer) => (
              <span key={insurer} className="px-3 py-1 bg-background rounded-full border">
                {insurer}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Physio Rehab at Home. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
