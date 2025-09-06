"use client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Clock, MapPin, Menu, Phone } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Team", href: "/team" },
  { name: "Contact", href: "/contact" },
]

export function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex h-14 sm:h-16 lg:h-18 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 min-w-0">
            <div className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-lg sm:text-xl lg:text-2xl text-foreground truncate">
              <span className="hidden xs:inline">Physio Rehab at Home</span>
              <span className="xs:hidden">Physio Rehab</span>
            </span>
          </Link>

          {/* Desktop Navigation - Enhanced for larger screens */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 2xl:space-x-10">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm xl:text-base font-medium transition-colors hover:text-primary py-2 px-1 relative group",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
            <Button size="sm" className="ml-4 px-4 xl:px-6 py-2 text-sm xl:text-base">
              Book Now
            </Button>
          </nav>

          {/* Tablet Navigation - Enhanced responsive behavior */}
          <div className="hidden md:flex lg:hidden items-center space-x-3 xl:space-x-4">
            <Button size="sm" variant="outline" className="text-sm">
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
            <Button size="sm" className="text-sm">Book</Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="p-2 h-9 w-9 sm:h-10 sm:w-10">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-80">
              <div className="flex flex-col space-y-6 mt-6">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-serif font-bold text-xl">Physio Rehab</span>
                </Link>

                <nav className="flex flex-col space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary py-3 px-2 rounded-lg hover:bg-primary/5",
                        pathname === item.href ? "text-primary bg-primary/10" : "text-foreground",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="space-y-3">
                  <Button className="w-full py-3 text-base">Book Now</Button>
                  <Button variant="outline" className="w-full py-3 text-base bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    Call (587) 586-5566
                  </Button>
                </div>

                <div className="border-t pt-6 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Calgary & Area</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>24/7 Available</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
