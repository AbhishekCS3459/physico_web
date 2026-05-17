"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  User,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

function RequiredStar() {
  return <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
}

function FieldLabel({
  htmlFor,
  required,
  children,
  className,
}: {
  htmlFor?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <Label htmlFor={htmlFor} className={className}>
      {children}
      {required ? <RequiredStar /> : null}
    </Label>
  )
}

type AppointmentTypeOption = {
  id: string
  label: string
  description?: string
}

interface BookingFormData {
  serviceType: string
  appointmentType: string
  startDate: string
  endDate: string
  serviceLocation: string
  fullAddress: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  condition: string
  medicalHistory: string
  useDirectBilling: boolean
  insuranceProvider: string
  policyNumber: string
  groupNumber: string
  emergencyContact: string
  specialInstructions: string
  termsAccepted: boolean
  consentGiven: boolean
}

const BOOKING_SERVICES: {
  id: string
  name: string
  description: string
  comingSoon?: boolean
  appointmentTypes: AppointmentTypeOption[]
}[] = [
  {
    id: "physiotherapy",
    name: "Physiotherapy",
    description: "Rehabilitation and movement therapy",
    appointmentTypes: [
      { id: "initial", label: "Initial assessment", description: "$140 · 60 min" },
      { id: "followup", label: "Follow-up session", description: "$140 · 45 min" },
      { id: "extended", label: "Extended session", description: "Longer visit — we'll confirm pricing" },
    ],
  },
  {
    id: "occupational-therapy",
    name: "Occupational Therapy",
    description: "Daily living and independence support",
    appointmentTypes: [
      { id: "initial", label: "Initial consultation", description: "First visit" },
      { id: "followup", label: "Follow-up session", description: "Ongoing care" },
    ],
  },
  {
    id: "massage-therapy",
    name: "Massage Therapy",
    description: "Therapeutic massage by RMT",
    comingSoon: true,
    appointmentTypes: [],
  },
]

interface CompletedBooking {
  id: string
  serviceType: string
  appointmentType: string
  preferredDate: string
  endDate: string | null
  serviceLocation: string
  fullAddress: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  useDirectBilling: boolean
  insuranceProvider: string | null
  status: string
  createdAt: string
}

const SERVICE_LOCATION_LABELS: Record<string, string> = {
  home: "My Home",
  workplace: "My Workplace",
  "care-facility": "Care Facility",
}

