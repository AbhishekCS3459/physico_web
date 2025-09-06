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
        "Chronic back pain kept me from enjoying time with my grandchildren. The massage therapy and acupuncture treatments have given me my life back.",
      author: "Maria Rodriguez, 65",
      location: "Okotoks, AB",
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
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Patient Success Stories
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real experiences from our patients across Calgary and surrounding areas
          </p>
        </div>

        <div className="relative overflow-hidden w-full">
          <Carousel slides={testimonialData} />
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Happy Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400">98%</div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Availability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400">5</div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Service Areas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
