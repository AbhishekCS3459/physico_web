"use client"
import {
  IconBrain,
  IconClock,
  IconCurrencyDollar,
  IconHeart,
  IconMapPin,
  IconShield,
  IconSparkles,
  IconStethoscope,
} from "@tabler/icons-react"
import { motion } from "motion/react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ResponsiveServices() {
  const [activeService, setActiveService] = useState(0)

  const services = [
    {
      icon: <IconStethoscope className="h-8 w-8" />,
      title: "Physiotherapy",
      description: "Comprehensive rehabilitation for injuries, post-surgery recovery, and chronic conditions",
      price: "$140",
      duration: "60 mins initial / 45 mins follow-up",
      features: [
        "Manual therapy techniques",
        "Exercise prescription",
        "Pain management",
        "Mobility restoration",
        "Injury prevention education",
      ],
    },
    {
      icon: <IconBrain className="h-8 w-8" />,
      title: "Occupational Therapy",
      description: "Helping you regain independence in daily activities and work-related tasks",
      price: "$130-150",
      duration: "60 minutes",
      features: [
        "Activities of daily living training",
        "Cognitive rehabilitation",
        "Home safety assessments",
        "Adaptive equipment training",
        "Work conditioning programs",
      ],
    },
    {
      icon: <IconHeart className="h-8 w-8" />,
      title: "Massage Therapy",
      description: "Therapeutic massage for pain relief, stress reduction, and improved circulation",
      comingSoon: true,
      price: "—",
      duration: "—",
      features: [],
    },
  ]

  const benefits = [
    {
      icon: <IconMapPin className="h-6 w-6" />,
      title: "Home Convenience",
      description: "No travel required - we come to you",
    },
    {
      icon: <IconShield className="h-6 w-6" />,
      title: "Direct Billing",
      description: "We handle insurance claims directly",
    },
    {
      icon: <IconClock className="h-6 w-6" />,
      title: "Flexible Scheduling",
      description: "Evening and weekend appointments available",
    },
    {
      icon: <IconCurrencyDollar className="h-6 w-6" />,
      title: "Transparent Pricing",
      description: "No hidden fees or surprise charges",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 sm:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-sm font-medium text-primary mb-4 uppercase tracking-wider"
          >
            What we offer
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight"
          >
            Comprehensive Care <span className="text-primary">Services</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Professional healthcare delivered in the comfort of your home across Calgary and surrounding areas.
          </motion.p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-10 sm:mb-14 lg:mb-16">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveService(index)}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                activeService === index
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
              }`}
              onClick={() => setActiveService(index)}
            >
              <div
                className={`inline-flex p-3.5 rounded-xl mb-5 transition-colors ${
                  activeService === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {service.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-5 line-clamp-3 leading-relaxed">{service.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-primary">{service.price}</span>
                <span className="text-muted-foreground">{service.duration}</span>
              </div>
            </motion.div>
          ))}
          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="relative p-6 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/40 flex flex-col items-center justify-center min-h-[236px] text-center"
          >
            <div className="inline-flex p-3.5 rounded-xl bg-muted text-muted-foreground mb-4">
              <IconSparkles className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">More services</h3>
            <p className="text-muted-foreground text-sm font-medium">Coming soon</p>
          </motion.div>
        </div>

        {/* Active Service Details */}
        <motion.div
          key={activeService}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 mb-10 sm:mb-14 lg:mb-16 shadow-sm"
        >
          {"comingSoon" in services[activeService] && (services[activeService] as { comingSoon?: boolean }).comingSoon ? (
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">{services[activeService].title}</h3>
              <p className="text-muted-foreground mb-4">Coming soon — booking will be available shortly.</p>
              <p className="text-sm text-muted-foreground">{services[activeService].description}</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 tracking-tight">
                {services[activeService].title} — Details
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{services[activeService].description}</p>
              <ul className="space-y-3">
                {services[activeService].features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center">
              <div className="rounded-xl border border-border bg-muted/30 p-6 lg:p-8">
                <h4 className="text-lg font-semibold text-foreground mb-5">Session information</h4>
                <dl className="space-y-4">
                  <div className="flex justify-between items-center">
                    <dt className="text-muted-foreground">Price range</dt>
                    <dd className="font-semibold text-foreground">{services[activeService].price}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-semibold text-foreground">{services[activeService].duration}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-muted-foreground">Direct billing</dt>
                    <dd className="font-semibold text-green-600 dark:text-green-400">Available</dd>
                  </div>
                </dl>
                <Button asChild className="w-full mt-6 h-11 rounded-lg font-medium">
                  <Link href="/book">Book {services[activeService].title}</Link>
                </Button>
              </div>
            </div>
          </div>
          )}
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="text-center p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-300"
            >
              <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResponsiveServices
