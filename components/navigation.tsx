"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Calendar, LogIn, Menu, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const navigationItems = [
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Direct Billing", href: "/direct-billing" },
  { name: "Team", href: "/team" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 lg:h-18 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="Physio Rehab at Home">
          <div className="h-12 w-12 lg:h-14 lg:w-14 relative">
            <Image src="/MainLogo.png" alt="Physio Rehab at Home" fill className="object-contain" />
          </div>
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
          <Button variant="outline" size="sm" className="text-sm xl:text-base bg-transparent min-h-[44px] px-4 xl:px-6" asChild>
            <a href="tel:587-586-5566">
              <Phone className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
              <span className="hidden xl:inline">(587) 586-5566</span>
              <span className="xl:hidden">Call</span>
            </a>
          </Button>
          <Button size="sm" className="text-sm xl:text-base min-h-[44px] px-4 xl:px-6" asChild>
            <Link href="/book">
              <Calendar className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
              Book Physiotherapy
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-sm xl:text-base min-h-[44px] px-3" asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4 xl:h-5 xl:w-5 mr-1" />
              <span className="hidden xl:inline">Admin</span>
            </Link>
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
                <Button variant="outline" className="w-full justify-start bg-transparent min-h-[52px] text-base" asChild>
                  <a href="tel:587-586-5566">
                    <Phone className="h-5 w-5 mr-3" />
                    (587) 586-5566
                  </a>
                </Button>
                <Button className="w-full justify-start min-h-[52px] text-base" asChild>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Persistent CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-3 sm:p-4 safe-area-pb">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button variant="outline" size="lg" className="flex-1 bg-transparent min-h-[52px] text-base font-medium" asChild>
            <a href="tel:587-586-5566">
              <Phone className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Call Now</span>
              <span className="sm:hidden">Call</span>
            </a>
          </Button>
          <Button size="lg" className="flex-1 min-h-[52px] text-base font-medium" asChild>
            <Link href="/book">
              <Calendar className="h-5 w-5 mr-2" />
              Book Physiotherapy
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
