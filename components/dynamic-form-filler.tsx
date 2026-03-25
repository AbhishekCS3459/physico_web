"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  createEmptyResponses,
  parseFormResponses,
  parseFormSchema,
  type FormField,
  type FormFieldCheckbox,
  type FormFieldDropdown,
  type FormFieldLongText,
  type FormFieldRadio,
  type FormFieldSection,
  type FormFieldShortText,
  type FormSchema,
  type FormResponses,
} from "@/lib/form-schema"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface DynamicFormFillerProps {
  /** JSON string of FormSchema */
  schemaJson: string
  /** JSON string of current responses (from chart content) */
  initialContent: string | null
  editable: boolean
  onSave?: (content: string) => void | Promise<void> | Promise<boolean>
  saving?: boolean
  /** If provided, shows "Save as draft & close" and calls after successful save */
  onAfterDraftSave?: () => void
  className?: string
}

export function DynamicFormFiller({
  schemaJson,
  initialContent,
  editable,
  onSave,
  saving = false,
  onAfterDraftSave,
  className,
}: DynamicFormFillerProps) {
  const schema = useMemo(() => parseFormSchema(schemaJson), [schemaJson])
  const initialResponses = useMemo(
    () => (schema ? parseFormResponses(initialContent) : {}),
    [schema, initialContent]
  )

  const [responses, setResponses] = useState<FormResponses>(() =>
    schema ? { ...createEmptyResponses(schema), ...initialResponses } : {}
  )
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!schema) return
    setResponses((prev) => ({ ...createEmptyResponses(schema), ...parseFormResponses(initialContent), ...prev }))
  }, [schema, initialContent])

  const setResponse = useCallback((fieldId: string, value: string | string[] | null) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
    setDirty(true)
  }, [])

  const setOtherText = useCallback((fieldId: string, text: string) => {
    setResponses((prev) => ({ ...prev, [`${fieldId}_other`]: text }))
    setDirty(true)
  }, [])

  const serializeContent = useCallback((): string => {
    if (!schema) return "{}"
    const toStore: FormResponses = {}
    for (const f of schema.fields) {
      if (f.type === "section") continue
      const v = responses[f.id]
      if (v !== undefined) toStore[f.id] = v
      const otherKey = `${f.id}_other`
      if (responses[otherKey] !== undefined && responses[otherKey] !== null && responses[otherKey] !== "") {
        toStore[otherKey] = responses[otherKey] as string
      }
    }
    // Persist consent checkbox even if the current template schema doesn't include it.
    const consentAsked = responses["consent_asked"]
    if (consentAsked !== undefined) toStore["consent_asked"] = consentAsked
    return JSON.stringify(toStore)
  }, [schema, responses])

  const handleSave = useCallback(async () => {
    if (!onSave || !schema || !dirty) return
    const result = await onSave(serializeContent())
    if (result !== false) setDirty(false)
  }, [onSave, schema, dirty, serializeContent])

  const handleSaveDraftAndClose = useCallback(async () => {
    if (!onSave || !schema || !onAfterDraftSave) return
    const result = await onSave(serializeContent())
    if (result !== false) {
      setDirty(false)
      onAfterDraftSave()
    }
  }, [onSave, schema, onAfterDraftSave, serializeContent])

  useEffect(() => {
    if (!editable || !dirty || !onSave) return
    const t = setTimeout(handleSave, 800)
    return () => clearTimeout(t)
  }, [editable, dirty, responses, onSave, handleSave])

  if (!schema || schema.fields.length === 0) {
    return (
      <div className={cn("rounded-lg border border-dashed p-8 text-center text-muted-foreground", className)}>
        No form fields defined. Edit the form template to add fields.
      </div>
    )
  }

  const CONSENT_SECTION_TITLE = "Consent:"
  const consentAskedOption = "Consent was discussed and the patient was asked to proceed (questions answered)"
  const hasConsentSection = schema.fields.some((f) => f.type === "section" && (f as any).title?.trim() === CONSENT_SECTION_TITLE)
  const hasConsentAskedField = schema.fields.some((f) => f.id === "consent_asked")
  const consentAskedValues = responses["consent_asked"]
  const consentAskedChecked =
    Array.isArray(consentAskedValues) &&
    consentAskedValues.map((s) => String(s).toLowerCase()).includes(consentAskedOption.toLowerCase())

  return (
    <div className={cn("space-y-6", className)}>
      {editable && onSave && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="rounded-lg shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save chart"
            )}
          </Button>
          {onAfterDraftSave && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleSaveDraftAndClose}
              disabled={saving}
              className="rounded-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save as draft & close"
              )}
            </Button>
          )}
        </div>
      )}
      {saving && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving…
        </div>
      )}
      {schema.fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={responses[field.id]}
          otherValue={responses[`${field.id}_other`] as string | undefined}
          editable={editable}
          onValueChange={(v) => setResponse(field.id, v)}
          onOtherChange={(v) => setOtherText(field.id, v)}
        />
      ))}

      {/* Consent injection for existing templates missing Consent checkbox field. */}
      {!hasConsentAskedField && (
        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold text-foreground">{CONSENT_SECTION_TITLE}</h3>
          <div className="space-y-3 pt-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={consentAskedChecked}
                onCheckedChange={(c) => {
                  const checked = c === true
                  setResponse("consent_asked", checked ? [consentAskedOption] : [])
                }}
                disabled={!editable}
                className="shrink-0 mt-1"
              />
              <div className="flex-1">
                <Label className="text-sm font-medium cursor-pointer select-none">{consentAskedOption}</Label>
              </div>
            </div>

            {!hasConsentSection && (
              <div className="space-y-2 text-sm text-muted-foreground whitespace-pre-wrap">
                <p>
                  D Patt was provided with information about who will perform the treatment/procedure(s) Bharat
                  Vishembera, PT and who may provide assistance in her care.
                </p>
                <p>
                  The scope of the treatment/procedure(s) plans/interventions and/or list of agreed upon
                  treatment/procedure(s), that are clinically indicated and approved for the condition were explained.
                </p>
                <p>
                  The potential benefits, limitations, and possible risks of the assessment/treatment/intervention were
                  discussed.
                </p>
                <p>D Patt received the opportunity to ask questions.</p>
                <p>D Patt Patterson provided consent to proceed with the visit.</p>
                <p>
                  D Patt was informed that she had the right to discontinue the appointment at any time. The decision
                  to accept or refuse a treatment/procedure(s) shall not prejudice her access to ongoing or future
                  health care.
                </p>
                <p>Bharat Vishembera</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface FieldRendererProps {
  field: FormField
  value: string | string[] | null | undefined
  otherValue?: string
  editable: boolean
  onValueChange: (v: string | string[] | null) => void
  onOtherChange: (v: string) => void
}

function FieldRenderer({
  field,
  value,
  otherValue,
  editable,
  onValueChange,
  onOtherChange,
}: FieldRendererProps) {
  if (field.type === "section") {
    const isConsentSection = field.title?.trim() === "Consent:"
    return (
      <div className="pt-4 border-t first:border-t-0 first:pt-0">
        <h3 className="text-lg font-semibold text-foreground">{(field as FormFieldSection).title}</h3>
        {isConsentSection && (
          <div className="space-y-2 pt-3 text-sm text-muted-foreground whitespace-pre-wrap">
            <p>
              D Patt was provided with information about who will perform the treatment/procedure(s) Bharat Vishembera, PT and who may provide assistance in her care.
            </p>
            <p>
              The scope of the treatment/procedure(s) plans/interventions and/or list of agreed upon treatment/procedure(s), that are clinically indicated and approved for the condition were explained.
            </p>
            <p>
              The potential benefits, limitations, and possible risks of the assessment/treatment/intervention were discussed.
            </p>
            <p>D Patt received the opportunity to ask questions.</p>
            <p>D Patt Patterson provided consent to proceed with the visit.</p>
            <p>
              D Patt was informed that she had the right to discontinue the appointment at any time. The decision to accept or refuse a treatment/procedure(s) shall not prejudice her access to ongoing or future health care.
            </p>
            <p>Bharat Vishembera</p>
          </div>
        )}
      </div>
    )
  }

  const required = field.required ?? false
  const val = value ?? null

  if (field.type === "short_text") {
    const f = field as FormFieldShortText
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {f.label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <Input
          value={(val as string) ?? ""}
          onChange={(e) => onValueChange(e.target.value || null)}
          placeholder={f.placeholder}
          disabled={!editable}
          className="max-w-md"
        />
      </div>
    )
  }

  if (field.type === "long_text") {
    const f = field as FormFieldLongText
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {f.label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <Textarea
          value={(val as string) ?? ""}
          onChange={(e) => onValueChange(e.target.value || null)}
          placeholder={f.placeholder}
          disabled={!editable}
          rows={4}
          className="resize-y"
        />
      </div>
    )
  }

  if (field.type === "checkbox") {
    const f = field as FormFieldCheckbox
    const selected = Array.isArray(val) ? val : []
    const hasOther = f.allowOther && selected.some((s) => String(s).toLowerCase() === "other")

    const toggle = (option: string, checked: boolean) => {
      const optLower = option.toLowerCase()
      if (optLower === "none") {
        onValueChange(checked ? ["None"] : [])
        return
      }
      if (checked) {
        const next = selected.filter((s) => String(s).toLowerCase() !== "none")
        if (!next.includes(option)) next.push(option)
        onValueChange(next)
      } else {
        onValueChange(selected.filter((s) => String(s) !== option))
      }
    }

    const options = f.options.slice()
    if (f.allowOther) options.push("Other")

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {f.label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {options.map((opt) => (
            <label
              key={opt}
              className={cn(
                "flex items-center gap-2 cursor-pointer text-sm",
                !editable && "cursor-default"
              )}
            >
              <Checkbox
                checked={
                  opt.toLowerCase() === "none"
                    ? selected.length === 1 && String(selected[0]).toLowerCase() === "none"
                    : selected.map((s) => String(s).toLowerCase()).includes(opt.toLowerCase())
                }
                onCheckedChange={(c) => toggle(opt, c === true)}
                disabled={!editable}
                className="shrink-0"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {hasOther && (
          <div className="pt-1">
            <Label className="text-xs text-muted-foreground">Describe other</Label>
            <Input
              value={otherValue ?? ""}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder="Describe what “Other” refers to…"
              disabled={!editable}
              className="mt-1 max-w-md"
            />
          </div>
        )}
      </div>
    )
  }

  if (field.type === "radio") {
    const f = field as FormFieldRadio
    const selected = typeof val === "string" ? val : null
    const hasOther = f.allowOther && selected?.toLowerCase() === "other"
    const options = f.options.slice()
    if (f.allowOther) options.push("Other")

    const setSingle = (option: string) => {
      if (option.toLowerCase() === "none") {
        onValueChange("None")
        return
      }
      onValueChange(option)
    }

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {f.label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {options.map((opt) => (
            <label
              key={opt}
              className={cn(
                "flex items-center gap-2 cursor-pointer text-sm",
                !editable && "cursor-default"
              )}
            >
              <input
                type="radio"
                name={field.id}
                checked={(selected ?? "").toLowerCase() === opt.toLowerCase()}
                onChange={() => setSingle(opt)}
                disabled={!editable}
                className="h-4 w-4 rounded-full border-input"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {hasOther && (
          <div className="pt-1">
            <Label className="text-xs text-muted-foreground">Describe other</Label>
            <Input
              value={otherValue ?? ""}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder="Describe what “Other” refers to…"
              disabled={!editable}
              className="mt-1 max-w-md"
            />
          </div>
        )}
      </div>
    )
  }

  if (field.type === "dropdown") {
    const f = field as FormFieldDropdown
    const selected = typeof val === "string" ? val : null
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {f.label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <select
          value={selected ?? ""}
          onChange={(e) => onValueChange(e.target.value || null)}
          disabled={!editable}
          className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select…</option>
          {f.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return null
}
