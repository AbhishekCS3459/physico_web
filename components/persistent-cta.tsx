"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Phone } from "lucide-react"

export function PersistentCTA() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t p-3 sm:p-4 safe-area-pb">
      <div className="flex gap-3 max-w-md mx-auto">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 bg-transparent min-h-[52px] text-base font-medium"
          asChild
        >
          <a href="tel:587-586-5566">
            <Phone className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Call (587) 586-5566</span>
            <span className="sm:hidden">Call</span>
          </a>
        </Button>
        <Button size="lg" className="flex-1 min-h-[52px] text-base font-medium" asChild>
          <a href="/book">
            <Calendar className="h-5 w-5 mr-2" />
            Book Now
          </a>
        </Button>
      </div>
    </div>
  )
}
