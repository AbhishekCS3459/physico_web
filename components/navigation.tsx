"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Phone, Calendar } from "lucide-react"

const navigationItems = [
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Direct Billing", href: "/direct-billing" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Areas We Serve", href: "/areas" },
  { name: "Team", href: "/team" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 lg:h-18 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm lg:text-base">PR</span>
          </div>
          <span className="font-bold text-base sm:text-lg lg:text-xl">
            <span className="hidden sm:inline">Physio Rehab at Home</span>
            <span className="sm:hidden">Physio Rehab</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm xl:text-base font-medium transition-colors hover:text-primary py-2 px-1"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center space-x-3">
          <Button variant="outline" size="sm" className="text-sm xl:text-base bg-transparent min-h-[44px] px-4 xl:px-6">
            <Phone className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
            <span className="hidden xl:inline">(587) 586-5566</span>
            <span className="xl:hidden">Call</span>
          </Button>
          <Button size="sm" className="text-sm xl:text-base min-h-[44px] px-4 xl:px-6">
            <Calendar className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
            Book Now
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] p-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 sm:w-96">
            <div className="flex flex-col space-y-6 mt-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-lg sm:text-xl font-medium transition-colors hover:text-primary py-3 px-2 min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-6 space-y-4">
                <Button variant="outline" className="w-full justify-start bg-transparent min-h-[52px] text-base">
                  <Phone className="h-5 w-5 mr-3" />
                  (587) 586-5566
                </Button>
                <Button className="w-full justify-start min-h-[52px] text-base">
                  <Calendar className="h-5 w-5 mr-3" />
                  Book Now
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Persistent CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-3 sm:p-4 safe-area-pb">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button variant="outline" size="lg" className="flex-1 bg-transparent min-h-[52px] text-base font-medium">
            <Phone className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Call Now</span>
            <span className="sm:hidden">Call</span>
          </Button>
          <Button size="lg" className="flex-1 min-h-[52px] text-base font-medium">
            <Calendar className="h-5 w-5 mr-2" />
            Book Now
          </Button>
        </div>
      </div>
    </header>
  )
}
