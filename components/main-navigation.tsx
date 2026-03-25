"use client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { Clock, LogIn, MapPin, Menu, Phone, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Team", href: "/team" },
  { name: "Contact", href: "/contact" },
]

export function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    fetch("/api/auth/user/me")
      .then((res) => res.json())
      .then((data) => {
        setIsUserLoggedIn(data.authenticated || false)
      })
      .catch(() => {
        setIsUserLoggedIn(false)
      })
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex h-14 sm:h-16 lg:h-18 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" aria-label="Physio Rehab at Home">
            <div className="h-11 w-11 sm:h-12 sm:w-12 lg:h-12 lg:w-12 rounded-xl overflow-hidden border border-border/50 bg-card shrink-0 relative flex items-center justify-center">
              <Image
                src="/logo-nav.jpeg"
                alt=""
                fill
                className="object-contain"
                sizes="(max-width: 640px) 40px, (max-width: 1024px) 44px, 48px"
              />
            </div>
          </Link>

          {/* Desktop Navigation - Enhanced for larger screens */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 2xl:space-x-10">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm xl:text-base font-medium transition-all duration-300 hover:text-primary py-2 px-1 relative group",
                  pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300",
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
            <Button 
              size="sm" 
              className="ml-4 px-4 xl:px-6 py-2 text-sm xl:text-base bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105" 
              asChild
            >
              <Link href="/book">
                Book Physiotherapy
              </Link>
            </Button>
            {isUserLoggedIn && (
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-2 px-3 py-2 text-sm xl:text-base border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105" 
                asChild
              >
                <Link href="/my-bookings">
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden xl:inline">My Bookings</span>
                  <span className="xl:hidden">Bookings</span>
                </Link>
              </Button>
            )}
            <Button size="sm" variant="ghost" className="ml-2 px-3 py-2 text-sm xl:text-base" asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-1" />
                <span className="hidden xl:inline">Admin</span>
              </Link>
            </Button>
            <ThemeToggle />
          </nav>

          {/* Tablet Navigation - Enhanced responsive behavior */}
          <div className="hidden md:flex lg:hidden items-center space-x-3 xl:space-x-4">
            <Button size="sm" variant="outline" className="text-sm" asChild>
              <a href="tel:587-586-5566">
                <Phone className="h-4 w-4 mr-1" />
                Call
              </a>
            </Button>
            <Button size="sm" className="text-sm" asChild>
              <Link href="/book">
                Book Physiotherapy
              </Link>
            </Button>
            {isUserLoggedIn && (
              <Button size="sm" variant="outline" className="text-sm" asChild>
                <Link href="/my-bookings">
                  <User className="h-4 w-4 mr-1" />
                  Bookings
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger side by side to avoid overlap */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 h-9 w-9 sm:h-10 sm:w-10">
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-80">
              <div className="flex flex-col space-y-6 mt-6">
                <Link href="/" className="flex items-center" aria-label="Physio Rehab at Home">
                  <div className="h-16 w-16 rounded-xl overflow-hidden border border-border/50 bg-card relative">
                    <Image
                      src="/logo-nav.jpeg"
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>
                </Link>

                <nav className="flex flex-col space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-all duration-300 hover:text-primary py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 relative group",
                        pathname === item.href ? "text-primary bg-gradient-to-r from-primary/10 to-accent/10" : "text-foreground",
                      )}
                    >
                      {item.name}
                      <span className={cn(
                        "absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-accent rounded-r-full transition-all duration-300",
                        pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )} />
                    </Link>
                  ))}
                </nav>

                <div className="space-y-3">
                  <Button className="w-full py-3 text-base bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105" asChild>
                    <Link href="/book" onClick={() => setIsOpen(false)}>
                      Book Physiotherapy
                    </Link>
                  </Button>
                  {isUserLoggedIn && (
                    <Button variant="outline" className="w-full py-3 text-base bg-transparent border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105" asChild>
                      <Link href="/my-bookings" onClick={() => setIsOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        My Bookings
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full py-3 text-base bg-transparent border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105" asChild>
                    <a href="tel:587-586-5566">
                      <Phone className="h-4 w-4 mr-2" />
                      Call (587) 586-5566
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full py-3 text-base hover:bg-primary/5 transition-all duration-300" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Admin Login
                    </Link>
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
      </div>
    </header>
  )
}
