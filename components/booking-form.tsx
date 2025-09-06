"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Shield, Phone, Mail } from "lucide-react"

export function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const services = [
    {
      id: "physiotherapy",
      name: "Physiotherapy",
      description: "Rehabilitation and movement therapy",
      prices: {
        initial: "$140 (60 min)",
        followup: "$130 (45 min)",
        extended: "$140 (60 min)",
      },
    },
    {
      id: "occupational-therapy",
      name: "Occupational Therapy",
      description: "Daily living and independence support",
      prices: {
        initial: "$130 (60 min)",
        followup: "$100 (45 min)",
        assessment: "$150 (Home Safety)",
      },
    },
    {
      id: "massage-therapy",
      name: "Massage Therapy",
      description: "Therapeutic massage by RMT",
      prices: {
        "45min": "$85 (45 min)",
        "60min": "$105 (60 min)",
        "90min": "$140 (90 min)",
      },
    },
  ]

  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
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

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, totalSteps))
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1))

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 px-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div
                style={{
                  width: i + 1 <= currentStep ? "2.5rem" : "2rem",
                  height: i + 1 <= currentStep ? "2.5rem" : "2rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: "600",
                  border: "2px solid",
                  backgroundColor: i + 1 <= currentStep ? "#164e63" : "#ffffff",
                  color: i + 1 <= currentStep ? "#ffffff" : "#1f2937",
                  borderColor: i + 1 <= currentStep ? "#164e63" : "#6b7280",
                }}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  style={{
                    height: "2px",
                    width: "3rem",
                    margin: "0 0.5rem",
                    backgroundColor: i + 1 < currentStep ? "#164e63" : "#d1d5db",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm sm:text-base text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            {currentStep === 1 && (
              <>
                <User className="h-5 w-5" /> Service Selection
              </>
            )}
            {currentStep === 2 && (
              <>
                <Calendar className="h-5 w-5" /> Schedule Appointment
              </>
            )}
            {currentStep === 3 && (
              <>
                <User className="h-5 w-5" /> Personal Information
              </>
            )}
            {currentStep === 4 && (
              <>
                <Shield className="h-5 w-5" /> Insurance & Confirmation
              </>
            )}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg">
            {currentStep === 1 && "Choose the service you need"}
            {currentStep === 2 && "Select your preferred date and time"}
            {currentStep === 3 && "Tell us about yourself and your needs"}
            {currentStep === 4 && "Insurance details and final confirmation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <Label className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 block">Select Service Type</Label>
                <RadioGroup defaultValue="" className="space-y-4 sm:space-y-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={service.id} id={service.id} className="mt-1 w-5 h-5 sm:w-6 sm:h-6" />
                      <div className="flex-1">
                        <Label
                          htmlFor={service.id}
                          className="text-base sm:text-lg font-medium cursor-pointer leading-relaxed"
                        >
                          {service.name}
                        </Label>
                        <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-3 leading-relaxed">
                          {service.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(service.prices).map(([type, price]) => (
                            <Badge key={type} variant="outline" className="text-xs sm:text-sm">
                              {price}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="appointment-type" className="text-base sm:text-lg font-medium">
                  Appointment Type
                </Label>
                <Select>
                  <SelectTrigger className="mt-2 sm:mt-3 h-12 sm:h-14 text-base">
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
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="date" className="text-base sm:text-lg font-medium">
                    Preferred Date
                  </Label>
                  <Input type="date" id="date" className="mt-2 sm:mt-3 h-12 sm:h-14 text-base" />
                </div>
                <div>
                  <Label htmlFor="time" className="text-base sm:text-lg font-medium">
                    Preferred Time
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-2 sm:mt-3 h-12 sm:h-14 text-base">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time} className="text-base py-3">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-base sm:text-lg font-medium">
                  Service Location
                </Label>
                <Select>
                  <SelectTrigger className="mt-2 sm:mt-3 h-12 sm:h-14 text-base">
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
                  className="mt-2 sm:mt-3 text-base min-h-[100px] sm:min-h-[120px]"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Personal Information */}
          {currentStep === 3 && (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="first-name" className="text-base sm:text-lg font-medium">
                    First Name
                  </Label>
                  <Input id="first-name" className="mt-2 sm:mt-3 h-12 sm:h-14 text-base" />
                </div>
                <div>
                  <Label htmlFor="last-name" className="text-base sm:text-lg font-medium">
                    Last Name
                  </Label>
                  <Input id="last-name" className="mt-2 sm:mt-3 h-12 sm:h-14 text-base" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="phone" className="text-base sm:text-lg font-medium">
                    Phone Number
                  </Label>
                  <Input id="phone" type="tel" className="mt-2 sm:mt-3 h-12 sm:h-14 text-base" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-base sm:text-lg font-medium">
                    Email Address
                  </Label>
                  <Input id="email" type="email" className="mt-2 sm:mt-3 h-12 sm:h-14 text-base" />
                </div>
              </div>

              <div>
                <Label htmlFor="date-of-birth" className="text-base sm:text-lg font-medium">
                  Date of Birth
                </Label>
                <Input id="date-of-birth" type="date" className="mt-2 sm:mt-3 h-12 sm:h-14 text-base" />
              </div>

              <div>
                <Label htmlFor="condition" className="text-base sm:text-lg font-medium">
                  Condition/Reason for Treatment
                </Label>
                <Textarea
                  id="condition"
                  placeholder="Please describe your condition, symptoms, or reason for seeking treatment"
                  className="mt-2 sm:mt-3 text-base min-h-[120px] sm:min-h-[140px]"
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
                  className="mt-2 sm:mt-3 text-base min-h-[100px] sm:min-h-[120px]"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Insurance & Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg border">
                <Checkbox id="direct-billing" className="w-5 h-5 sm:w-6 sm:h-6" />
                <Label htmlFor="direct-billing" className="text-base sm:text-lg font-medium cursor-pointer">
                  I would like to use direct billing
                </Label>
              </div>

              <div>
                <Label htmlFor="insurance-provider" className="text-base sm:text-lg font-medium">
                  Insurance Provider
                </Label>
                <Select>
                  <SelectTrigger className="mt-2 sm:mt-3 h-12 sm:h-14 text-base">
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
                  <Input id="policy-number" className="mt-2 sm:mt-3 h-12 sm:h-14 text-base" />
                </div>
                <div>
                  <Label htmlFor="group-number" className="text-base sm:text-lg font-medium">
                    Group Number (if applicable)
                  </Label>
                  <Input id="group-number" className="mt-2 sm:mt-3 h-12 sm:h-14 text-base" />
                </div>
              </div>

              <div>
                <Label htmlFor="emergency-contact" className="text-base sm:text-lg font-medium">
                  Emergency Contact
                </Label>
                <Input
                  id="emergency-contact"
                  placeholder="Name and phone number"
                  className="mt-2 sm:mt-3 h-12 sm:h-14 text-base"
                />
              </div>

              <div>
                <Label htmlFor="special-instructions" className="text-base sm:text-lg font-medium">
                  Special Instructions
                </Label>
                <Textarea
                  id="special-instructions"
                  placeholder="Any special instructions for our visit (parking, building access, etc.)"
                  className="mt-2 sm:mt-3 text-base min-h-[100px] sm:min-h-[120px]"
                  rows={3}
                />
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg border">
                  <Checkbox id="terms" className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5" />
                  <Label htmlFor="terms" className="text-sm sm:text-base cursor-pointer leading-relaxed">
                    I agree to the terms and conditions and privacy policy
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg border">
                  <Checkbox id="consent" className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5" />
                  <Label htmlFor="consent" className="text-sm sm:text-base cursor-pointer leading-relaxed">
                    I consent to treatment and understand the fees involved
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 sm:pt-8 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="order-2 sm:order-1 min-h-[52px] text-base font-medium bg-transparent"
            >
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="order-1 sm:order-2 min-h-[52px] text-base font-medium">
                Next Step
              </Button>
            ) : (
              <Button className="order-1 sm:order-2 min-h-[52px] text-base font-medium">
                <Calendar className="h-5 w-5 mr-2" />
                Book Appointment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="mt-6 sm:mt-8">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2 text-base sm:text-lg">Need Help Booking?</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
              Our team is available to assist you with booking or answer any questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button variant="outline" size="sm" className="min-h-[44px] text-base bg-transparent">
                <Phone className="h-4 w-4 mr-2" />
                Call (587) 586-5566
              </Button>
              <Button variant="outline" size="sm" className="min-h-[44px] text-base bg-transparent">
                <Mail className="h-4 w-4 mr-2" />
                Email Us
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
