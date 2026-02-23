"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import toast from "react-hot-toast"
import { RefreshCw } from "lucide-react"

interface InitialAssessmentFormProps {
  bookingId: string
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: any
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
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="reasonForReferral">Reason for Referral</Label>
          <Textarea
            id="reasonForReferral"
            value={formData.reasonForReferral}
            onChange={(e) =>
              setFormData({ ...formData, reasonForReferral: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={3}
            required
          />
        </div>

        <div>
          <Label htmlFor="hpi">HPI</Label>
          <Textarea
            id="hpi"
            value={formData.hpi}
            onChange={(e) => setFormData({ ...formData, hpi: e.target.value })}
            placeholder="***"
            className="mt-2"
            rows={4}
          />
        </div>

        <div>
          <Label>Pain description</Label>
          <Textarea
            value={formData.painDescription}
            onChange={(e) =>
              setFormData({ ...formData, painDescription: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="painLevel">Pain /10</Label>
            <Input
              id="painLevel"
              type="text"
              value={formData.painLevel}
              onChange={(e) =>
                setFormData({ ...formData, painLevel: e.target.value })
              }
              placeholder="e.g., 7"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Intermittent / Constant</Label>
            <RadioGroup
              value={formData.painType}
              onValueChange={(value) =>
                setFormData({ ...formData, painType: value })
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Intermittent" id="intermittent" />
                <Label htmlFor="intermittent" className="font-normal cursor-pointer">
                  Intermittent
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Constant" id="constant" />
                <Label htmlFor="constant" className="font-normal cursor-pointer">
                  Constant
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label htmlFor="whatMakesWorse">What make the pain worse</Label>
          <Textarea
            id="whatMakesWorse"
            value={formData.whatMakesWorse}
            onChange={(e) =>
              setFormData({ ...formData, whatMakesWorse: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="whatHelps">What helps</Label>
          <Textarea
            id="whatHelps"
            value={formData.whatHelps}
            onChange={(e) =>
              setFormData({ ...formData, whatHelps: e.target.value })
            }
            placeholder="e.g., Rest, Pain medication, Heat/ cold pack"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="pmhx">PMHx</Label>
          <Textarea
            id="pmhx"
            value={formData.pmhx}
            onChange={(e) => setFormData({ ...formData, pmhx: e.target.value })}
            placeholder="***"
            className="mt-2"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="associatedImaging">Associated/Relevant Imaging</Label>
          <Textarea
            id="associatedImaging"
            value={formData.associatedImaging}
            onChange={(e) =>
              setFormData({ ...formData, associatedImaging: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="baselineActivity">
            Baseline Physical Activity/occupation/leisure activities
          </Label>
          <Textarea
            id="baselineActivity"
            value={formData.baselineActivity}
            onChange={(e) =>
              setFormData({ ...formData, baselineActivity: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="observation">Observation</Label>
          <Textarea
            id="observation"
            value={formData.observation}
            onChange={(e) =>
              setFormData({ ...formData, observation: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="swellingCirculation">Swelling/circulation</Label>
          <Textarea
            id="swellingCirculation"
            value={formData.swellingCirculation}
            onChange={(e) =>
              setFormData({ ...formData, swellingCirculation: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="romInitial">ROM</Label>
          <Textarea
            id="romInitial"
            value={formData.romInitial}
            onChange={(e) =>
              setFormData({ ...formData, romInitial: e.target.value })
            }
            placeholder="Flex: ___, Abd: ___"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="strengthInitial">RIM/Strength</Label>
          <Textarea
            id="strengthInitial"
            value={formData.strengthInitial}
            onChange={(e) =>
              setFormData({ ...formData, strengthInitial: e.target.value })
            }
            placeholder="Flex /5, Abd /5"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="neuro">Neuro (screening, reflexes, tension tests)</Label>
          <Textarea
            id="neuro"
            value={formData.neuro}
            onChange={(e) => setFormData({ ...formData, neuro: e.target.value })}
            placeholder="***"
            className="mt-2"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="palpation">Palpation</Label>
          <Textarea
            id="palpation"
            value={formData.palpation}
            onChange={(e) =>
              setFormData({ ...formData, palpation: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="specialTests">Special Tests/Outcome measures</Label>
          <Textarea
            id="specialTests"
            value={formData.specialTests}
            onChange={(e) =>
              setFormData({ ...formData, specialTests: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="clinicalImpression">Clinical Impression/Analysis</Label>
          <Textarea
            id="clinicalImpression"
            value={formData.clinicalImpression}
            onChange={(e) =>
              setFormData({ ...formData, clinicalImpression: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="goals">Goal</Label>
          <Textarea
            id="goals"
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            placeholder="***"
            className="mt-2"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="treatment">Treatment</Label>
          <Textarea
            id="treatment"
            value={formData.treatment}
            onChange={(e) =>
              setFormData({ ...formData, treatment: e.target.value })
            }
            placeholder="***"
            className="mt-2"
            rows={2}
          />
        </div>

        {/* Treatment subsection */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Treatment</h3>
          <div>
            <Label htmlFor="treatmentModality">Modality</Label>
            <Input
              id="treatmentModality"
              value={formData.treatmentModality}
              onChange={(e) =>
                setFormData({ ...formData, treatmentModality: e.target.value })
              }
              placeholder="***"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="treatmentROM">ROM</Label>
            <Input
              id="treatmentROM"
              value={formData.treatmentROM}
              onChange={(e) =>
                setFormData({ ...formData, treatmentROM: e.target.value })
              }
              placeholder="***"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="treatmentStrengthening">Strengthening</Label>
            <Input
              id="treatmentStrengthening"
              value={formData.treatmentStrengthening}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  treatmentStrengthening: e.target.value,
                })
              }
              placeholder="***"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="treatmentStretching">Stretching</Label>
            <Input
              id="treatmentStretching"
              value={formData.treatmentStretching}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  treatmentStretching: e.target.value,
                })
              }
              placeholder="***"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="treatmentHEP">HEP</Label>
            <Textarea
              id="treatmentHEP"
              value={formData.treatmentHEP}
              onChange={(e) =>
                setFormData({ ...formData, treatmentHEP: e.target.value })
              }
              placeholder="e.g., reviewed advised to continue"
              className="mt-2"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="treatmentEducation">Education</Label>
            <Textarea
              id="treatmentEducation"
              value={formData.treatmentEducation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  treatmentEducation: e.target.value,
                })
              }
              placeholder="e.g., Education and postural retraining."
              className="mt-2"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="treatmentRestrictions">Restrictions</Label>
            <Input
              id="treatmentRestrictions"
              value={formData.treatmentRestrictions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  treatmentRestrictions: e.target.value,
                })
              }
              placeholder="***"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="treatmentHandouts">Print outs given to the patient</Label>
            <Textarea
              id="treatmentHandouts"
              value={formData.treatmentHandouts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  treatmentHandouts: e.target.value,
                })
              }
              placeholder="e.g., print outs given to the patient."
              className="mt-2"
              rows={2}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="plan">Plan</Label>
          <Textarea
            id="plan"
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            placeholder="***"
            className="mt-2"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : initialData?.id ? (
            "Update Assessment"
          ) : (
            "Create Assessment"
          )}
        </Button>
      </div>
    </form>
  )
}

