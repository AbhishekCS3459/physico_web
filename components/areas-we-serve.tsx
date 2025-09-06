"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Clock, CheckCircle } from "lucide-react"

const serviceAreas = [
  {
    city: "Calgary",
    zones: ["NW", "NE", "SW", "SE", "Downtown"],
    therapists: 8,
    availability: "Same Day",
  },
  {
    city: "Airdrie",
    zones: ["All Areas"],
    therapists: 3,
    availability: "Next Day",
  },
  {
    city: "Okotoks",
    zones: ["All Areas"],
    therapists: 2,
    availability: "Next Day",
  },
  {
    city: "Cochrane",
    zones: ["All Areas"],
    therapists: 2,
    availability: "2-3 Days",
  },
  {
    city: "Crossfield",
    zones: ["All Areas"],
    therapists: 1,
    availability: "2-3 Days",
  },
]

export function AreasWeServe() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Service Coverage
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Areas We <span className="text-primary">Serve</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Professional mobile therapy services across Calgary and surrounding communities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Service Areas */}
          <div className="space-y-4">
            {serviceAreas.map((area, index) => (
              <Card key={index} className="group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {area.city}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {area.availability}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Zones: {area.zones.join(", ")}</p>
                      <p className="text-sm text-muted-foreground">
                        {area.therapists} therapist{area.therapists > 1 ? "s" : ""} available
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Postal Code Checker */}
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-center">Check Your Area</CardTitle>
              <p className="text-center text-muted-foreground text-sm">
                Enter your postal code to confirm service availability
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="T2A 1B2" className="text-center text-lg font-mono" maxLength={7} />
                <Button>Check</Button>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-green-700 dark:text-green-400">Great news!</p>
                <p className="text-sm text-green-600 dark:text-green-500">
                  We serve your area with same-day availability
                </p>
              </div>

              <Button className="w-full" size="lg">
                Book Your Session
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Can't find your area? Call us at (403) 555-0123
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
