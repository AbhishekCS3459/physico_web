"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, CheckCircle } from "lucide-react"

const serviceAreas = [
  { city: "Calgary", zones: ["NW", "NE", "SW", "SE", "Downtown"], therapists: 8 },
  { city: "Airdrie", zones: ["All Areas"], therapists: 3 },
  { city: "Cochrane", zones: ["All Areas"], therapists: 2 },
  { city: "Crossfield", zones: ["All Areas"], therapists: 1 },
]

export function AreasWeServe() {
  return (
    <section className="py-16 md:py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Service Coverage
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Areas We <span className="text-primary">Serve</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Professional mobile therapy services across Calgary and surrounding communities. A travel fee may apply for locations outside the Calgary area.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          {serviceAreas.map((area, index) => (
            <Card key={index} className="group hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {area.city}
                </CardTitle>
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
      </div>
    </section>
  )
}
