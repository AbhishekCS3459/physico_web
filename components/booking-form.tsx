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
import { Calendar as CalendarIcon, CheckCircle2, Loader2, Shield, Sparkles, User } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import toast from "react-hot-toast"

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

export function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const totalSteps = 4

  const [formData, setFormData] = useState<Partial<BookingFormData>>({
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
  })

  const services = [
    {
      id: "physiotherapy",
      name: "Physiotherapy",
      description: "Rehabilitation and movement therapy",
      prices: {
        initial: "$140 (60 min)",
        followup: "$140 (45 min)",
      },
    },
    {
      id: "occupational-therapy",
      name: "Occupational Therapy",
      description: "Daily living and independence support — contact for pricing",
      prices: {},
    },
    {
      id: "massage-therapy",
      name: "Massage Therapy",
      description: "Therapeutic massage by RMT",
      comingSoon: true,
      prices: {},
    },
  ]

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
    // Validate current step before proceeding
    if (currentStep === 1 && !formData.serviceType) {
      toast.error("Please select a service type")
      return
    }
    if (currentStep === 2 && (!formData.startDate || !formData.endDate || !formData.fullAddress)) {
      toast.error("Please fill in all required fields")
      return
    }
    if (currentStep === 3 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber)) {
      toast.error("Please fill in all required fields")
      return
    }
    setCurrentStep(Math.min(currentStep + 1, totalSteps))
  }
  
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1))

  const handleSubmit = async () => {
    if (!formData.termsAccepted || !formData.consentGiven) {
      toast.error("Please accept the terms and conditions")
      return
    }

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
          endDate: formData.endDate,
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

      if (data.success) {
        toast.success("Booking request submitted successfully! We'll contact you soon.")
        // Reset form
        setFormData({
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
        })
        setCurrentStep(1)
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
              {currentStep === 1 && "Choose the service you need"}
              {currentStep === 2 && "Select your preferred date and time"}
              {currentStep === 3 && "Tell us about yourself and your needs"}
              {currentStep === 4 && "Insurance details and final confirmation"}
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-8">
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
                <Label className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 block">Select Service Type</Label>
                <RadioGroup 
                  value={formData.serviceType || ""} 
                  onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                  className="space-y-4 sm:space-y-6"
                >
                  {services.map((service, index) => {
                    const isComingSoon = "comingSoon" in service && (service as { comingSoon?: boolean }).comingSoon
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
                        onClick={() => !isComingSoon && setFormData({ ...formData, serviceType: service.id })}
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
                            onClick={(e) => { e.stopPropagation(); if (!isComingSoon) setFormData({ ...formData, serviceType: service.id }) }}
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
                          {Object.keys(service.prices).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(service.prices).map(([type, price]) => (
                                <Badge 
                                  key={type} 
                                  variant="outline" 
                                  className="text-xs sm:text-sm bg-primary/5 border-primary/20 text-primary font-medium hover:bg-primary/10 transition-colors"
                                >
                                  {price}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )})}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="appointment-type" className="text-base sm:text-lg font-medium">
                  Appointment Type
                </Label>
                <Select 
                  value={formData.appointmentType || ""}
                  onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}
                >
                  <SelectTrigger className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial" className="text-base py-3">
                      Initial Assessment
                    </SelectItem>
                    <SelectItem value="followup" className="text-base py-3">
                      Follow-up Session
                    </SelectItem>
                    <SelectItem value="extended" className="text-base py-3">
                      Extended Session
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  <Label htmlFor="start-date" className="text-base sm:text-lg font-medium">
                    Start Date
                  </Label>
                  <div className="relative mt-2 sm:mt-3">
                    <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5 z-10 pointer-events-none" />
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.startDate || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, startDate: e.target.value })
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className={cn(
                        "pl-12 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 backdrop-blur-sm",
                        formData.startDate && "border-primary/50 bg-primary/5"
                      )}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  {formData.startDate && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selected: {format(new Date(formData.startDate), "PPP")}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-base sm:text-lg font-medium">
                    End Date
                  </Label>
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
                      required
                    />
                  </div>
                  {formData.endDate && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selected: {format(new Date(formData.endDate), "PPP")}
                    </p>
                  )}
                </div>
              </div>
              {formData.startDate && formData.endDate && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    Date Range: {format(new Date(formData.startDate), "MMM dd, yyyy")} - {format(new Date(formData.endDate), "MMM dd, yyyy")}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="location" className="text-base sm:text-lg font-medium">
                  Service Location
                </Label>
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
                <Label htmlFor="address" className="text-base sm:text-lg font-medium">
                  Full Address
                </Label>
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
                  <Label htmlFor="first-name" className="text-base sm:text-lg font-medium">
                    First Name
                  </Label>
                  <Input 
                    id="first-name" 
                    value={formData.firstName || ""}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <Label htmlFor="last-name" className="text-base sm:text-lg font-medium">
                    Last Name
                  </Label>
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
                  <Label htmlFor="phone" className="text-base sm:text-lg font-medium">
                    Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={formData.phoneNumber || ""}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-base sm:text-lg font-medium">
                    Email Address
                  </Label>
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
                <Label htmlFor="date-of-birth" className="text-base sm:text-lg font-medium">
                  Date of Birth
                </Label>
                <Input 
                  id="date-of-birth" 
                  type="date" 
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>

              <div>
                <Label htmlFor="condition" className="text-base sm:text-lg font-medium">
                  Condition/Reason for Treatment
                </Label>
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
                <Label htmlFor="medical-history" className="text-base sm:text-lg font-medium">
                  Relevant Medical History
                </Label>
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

              <div>
                <Label htmlFor="insurance-provider" className="text-base sm:text-lg font-medium">
                  Insurance Provider
                </Label>
                <Select 
                  value={formData.insuranceProvider || ""}
                  onValueChange={(value) => setFormData({ ...formData, insuranceProvider: value })}
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
                  <Label htmlFor="policy-number" className="text-base sm:text-lg font-medium">
                    Policy Number
                  </Label>
                  <Input 
                    id="policy-number" 
                    value={formData.policyNumber || ""}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
                <div>
                  <Label htmlFor="group-number" className="text-base sm:text-lg font-medium">
                    Group Number (if applicable)
                  </Label>
                  <Input 
                    id="group-number" 
                    value={formData.groupNumber || ""}
                    onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                    className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergency-contact" className="text-base sm:text-lg font-medium">
                  Emergency Contact
                </Label>
                <Input
                  id="emergency-contact"
                  placeholder="Name and phone number"
                  value={formData.emergencyContact || ""}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="mt-2 sm:mt-3 h-12 sm:h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <Label htmlFor="special-instructions" className="text-base sm:text-lg font-medium">
                  Special Instructions
                </Label>
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
                    <span>I agree to the terms and conditions and privacy policy</span>
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
                    <span>I consent to treatment and understand the fees involved</span>
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
