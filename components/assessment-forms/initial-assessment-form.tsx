"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import toast from "react-hot-toast"
import {
  RefreshCw,
  FileText,
  Activity,
  Heart,
  Stethoscope,
  Target,
  ClipboardList,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface InitialAssessmentFormProps {
  bookingId: string
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: any
}

function FormSection({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("border-2 border-border/60 shadow-sm overflow-hidden", className)}>
      <CardHeader className="pb-3 pt-5 px-5 bg-muted/30 border-b border-border/60">
        <CardTitle className="text-base font-semibold flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 px-5 pb-5 space-y-4">{children}</CardContent>
    </Card>
  )
}

export function InitialAssessmentForm({
  bookingId,
  onSuccess,
  onCancel,
  initialData,
}: InitialAssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    assessmentType: "initial" as const,
    reasonForReferral: initialData?.reasonForReferral || "",
    hpi: initialData?.hpi || "",
    painDescription: initialData?.painDescription || "",
    painLevel: initialData?.painLevel || "",
    painType: initialData?.painType || "",
    whatMakesWorse: initialData?.whatMakesWorse || "",
    whatHelps: initialData?.whatHelps || "",
    pmhx: initialData?.pmhx || "",
    associatedImaging: initialData?.associatedImaging || "",
    baselineActivity: initialData?.baselineActivity || "",
    observation: initialData?.observation || "",
    swellingCirculation: initialData?.swellingCirculation || "",
    romInitial: initialData?.romInitial || "",
    strengthInitial: initialData?.strengthInitial || "",
    palpation: initialData?.palpation || "",
    neuro: initialData?.neuro || "",
    specialTests: initialData?.specialTests || "",
    clinicalImpression: initialData?.clinicalImpression || "",
    goals: initialData?.goals || "",
    treatment: initialData?.treatment || "",
    treatmentModality: initialData?.treatmentModality || "",
    treatmentROM: initialData?.treatmentROM || "",
    treatmentStrengthening: initialData?.treatmentStrengthening || "",
    treatmentStretching: initialData?.treatmentStretching || "",
    treatmentHEP: initialData?.treatmentHEP || "",
    treatmentEducation: initialData?.treatmentEducation || "",
    treatmentRestrictions: initialData?.treatmentRestrictions || "",
    treatmentHandouts: initialData?.treatmentHandouts || "",
    plan: initialData?.plan || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = initialData?.id
        ? `/api/assessments/${initialData.id}`
        : "/api/assessments"
      const method = initialData?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          bookingId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          initialData?.id
            ? "Assessment updated successfully"
            : "Initial assessment created successfully"
        )
        onSuccess?.()
      } else {
        toast.error(data.error || "Failed to save assessment")
      }
    } catch (error) {
      console.error("Error saving assessment:", error)
      toast.error("Failed to save assessment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
        {/* Referral & HPI */}
        <FormSection title="Referral & history" icon={FileText}>
          <div>
            <Label htmlFor="reasonForReferral" className="text-sm font-medium">
              Reason for Referral
            </Label>
            <Textarea
              id="reasonForReferral"
              value={formData.reasonForReferral}
              onChange={(e) =>
                setFormData({ ...formData, reasonForReferral: e.target.value })
              }
              placeholder="e.g. Post-op rehab, pain management..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="hpi" className="text-sm font-medium">
              HPI
            </Label>
            <Textarea
              id="hpi"
              value={formData.hpi}
              onChange={(e) => setFormData({ ...formData, hpi: e.target.value })}
              placeholder="History of present illness..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={4}
            />
          </div>
        </FormSection>

        {/* Pain */}
        <FormSection title="Pain" icon={Heart}>
          <div>
            <Label className="text-sm font-medium">Pain description</Label>
            <Textarea
              value={formData.painDescription}
              onChange={(e) =>
                setFormData({ ...formData, painDescription: e.target.value })
              }
              placeholder="Describe location, quality, duration..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="painLevel" className="text-sm font-medium">
                Pain /10
              </Label>
              <Input
                id="painLevel"
                type="text"
                value={formData.painLevel}
                onChange={(e) =>
                  setFormData({ ...formData, painLevel: e.target.value })
                }
                placeholder="e.g., 7"
                className="mt-2 rounded-lg h-10 border-border focus-visible:ring-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Intermittent / Constant</Label>
              <RadioGroup
                value={formData.painType}
                onValueChange={(value) =>
                  setFormData({ ...formData, painType: value })
                }
                className="mt-3 flex gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border px-3 py-2 hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors">
                  <RadioGroupItem value="Intermittent" id="intermittent" />
                  <span className="text-sm font-medium">Intermittent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border px-3 py-2 hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors">
                  <RadioGroupItem value="Constant" id="constant" />
                  <span className="text-sm font-medium">Constant</span>
                </label>
              </RadioGroup>
            </div>
          </div>
          <div>
            <Label htmlFor="whatMakesWorse" className="text-sm font-medium">
              What makes the pain worse
            </Label>
            <Textarea
              id="whatMakesWorse"
              value={formData.whatMakesWorse}
              onChange={(e) =>
                setFormData({ ...formData, whatMakesWorse: e.target.value })
              }
              placeholder="Activities, positions..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="whatHelps" className="text-sm font-medium">
              What helps
            </Label>
            <Textarea
              id="whatHelps"
              value={formData.whatHelps}
              onChange={(e) =>
                setFormData({ ...formData, whatHelps: e.target.value })
              }
              placeholder="e.g., Rest, pain medication, heat/cold pack"
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={2}
            />
          </div>
        </FormSection>

        {/* Medical history & imaging */}
        <FormSection title="Medical history & imaging" icon={BookOpen}>
          <div>
            <Label htmlFor="pmhx" className="text-sm font-medium">
              PMHx
            </Label>
            <Textarea
              id="pmhx"
              value={formData.pmhx}
              onChange={(e) => setFormData({ ...formData, pmhx: e.target.value })}
              placeholder="Past medical history..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="associatedImaging" className="text-sm font-medium">
              Associated / Relevant Imaging
            </Label>
            <Textarea
              id="associatedImaging"
              value={formData.associatedImaging}
              onChange={(e) =>
                setFormData({ ...formData, associatedImaging: e.target.value })
              }
              placeholder="X-ray, MRI, etc."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="baselineActivity" className="text-sm font-medium">
              Baseline physical activity / occupation / leisure
            </Label>
            <Textarea
              id="baselineActivity"
              value={formData.baselineActivity}
              onChange={(e) =>
                setFormData({ ...formData, baselineActivity: e.target.value })
              }
              placeholder="Current activity level..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={3}
            />
          </div>
        </FormSection>

        {/* Objective */}
        <FormSection title="Objective" icon={Stethoscope}>
          <div>
            <Label htmlFor="observation" className="text-sm font-medium">
              Observation
            </Label>
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) =>
                setFormData({ ...formData, observation: e.target.value })
              }
              placeholder="Posture, gait, etc."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="swellingCirculation" className="text-sm font-medium">
              Swelling / circulation
            </Label>
            <Textarea
              id="swellingCirculation"
              value={formData.swellingCirculation}
              onChange={(e) =>
                setFormData({ ...formData, swellingCirculation: e.target.value })
              }
              placeholder="..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="romInitial" className="text-sm font-medium">
                ROM
              </Label>
              <Textarea
                id="romInitial"
                value={formData.romInitial}
                onChange={(e) =>
                  setFormData({ ...formData, romInitial: e.target.value })
                }
              placeholder="Flexion: ___, Extension: ___, Abduction: ___, Adduction: ___, Internal rotation: ___, External rotation: ___"
                className="mt-2 rounded-lg border-border focus-visible:ring-2"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="strengthInitial" className="text-sm font-medium">
                RIM / Strength
              </Label>
              <Textarea
                id="strengthInitial"
                value={formData.strengthInitial}
                onChange={(e) =>
                  setFormData({ ...formData, strengthInitial: e.target.value })
                }
                placeholder="Flexion /5, Extension /5, Abduction /5, Adduction /5, Internal rotation /5, External rotation /5"
                className="mt-2 rounded-lg border-border focus-visible:ring-2"
                rows={2}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="neuro" className="text-sm font-medium">
              Neuro (screening, reflexes, tension tests)
            </Label>
            <Textarea
              id="neuro"
              value={formData.neuro}
              onChange={(e) => setFormData({ ...formData, neuro: e.target.value })}
              placeholder="..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="palpation" className="text-sm font-medium">
              Palpation
            </Label>
            <Textarea
              id="palpation"
              value={formData.palpation}
              onChange={(e) =>
                setFormData({ ...formData, palpation: e.target.value })
              }
              placeholder="..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="specialTests" className="text-sm font-medium">
              Special tests / Outcome measures
            </Label>
            <Textarea
              id="specialTests"
              value={formData.specialTests}
              onChange={(e) =>
                setFormData({ ...formData, specialTests: e.target.value })
              }
              placeholder="..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={3}
            />
          </div>
        </FormSection>

        {/* Clinical impression & goals */}
        <FormSection title="Clinical impression & goals" icon={Target}>
          <div>
            <Label htmlFor="clinicalImpression" className="text-sm font-medium">
              Clinical impression / Analysis
            </Label>
            <Textarea
              id="clinicalImpression"
              value={formData.clinicalImpression}
              onChange={(e) =>
                setFormData({ ...formData, clinicalImpression: e.target.value })
              }
              placeholder="..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="goals" className="text-sm font-medium">
              Goals
            </Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="Short- and long-term goals..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={3}
            />
          </div>
        </FormSection>

        {/* Treatment */}
        <FormSection title="Treatment" icon={Activity}>
          <div>
            <Label htmlFor="treatment" className="text-sm font-medium">
              Treatment (summary)
            </Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={(e) =>
                setFormData({ ...formData, treatment: e.target.value })
              }
              placeholder="..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="treatmentModality" className="text-sm font-medium">
                Modality
              </Label>
              <Input
                id="treatmentModality"
                value={formData.treatmentModality}
                onChange={(e) =>
                  setFormData({ ...formData, treatmentModality: e.target.value })
                }
                placeholder="e.g. Heat, US"
                className="mt-2 rounded-lg h-10 border-border focus-visible:ring-2"
              />
            </div>
            <div>
              <Label htmlFor="treatmentROM" className="text-sm font-medium">
                ROM
              </Label>
              <Input
                id="treatmentROM"
                value={formData.treatmentROM}
                onChange={(e) =>
                  setFormData({ ...formData, treatmentROM: e.target.value })
                }
                placeholder="..."
                className="mt-2 rounded-lg h-10 border-border focus-visible:ring-2"
              />
            </div>
            <div>
              <Label htmlFor="treatmentStrengthening" className="text-sm font-medium">
                Strengthening
              </Label>
              <Input
                id="treatmentStrengthening"
                value={formData.treatmentStrengthening}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    treatmentStrengthening: e.target.value,
                  })
                }
                placeholder="..."
                className="mt-2 rounded-lg h-10 border-border focus-visible:ring-2"
              />
            </div>
            <div>
              <Label htmlFor="treatmentStretching" className="text-sm font-medium">
                Stretching
              </Label>
              <Input
                id="treatmentStretching"
                value={formData.treatmentStretching}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    treatmentStretching: e.target.value,
                  })
                }
                placeholder="..."
                className="mt-2 rounded-lg h-10 border-border focus-visible:ring-2"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="treatmentHEP" className="text-sm font-medium">
              HEP
            </Label>
            <Textarea
              id="treatmentHEP"
              value={formData.treatmentHEP}
              onChange={(e) =>
                setFormData({ ...formData, treatmentHEP: e.target.value })
              }
              placeholder="e.g. reviewed, advised to continue"
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="treatmentEducation" className="text-sm font-medium">
              Education
            </Label>
            <Textarea
              id="treatmentEducation"
              value={formData.treatmentEducation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  treatmentEducation: e.target.value,
                })
              }
              placeholder="e.g. Education and postural retraining"
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="treatmentRestrictions" className="text-sm font-medium">
              Restrictions
            </Label>
            <Input
              id="treatmentRestrictions"
              value={formData.treatmentRestrictions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  treatmentRestrictions: e.target.value,
                })
              }
              placeholder="..."
              className="mt-2 rounded-lg h-10 border-border focus-visible:ring-2"
            />
          </div>
          <div>
            <Label htmlFor="treatmentHandouts" className="text-sm font-medium">
              Print outs given to the patient
            </Label>
            <Textarea
              id="treatmentHandouts"
              value={formData.treatmentHandouts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  treatmentHandouts: e.target.value,
                })
              }
              placeholder="e.g. handouts given"
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={2}
            />
          </div>
        </FormSection>

        {/* Plan */}
        <FormSection title="Plan" icon={ClipboardList}>
          <div>
            <Label htmlFor="plan" className="text-sm font-medium">
              Plan
            </Label>
            <Textarea
              id="plan"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              placeholder="Follow-up, next steps..."
              className="mt-2 rounded-lg border-border focus-visible:ring-2"
              rows={3}
            />
          </div>
        </FormSection>
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 flex justify-end gap-3 pt-4 pb-1 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary hover:bg-primary/90 shadow-sm min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : initialData?.id ? (
            "Update assessment"
          ) : (
            "Create assessment"
          )}
        </Button>
      </div>
    </form>
  )
}
