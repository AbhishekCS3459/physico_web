"use client"
import {
  IconBrain,
  IconClock,
  IconCurrencyDollar,
  IconHandFinger,
  IconHeart,
  IconMapPin,
  IconShield,
  IconStethoscope,
} from "@tabler/icons-react"
import { motion } from "motion/react"
import { useState } from "react"

export function ResponsiveServices() {
  const [activeService, setActiveService] = useState(0)

  const services = [
    {
      icon: <IconStethoscope className="h-8 w-8" />,
      title: "Physiotherapy",
      description: "Comprehensive rehabilitation for injuries, post-surgery recovery, and chronic conditions",
      price: "$120-140",
      duration: "60 minutes",
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
      price: "$100-120",
      duration: "60 minutes",
      features: [
        "Deep tissue massage",
        "Trigger point therapy",
        "Myofascial release",
        "Relaxation techniques",
        "Sports massage",
      ],
    },
    {
      icon: <IconHandFinger className="h-8 w-8" />,
      title: "Acupuncture",
      description: "Traditional Chinese medicine for pain management and wellness",
      price: "$90-110",
      duration: "45 minutes",
      features: [
        "Pain relief treatments",
        "Stress and anxiety management",
        "Digestive health support",
        "Sleep improvement",
        "Chronic condition management",
      ],
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
    <section className="py-12 sm:py-16 lg:py-24 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Comprehensive Care Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Professional healthcare services delivered in the comfort of your home across Calgary and surrounding areas
          </motion.p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                activeService === index
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
              }`}
              onClick={() => setActiveService(index)}
            >
              <div
                className={`inline-flex p-3 rounded-xl mb-4 ${
                  activeService === index
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{service.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{service.price}</span>
                <span className="text-gray-500 dark:text-gray-400">{service.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Active Service Details */}
        <motion.div
          key={activeService}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-2xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 lg:mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {services[activeService].title} Details
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{services[activeService].description}</p>
              <div className="space-y-3">
                {services[activeService].features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Session Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Price Range:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {services[activeService].price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Duration:</span>
                    <span className="font-semibold">{services[activeService].duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Direct Billing:</span>
                    <span className="font-semibold text-green-600">Available</span>
                  </div>
                </div>
                <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                  Book {services[activeService].title}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800"
            >
              <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResponsiveServices
