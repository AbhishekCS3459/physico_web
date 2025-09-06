import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BookingForm } from "@/components/booking-form"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-16">
        <div className="container px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Calendar className="h-4 w-4 mr-1" />
              Book Your Appointment
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Schedule Your <span className="text-primary">Home Visit</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Book your personalized therapy session. We'll come to you with all the equipment needed for your
              treatment.
            </p>
          </div>

          <BookingForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
