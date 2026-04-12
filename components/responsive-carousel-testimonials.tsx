"use client"
import Carousel from "@/components/ui/carousel"

export default function ResponsiveCarouselTestimonials() {
  const testimonialData = [
    {
      title: "Life-Changing Recovery",
      button: "Read Full Story",
      src: "/elderly-woman-smiling.png",
      content:
        "After my hip replacement, the home physiotherapy sessions were exactly what I needed. Sarah came to my house twice a week and helped me regain my mobility safely.",
      author: "Margaret Thompson, 72",
      location: "Calgary, AB",
    },
    {
      title: "Back to Sports",
      button: "Read Full Story",
      src: "/young-father-athletic.jpg",
      content:
        "The occupational therapy for my shoulder injury was incredible. I'm back to playing hockey with my kids thanks to the personalized treatment plan.",
      author: "David Chen, 38",
      location: "Airdrie, AB",
    },
    {
      title: "Pain-Free Living",
      button: "Read Full Story",
      src: "/hispanic-elderly-woman.jpg",
      content:
        "Chronic back pain kept me from enjoying time with my grandchildren. The massage therapy and physiotherapy have given me my life back.",
      author: "Maria Rodriguez, 65",
      location: "Chestermere, AB",
    },
    {
      title: "Professional Excellence",
      button: "Read Full Story",
      src: "/middle-aged-asian-man.png",
      content:
        "As a busy executive, having physiotherapy at home was perfect. The therapists were professional, punctual, and my insurance covered everything.",
      author: "James Park, 45",
      location: "Cochrane, AB",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Patient Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from our patients across Calgary and surrounding areas
          </p>
        </div>

        <div className="relative overflow-hidden w-full">
          <Carousel slides={testimonialData} />
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Happy Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Availability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Service Areas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
