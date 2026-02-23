"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import toast from "react-hot-toast"
import { RefreshCw } from "lucide-react"

interface FollowupAssessmentFormProps {
  bookingId: string
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: any
}

export function FollowupAssessmentForm({
  bookingId,
  onSuccess,
  onCancel,
  initialData,
}: FollowupAssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    assessmentType: "followup" as const,
    // Subjective
    subjectivePain: initialData?.subjectivePain || "",
    subjectiveActivity: initialData?.subjectiveActivity || "",
    subjectiveExercises: initialData?.subjectiveExercises || "",
    subjectiveModalities: initialData?.subjectiveModalities || "",
    subjectiveMedications: initialData?.subjectiveMedications || "",
    // Objective
    objectiveFindings: initialData?.objectiveFindings || "",
    romFollowupFlexion: initialData?.romFollowupFlexion || "",
    romFollowupAbduction: initialData?.romFollowupAbduction || "",
    strengthFollowupFlexion: initialData?.strengthFollowupFlexion || "",
    strengthFollowupAbduction: initialData?.strengthFollowupAbduction || "",
    palpation: initialData?.palpation || "",
    // Assessment
    assessmentModalities: initialData?.assessmentModalities || "",
    assessmentROM: initialData?.assessmentROM || "",
    assessmentStrengthening: initialData?.assessmentStrengthening || "",
    assessmentHEP: initialData?.assessmentHEP || "",
    assessmentEducation: initialData?.assessmentEducation || "",
    assessmentRestrictions: initialData?.assessmentRestrictions || "",
    assessmentHandouts: initialData?.assessmentHandouts || "",
    // Treatment
    treatmentModality: initialData?.treatmentModality || "",
    treatmentROM: initialData?.treatmentROM || "",
    treatmentStrengthening: initialData?.treatmentStrengthening || "",
    treatmentStretching: initialData?.treatmentStretching || "",
    treatmentHEP: initialData?.treatmentHEP || "",
    treatmentEducation: initialData?.treatmentEducation || "",
    treatmentRestrictions: initialData?.treatmentRestrictions || "",
    treatmentHandouts: initialData?.treatmentHandouts || "",
    // Plan
    plan: initialData?.plan || "",
    planAxStrength: initialData?.planAxStrength || "",
    planAxROM: initialData?.planAxROM || "",
    planExerciseProgression: initialData?.planExerciseProgression || "",
  })

  const handleCheckboxChange = (
    field: string,
    checked: boolean,
    value: string
  ) => {
    const currentValue = formData[field as keyof typeof formData] as string
    if (checked) {
      setFormData({
        ...formData,
        [field]: currentValue
          ? `${currentValue}, ${value}`
          : value,
      })
    } else {
      setFormData({
        ...formData,
        [field]: currentValue
          .split(", ")
          .filter((item) => item !== value)
          .join(", "),
      })
    }
  }

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
            : "Follow-up assessment created successfully"
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
      {/* SUBJECTIVE SECTION */}
      <div className="space-y-4 border-b pb-4">
        <h3 className="text-lg font-semibold">Subjective</h3>

        <div>
          <Label htmlFor="subjectivePain">Pain</Label>
          <Textarea
            id="subjectivePain"
            value={formData.subjectivePain}
            onChange={(e) =>
              setFormData({ ...formData, subjectivePain: e.target.value })
            }
            placeholder="e.g., Right Shoulder pain lot better, able to move arm more with less pain."
            className="mt-2"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="subjectiveActivity">Activity</Label>
          <Textarea
            id="subjectiveActivity"
            value={formData.subjectiveActivity}
            onChange={(e) =>
              setFormData({ ...formData, subjectiveActivity: e.target.value })
            }
            placeholder="e.g., Still having discomfort with internal rotation."
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="subjectiveExercises">Exercises</Label>
          <Textarea
            id="subjectiveExercises"
            value={formData.subjectiveExercises}
            onChange={(e) =>
              setFormData({ ...formData, subjectiveExercises: e.target.value })
            }
            placeholder="e.g., Performing prescribed exercises regularly."
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="subjectiveModalities">Applying heat</Label>
          <Textarea
            id="subjectiveModalities"
            value={formData.subjectiveModalities}
            onChange={(e) =>
              setFormData({ ...formData, subjectiveModalities: e.target.value })
            }
            placeholder="e.g., Applying heat regularly."
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="subjectiveMedications">Medications</Label>
          <Textarea
            id="subjectiveMedications"
            value={formData.subjectiveMedications}
            onChange={(e) =>
              setFormData({
                ...formData,
                subjectiveMedications: e.target.value,
              })
            }
            placeholder="e.g., Taking pain meds as needed."
            className="mt-2"
            rows={2}
          />
        </div>
      </div>

      {/* OBJECTIVE SECTION */}
      <div className="space-y-4 border-b pb-4">
        <h3 className="text-lg font-semibold">Objective</h3>

        <div>
          <Label>Range of Motion</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <Label htmlFor="romFollowupFlexion" className="text-sm font-normal">
                Flex
              </Label>
              <Input
                id="romFollowupFlexion"
                value={formData.romFollowupFlexion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    romFollowupFlexion: e.target.value,
                  })
                }
                placeholder="deg pain"
              />
            </div>
            <div>
              <Label
                htmlFor="romFollowupAbduction"
                className="text-sm font-normal"
              >
                Abd
              </Label>
              <Input
                id="romFollowupAbduction"
                value={formData.romFollowupAbduction}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    romFollowupAbduction: e.target.value,
                  })
                }
                placeholder="Within functional limits"
              />
            </div>
          </div>
        </div>

        <div>
          <Label>Strength Flex /5, Abd /5</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <Label
                htmlFor="strengthFollowupFlexion"
                className="text-sm font-normal"
              >
                Flex
              </Label>
              <Input
                id="strengthFollowupFlexion"
                value={formData.strengthFollowupFlexion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    strengthFollowupFlexion: e.target.value,
                  })
                }
                placeholder="/5"
              />
            </div>
            <div>
              <Label
                htmlFor="strengthFollowupAbduction"
                className="text-sm font-normal"
              >
                Abd
              </Label>
              <Input
                id="strengthFollowupAbduction"
                value={formData.strengthFollowupAbduction}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    strengthFollowupAbduction: e.target.value,
                  })
                }
                placeholder="/5"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="palpation">Tenderness</Label>
          <Textarea
            id="palpation"
            value={formData.palpation}
            onChange={(e) =>
              setFormData({ ...formData, palpation: e.target.value })
            }
            placeholder="e.g., Tenderness present."
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="objectiveFindings">Additional Objective Findings</Label>
          <Textarea
            id="objectiveFindings"
            value={formData.objectiveFindings}
            onChange={(e) =>
              setFormData({
                ...formData,
                objectiveFindings: e.target.value,
              })
            }
            placeholder="Enter any additional objective findings"
            className="mt-2"
            rows={3}
          />
        </div>
      </div>

      {/* ASSESSMENT SECTION */}
      <div className="space-y-4 border-b pb-4">
        <h3 className="text-lg font-semibold">Assessment</h3>

        <div>
          <Label htmlFor="assessmentModalities">Modality</Label>
          <Textarea
            id="assessmentModalities"
            value={formData.assessmentModalities}
            onChange={(e) =>
              setFormData({
                ...formData,
                assessmentModalities: e.target.value,
              })
            }
            placeholder="e.g., Applied as indicated."
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="assessmentROM">ROM</Label>
          <Textarea
            id="assessmentROM"
            value={formData.assessmentROM}
            onChange={(e) =>
              setFormData({ ...formData, assessmentROM: e.target.value })
            }
            placeholder="e.g., Improving."
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="assessmentStrengthening">Strengthening</Label>
          <Textarea
            id="assessmentStrengthening"
            value={formData.assessmentStrengthening}
            onChange={(e) =>
              setFormData({
                ...formData,
                assessmentStrengthening: e.target.value,
              })
            }
            placeholder="e.g., Ongoing."
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="assessmentHEP">HEP</Label>
          <Textarea
            id="assessmentHEP"
            value={formData.assessmentHEP}
            onChange={(e) =>
              setFormData({ ...formData, assessmentHEP: e.target.value })
            }
            placeholder="e.g., reviewed advised to continue"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="assessmentEducation">Education</Label>
          <Textarea
            id="assessmentEducation"
            value={formData.assessmentEducation}
            onChange={(e) =>
              setFormData({
                ...formData,
                assessmentEducation: e.target.value,
              })
            }
            placeholder="e.g., Provided."
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="assessmentRestrictions">Restrictions</Label>
          <Textarea
            id="assessmentRestrictions"
            value={formData.assessmentRestrictions}
            onChange={(e) =>
              setFormData({
                ...formData,
                assessmentRestrictions: e.target.value,
              })
            }
            placeholder="e.g., Discussed."
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="assessmentHandouts">Print outs given to the patient</Label>
          <Textarea
            id="assessmentHandouts"
            value={formData.assessmentHandouts}
            onChange={(e) =>
              setFormData({
                ...formData,
                assessmentHandouts: e.target.value,
              })
            }
            placeholder="e.g., Print outs given to the patient."
            className="mt-2"
            rows={2}
          />
        </div>
      </div>

      {/* TREATMENT SECTION */}
      <div className="space-y-4 border-b pb-4">
        <h3 className="text-lg font-semibold">Treatment</h3>

        <div>
          <Label htmlFor="treatmentModality">Modality</Label>
          <Textarea
            id="treatmentModality"
            value={formData.treatmentModality}
            onChange={(e) =>
              setFormData({ ...formData, treatmentModality: e.target.value })
            }
            placeholder="Enter modality treatment"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="treatmentROM">ROM</Label>
          <Textarea
            id="treatmentROM"
            value={formData.treatmentROM}
            onChange={(e) =>
              setFormData({ ...formData, treatmentROM: e.target.value })
            }
            placeholder="Enter ROM treatment"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="treatmentStrengthening">Strengthening</Label>
          <Textarea
            id="treatmentStrengthening"
            value={formData.treatmentStrengthening}
            onChange={(e) =>
              setFormData({
                ...formData,
                treatmentStrengthening: e.target.value,
              })
            }
            placeholder="Enter strengthening treatment"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="treatmentStretching">Stretching</Label>
          <Textarea
            id="treatmentStretching"
            value={formData.treatmentStretching}
            onChange={(e) =>
              setFormData({
                ...formData,
                treatmentStretching: e.target.value,
              })
            }
            placeholder="Enter stretching treatment"
            className="mt-2"
            rows={2}
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
            placeholder="e.g., Reviewed, advised to continue"
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
            placeholder="e.g., Education and postural retraining"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="treatmentRestrictions">Restrictions</Label>
          <Textarea
            id="treatmentRestrictions"
            value={formData.treatmentRestrictions}
            onChange={(e) =>
              setFormData({
                ...formData,
                treatmentRestrictions: e.target.value,
              })
            }
            placeholder="Enter restrictions"
            className="mt-2"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="treatmentHandouts">Handouts</Label>
          <Textarea
            id="treatmentHandouts"
            value={formData.treatmentHandouts}
            onChange={(e) =>
              setFormData({
                ...formData,
                treatmentHandouts: e.target.value,
              })
            }
            placeholder="e.g., Print outs given to the patient."
            className="mt-2"
            rows={2}
          />
        </div>
      </div>

      {/* PLAN SECTION */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Plan</h3>

        <div>
          <Label htmlFor="planAxStrength">Ax strength</Label>
          <Input
            id="planAxStrength"
            value={formData.planAxStrength}
            onChange={(e) =>
              setFormData({ ...formData, planAxStrength: e.target.value })
            }
            placeholder="e.g., Continue strengthening"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="planAxROM">Ax Range of Motion</Label>
          <Input
            id="planAxROM"
            value={formData.planAxROM}
            onChange={(e) =>
              setFormData({ ...formData, planAxROM: e.target.value })
            }
            placeholder="e.g., Continue ROM exercises"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="planExerciseProgression">Exercise progression</Label>
          <Textarea
            id="planExerciseProgression"
            value={formData.planExerciseProgression}
            onChange={(e) =>
              setFormData({
                ...formData,
                planExerciseProgression: e.target.value,
              })
            }
            placeholder="e.g., Progress exercises as tolerated"
            className="mt-2"
            rows={2}
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