function formatSlugLabel(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function getServiceName(serviceType: string) {
  return BOOKING_SERVICES.find((s) => s.id === serviceType)?.name ?? formatSlugLabel(serviceType)
}

function getAppointmentLabel(serviceType: string, appointmentType: string) {
  const service = BOOKING_SERVICES.find((s) => s.id === serviceType)
  const match = service?.appointmentTypes.find((t) => t.id === appointmentType)
  return match?.label ?? formatSlugLabel(appointmentType)
}

function formatBookingDateRange(preferredDate: string, endDate: string | null) {
  const start = format(new Date(preferredDate), "MMM dd, yyyy")
  if (!endDate) return start
  const end = format(new Date(endDate), "MMM dd, yyyy")
  return start === end ? start : `${start} – ${end}`
}

const INITIAL_FORM_DATA: Partial<BookingFormData> = {
  serviceType: "",
  appointmentType: "",
  startDate: "",
  endDate: "",
  serviceLocation: "",
  fullAddress: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  condition: "",
  medicalHistory: "",
  useDirectBilling: false,
  insuranceProvider: "",
  policyNumber: "",
  groupNumber: "",
  emergencyContact: "",
  specialInstructions: "",
  termsAccepted: false,
  consentGiven: false,
}

export function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedBooking, setCompletedBooking] = useState<CompletedBooking | null>(null)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const totalSteps = 4

  useEffect(() => {
    fetch("/api/auth/user/me")
      .then((res) => res.json())
      .then((data) => setIsUserLoggedIn(Boolean(data.authenticated)))
      .catch(() => setIsUserLoggedIn(false))
  }, [])

  const [formData, setFormData] = useState<Partial<BookingFormData>>(INITIAL_FORM_DATA)

  const resetBookingForm = useCallback(() => {
    setCompletedBooking(null)
    setFormData(INITIAL_FORM_DATA)
    setCurrentStep(1)
  }, [])

  const selectedService = BOOKING_SERVICES.find((s) => s.id === formData.serviceType)

  const selectService = useCallback((serviceId: string) => {
    const service = BOOKING_SERVICES.find((s) => s.id === serviceId)
    if (!service || service.comingSoon) return
    setFormData((prev) => ({
      ...prev,
      serviceType: serviceId,
      appointmentType:
        prev.serviceType === serviceId ? prev.appointmentType : "",
    }))
  }, [])

  const selectAppointmentType = useCallback((typeId: string) => {
    setFormData((prev) => ({ ...prev, appointmentType: typeId }))
  }, [])

  const insuranceProviders = [
    "Blue Cross",
    "Manulife",
    "Sun Life",
    "Canada Life",
    "Green Shield",
    "Desjardins",
    "Industrial Alliance",
    "Other",
  ]

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.serviceType) {
        toast.error("Please select a service")
        return
      }
      if (!formData.appointmentType) {
        toast.error("Please choose a session type for your visit")
        return
      }
    }
    if (currentStep === 2) {
      if (!formData.startDate) {
        toast.error("Please choose a preferred start date")
        return
      }
      if (!formData.serviceLocation) {
        toast.error("Please select where we should visit")
        return
      }
      if (!formData.fullAddress?.trim()) {
        toast.error("Please enter your full address")
        return
      }
      if (!formData.endDate && formData.startDate) {
        setFormData((prev) => ({ ...prev, endDate: prev.startDate }))
      }
    }
    if (currentStep === 3) {
      if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
        toast.error("Please enter your first and last name")
        return
      }
      if (!formData.email?.trim()) {
        toast.error("Please enter your email")
        return
      }
      if (!formData.phoneNumber?.trim()) {
        toast.error("Please enter your phone number")
        return
      }
    }
    setCurrentStep(Math.min(currentStep + 1, totalSteps))
  }
  
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1))

  const handleSubmit = async () => {
    if (!formData.termsAccepted || !formData.consentGiven) {
      toast.error("Please accept the terms and conditions")
      return
    }
    if (!formData.serviceType || !formData.appointmentType) {
      toast.error("Please complete service selection (step 1)")
      setCurrentStep(1)
      return
    }
    if (
      !formData.startDate ||
      !formData.serviceLocation ||
      !formData.fullAddress?.trim() ||
      !formData.firstName?.trim() ||
      !formData.lastName?.trim() ||
      !formData.email?.trim() ||
      !formData.phoneNumber?.trim()
    ) {
      toast.error("Please complete all required fields")
      return
    }
    if (formData.useDirectBilling) {
      if (!formData.insuranceProvider || !formData.policyNumber?.trim()) {
        toast.error("Insurance provider and policy number are required for direct billing")
        setCurrentStep(4)
        return
      }
    }

    const endDate = formData.endDate || formData.startDate

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          appointmentType: formData.appointmentType,
          startDate: formData.startDate,
          endDate,
          serviceLocation: formData.serviceLocation,
          fullAddress: formData.fullAddress,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth || undefined,
          condition: formData.condition || undefined,
          medicalHistory: formData.medicalHistory || undefined,
          useDirectBilling: formData.useDirectBilling || false,
          insuranceProvider: formData.insuranceProvider || undefined,
          policyNumber: formData.policyNumber || undefined,
          groupNumber: formData.groupNumber || undefined,
          emergencyContact: formData.emergencyContact || undefined,
          specialInstructions: formData.specialInstructions || undefined,
        }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setCompletedBooking(data.data as CompletedBooking)
        toast.success("Booking confirmed! Review your details below.")
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else if (data.success) {
        toast.success("Booking request submitted successfully! We'll contact you soon.")
        resetBookingForm()
      } else {
        toast.error(data.error || "Failed to submit booking request")
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepLabels = ["Service", "Schedule", "Personal Info", "Confirmation"]

  if (completedBooking) {
    return (
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-card via-background to-primary/5">
          <CardHeader className="text-center pb-4 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5">
            <motion.div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-9 w-9 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">Booking confirmed</CardTitle>
            <CardDescription className="text-base sm:text-lg mt-2 max-w-xl mx-auto">
              Your request has been received. We&apos;ll contact you to confirm your appointment.
              A confirmation email has been sent to {completedBooking.email}.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Reference
                </p>
                <p className="font-mono text-sm sm:text-base font-semibold">{completedBooking.id}</p>
              </div>
              <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
                {completedBooking.status}
              </Badge>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <section className="space-y-3 rounded-xl border p-4 sm:p-5">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Patient
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium text-right">
                      {completedBooking.firstName} {completedBooking.lastName}
                    </dd>
                  </div>
                  <motion.div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </dt>
                    <dd className="font-medium text-right break-all">{completedBooking.email}</dd>
                  </motion.div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </dt>
                    <dd className="font-medium">{completedBooking.phoneNumber}</dd>
                  </div>
                </dl>
              </section>

              <section className="space-y-3 rounded-xl border p-4 sm:p-5">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Appointment
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Service</dt>
                    <dd className="font-medium text-right">
                      {getServiceName(completedBooking.serviceType)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Session</dt>
                    <dd className="font-medium text-right">
                      {getAppointmentLabel(
                        completedBooking.serviceType,
                        completedBooking.appointmentType
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Preferred dates</dt>
                    <dd className="font-medium text-right">
                      {formatBookingDateRange(
                        completedBooking.preferredDate,
                        completedBooking.endDate
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="space-y-3 rounded-xl border p-4 sm:p-5 sm:col-span-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Visit location
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Location type</dt>
                    <dd className="font-medium">
                      {SERVICE_LOCATION_LABELS[completedBooking.serviceLocation] ??
                        formatSlugLabel(completedBooking.serviceLocation)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground mb-1">Address</dt>
                    <dd className="font-medium whitespace-pre-wrap">{completedBooking.fullAddress}</dd>
                  </div>
                  {completedBooking.useDirectBilling && (
                    <div className="flex justify-between gap-4 pt-2 border-t">
                      <dt className="text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" /> Direct billing
                      </dt>
                      <dd className="font-medium capitalize">
                        {completedBooking.insuranceProvider
                          ? formatSlugLabel(completedBooking.insuranceProvider)
                          : "Yes"}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 min-h-[52px] border-2"
                onClick={resetBookingForm}
              >
                Book another appointment
              </Button>
              {isUserLoggedIn ? (
                <Button asChild className="flex-1 min-h-[52px] bg-gradient-to-r from-primary to-accent">
                  <Link href="/my-bookings">View all my bookings</Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" className="flex-1 min-h-[52px]">
                  <Link href="/user-login">Sign in to manage bookings</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Enhanced Progress Indicator */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6 px-2 relative">
          {/* Progress line background */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 -z-10 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-accent -translate-y-1/2 -z-10 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
          
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNum = i + 1
            const isActive = stepNum <= currentStep
            const isCurrent = stepNum === currentStep
            
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <motion.div
                  className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 font-semibold text-base sm:text-lg transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-110"
                      : "bg-background text-muted-foreground border-muted-foreground/30"
                  }`}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : isActive ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isActive && stepNum < currentStep ? (
                    <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
                  ) : (
                    stepNum
                  )}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                  )}
                </motion.div>
                <span className={`mt-2 text-xs sm:text-sm font-medium hidden sm:block ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {stepLabels[i]}
                </span>
              </div>
            )
          })}
        </div>
        <div className="text-center">
          <motion.p
            key={currentStep}
            className="text-sm sm:text-base font-medium text-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Step {currentStep} of {totalSteps}
          </motion.p>
        </div>
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2 border-primary/10 shadow-2xl bg-gradient-to-br from-card via-background to-primary/5 backdrop-blur-sm">
        <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-bold">
            <motion.div
              key={currentStep}
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10"
            >
              {currentStep === 1 && <User className="h-6 w-6 text-primary" />}
              {currentStep === 2 && <CalendarIcon className="h-6 w-6 text-primary" />}
              {currentStep === 3 && <User className="h-6 w-6 text-primary" />}
              {currentStep === 4 && <Shield className="h-6 w-6 text-primary" />}
            </motion.div>
            <motion.span
              key={`title-${currentStep}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && "Service Selection"}
              {currentStep === 2 && "Schedule Appointment"}
              {currentStep === 3 && "Personal Information"}
              {currentStep === 4 && "Insurance & Confirmation"}
            </motion.span>
          </CardTitle>
          <motion.div
            key={`desc-${currentStep}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CardDescription className="text-base sm:text-lg mt-2">
              {currentStep === 1 && "Choose your service and session type"}
              {currentStep === 2 && "Select your preferred date and time"}
              {currentStep === 3 && "Tell us about yourself and your needs"}
              {currentStep === 4 && "Insurance details and final confirmation"}
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-8">
          <p className="text-sm text-muted-foreground -mt-2">
            Fields marked with <RequiredStar /> are required.
          </p>
          <AnimatePresence mode="wait">
            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
            <div className="space-y-6 sm:space-y-8">
              <div>
                <FieldLabel required className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 block">
                  Select a service
                </FieldLabel>
                <RadioGroup 
                  value={formData.serviceType || ""} 
                  onValueChange={selectService}
                  className="space-y-4 sm:space-y-6"
                >
                  {BOOKING_SERVICES.map((service, index) => {
                    const isComingSoon = Boolean(service.comingSoon)
                    return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="group"
                    >
                      <div 
                        className={`flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                          isComingSoon
                            ? "border-dashed border-muted-foreground/40 bg-muted/30 cursor-not-allowed opacity-80"
                            : formData.serviceType === service.id
                              ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 cursor-pointer"
                              : "border-border hover:border-primary/50 bg-gradient-to-br from-background to-card/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                        }`}
                        onClick={() => selectService(service.id)}
                      >
                        <RadioGroupItem 
                          value={service.id} 
                          id={service.id} 
                          className="mt-1 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                          disabled={isComingSoon}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={service.id}
                            className="text-base sm:text-lg font-semibold leading-relaxed flex items-center gap-2 group-hover:text-primary transition-colors cursor-pointer"
                          >
                            {service.name}
                            {isComingSoon ? (
                              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                            ) : (
                              <Sparkles className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </Label>
                          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed mt-1">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )})}
                </RadioGroup>
              </div>

              {selectedService && !selectedService.comingSoon && (
                <div className="space-y-3">
                  <FieldLabel required className="text-base sm:text-lg font-medium block">
                    Session type
                  </FieldLabel>
                  <p className="text-sm text-muted-foreground -mt-1">
                    Tap the visit type you need — it goes with the service you selected above.
                  </p>
                  <motion.div layout className="grid gap-3 sm:grid-cols-2">
                    {selectedService.appointmentTypes.map((session) => {
                      const selected = formData.appointmentType === session.id
                      return (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => selectAppointmentType(session.id)}
                          className={cn(
                            "text-left rounded-xl border-2 p-4 transition-all",
                            selected
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border hover:border-primary/40 bg-card/50"
                          )}
                        >
                          <p className="font-semibold text-foreground">{session.label}</p>
                          {session.description ? (
                            <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                          ) : null}
                        </button>
                      )
                    })}
                  </motion.div>
                </div>
              )}
            </div>
              </motion.div>
            )}

            {/* Step 2: Schedule */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
            <div className="space-y-6 sm:space-y-8">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <FieldLabel htmlFor="start-date" required className="text-base sm:text-lg font-medium">
                    Preferred start date
                  </FieldLabel>
                  <div className="relative mt-2 sm:mt-3">
                    <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5 z-10 pointer-events-none" />
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.startDate || ""}
                      onChange={(e) => {
                        const startDate = e.target.value
                        setFormData((prev) => ({
                          ...prev,
                          startDate,
                          endDate:
                            prev.endDate && prev.endDate >= startDate ? prev.endDate : prev.endDate || "",
                        }))
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className={cn(
                        "pl-12 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 backdrop-blur-sm",
                        formData.startDate && "border-primary/50 bg-primary/5"
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  {formData.startDate && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selected: {format(new Date(formData.startDate), "PPP")}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel htmlFor="end-date" className="text-base sm:text-lg font-medium">
                    End date <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                  </FieldLabel>
                  <div className="relative mt-2 sm:mt-3">
                    <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5 z-10 pointer-events-none" />
                    <Input
                      id="end-date"
                      type="date"
                      value={formData.endDate || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, endDate: e.target.value })
                      }}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      className={cn(
                        "pl-12 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 backdrop-blur-sm",
                        formData.endDate && "border-primary/50 bg-primary/5"
                      )}
                      disabled={isSubmitting || !formData.startDate}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Leave blank for a single-day visit — we&apos;ll use your start date.
                  </p>
                  {formData.endDate && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Selected: {format(new Date(formData.endDate), "PPP")}
                    </p>
                  )}
                </div>
              </div>
              {formData.startDate && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    {formData.endDate && formData.endDate !== formData.startDate
                      ? `Date range: ${format(new Date(formData.startDate), "MMM dd, yyyy")} – ${format(new Date(formData.endDate), "MMM dd, yyyy")}`
                      : `Preferred date: ${format(new Date(formData.startDate), "MMM dd, yyyy")}`}
                  </p>
                </div>
              )}

              <div>
                <FieldLabel htmlFor="location" required className="text-base sm:text-lg font-medium">
                  Service location
                </FieldLabel>
                <Select 
                  value={formData.serviceLocation || ""}
                  onValueChange={(value) => setFormData({ ...formData, serviceLocation: value })}
                >
                  <SelectTrigger className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Where should we visit?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home" className="text-base py-3">
                      My Home
                    </SelectItem>
                    <SelectItem value="workplace" className="text-base py-3">
                      My Workplace
                    </SelectItem>
                    <SelectItem value="care-facility" className="text-base py-3">
                      Care Facility
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FieldLabel htmlFor="address" required className="text-base sm:text-lg font-medium">
                  Full address
                </FieldLabel>
                <Textarea
                  id="address"
                  placeholder="Please provide your complete address including postal code"
                  value={formData.fullAddress || ""}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  className="mt-2 sm:mt-3 text-base min-h-[100px] sm:min-h-[120px] border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  rows={3}
                />
              </div>
            </div>
              </motion.div>
            )}

            {/* Step 3: Personal Information */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
            <div className="space-y-6 sm:space-y-8">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <FieldLabel htmlFor="first-name" required className="text-base sm:text-lg font-medium">
                    First name
                  </FieldLabel>
                  <Input 
                    id="first-name" 
                    value={formData.firstName || ""}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="last-name" required className="text-base sm:text-lg font-medium">
                    Last name
                  </FieldLabel>
                  <Input 
                    id="last-name" 
                    value={formData.lastName || ""}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <FieldLabel htmlFor="phone" required className="text-base sm:text-lg font-medium">
                    Phone number
                  </FieldLabel>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={formData.phoneNumber || ""}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="email" required className="text-base sm:text-lg font-medium">
                    Email address
                  </FieldLabel>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="date-of-birth" className="text-base sm:text-lg font-medium">
                  Date of birth <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                </FieldLabel>
                <Input 
                  id="date-of-birth" 
                  type="date" 
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>

              <div>
                <FieldLabel htmlFor="condition" className="text-base sm:text-lg font-medium">
                  Condition / reason for treatment <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                </FieldLabel>
                <Textarea
                  id="condition"
                  placeholder="Please describe your condition, symptoms, or reason for seeking treatment"
                  value={formData.condition || ""}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="mt-2 sm:mt-3 text-base min-h-[120px] sm:min-h-[140px] border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  rows={4}
                />
              </div>

              <div>
                <FieldLabel htmlFor="medical-history" className="text-base sm:text-lg font-medium">
                  Relevant medical history <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                </FieldLabel>
                <Textarea
                  id="medical-history"
                  placeholder="Any relevant medical history, surgeries, medications, or conditions we should know about"
                  value={formData.medicalHistory || ""}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  className="mt-2 sm:mt-3 text-base min-h-[100px] sm:min-h-[120px] border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  rows={3}
                />
              </div>
            </div>
              </motion.div>
            )}

            {/* Step 4: Insurance & Confirmation */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
            <div className="space-y-6 sm:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-3 p-4 sm:p-5 rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/40 hover:from-primary/10 transition-all duration-300"
              >
                <Checkbox 
                  id="direct-billing" 
                  checked={formData.useDirectBilling || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, useDirectBilling: checked as boolean })}
                  className="w-5 h-5 sm:w-6 sm:h-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                />
                <Label htmlFor="direct-billing" className="text-base sm:text-lg font-semibold cursor-pointer flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  I would like to use direct billing
                </Label>
              </motion.div>

              <div className={cn(!formData.useDirectBilling && "opacity-60 pointer-events-none")}>
                <FieldLabel
                  htmlFor="insurance-provider"
                  required={Boolean(formData.useDirectBilling)}
                  className="text-base sm:text-lg font-medium"
                >
                  Insurance provider
                </FieldLabel>
                {!formData.useDirectBilling && (
                  <p className="text-xs text-muted-foreground mb-2">Only needed if you use direct billing above.</p>
                )}
                <Select 
                  value={formData.insuranceProvider || ""}
                  onValueChange={(value) => setFormData({ ...formData, insuranceProvider: value })}
                  disabled={!formData.useDirectBilling}
                >
                  <SelectTrigger className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Select your insurance provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {insuranceProviders.map((provider) => (
                      <SelectItem
                        key={provider}
                        value={provider.toLowerCase().replace(" ", "-")}
                        className="text-base py-3"
                      >
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <FieldLabel
                    htmlFor="policy-number"
                    required={Boolean(formData.useDirectBilling)}
                    className="text-base sm:text-lg font-medium"
                  >
                    Policy number
                  </FieldLabel>
                  <Input 
                    id="policy-number" 
                    value={formData.policyNumber || ""}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    disabled={!formData.useDirectBilling}
                    className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="group-number" className="text-base sm:text-lg font-medium">
                    Group number <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                  </FieldLabel>
                  <Input 
                    id="group-number" 
                    value={formData.groupNumber || ""}
                    onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                    className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="emergency-contact" className="text-base sm:text-lg font-medium">
                  Emergency contact <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                </FieldLabel>
                <Input
                  id="emergency-contact"
                  placeholder="Name and phone number"
                  value={formData.emergencyContact || ""}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <FieldLabel htmlFor="special-instructions" className="text-base sm:text-lg font-medium">
                  Special instructions <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                </FieldLabel>
                <Textarea
                  id="special-instructions"
                  placeholder="Any special instructions for our visit (parking, building access, etc.)"
                  value={formData.specialInstructions || ""}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  className="mt-2 sm:mt-3 text-base min-h-[100px] sm:min-h-[120px] border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  rows={3}
                />
              </div>

              <div className="space-y-4 sm:space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start space-x-3 p-4 sm:p-5 rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/40 hover:from-primary/10 transition-all duration-300"
                >
                  <Checkbox 
                    id="terms" 
                    checked={formData.termsAccepted || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                    className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                  />
                  <Label htmlFor="terms" className="text-sm sm:text-base cursor-pointer leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      I agree to the terms and conditions and privacy policy
                      <RequiredStar />
                    </span>
                  </Label>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-start space-x-3 p-4 sm:p-5 rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/40 hover:from-primary/10 transition-all duration-300"
                >
                  <Checkbox 
                    id="consent" 
                    checked={formData.consentGiven || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, consentGiven: checked as boolean })}
                    className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                  />
                  <Label htmlFor="consent" className="text-sm sm:text-base cursor-pointer leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      I consent to treatment and understand the fees involved
                      <RequiredStar />
                    </span>
                  </Label>
                </motion.div>
              </div>
            </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 sm:pt-8 border-t border-primary/10">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="order-2 sm:order-1 min-h-[52px] text-base font-medium bg-transparent border-2 hover:bg-primary/5 hover:border-primary/50 transition-all disabled:opacity-50"
            >
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button 
                onClick={nextStep} 
                className="order-1 sm:order-2 min-h-[52px] text-base font-medium bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Next Step
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="order-1 sm:order-2 min-h-[52px] text-base font-medium bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Book Appointment
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
