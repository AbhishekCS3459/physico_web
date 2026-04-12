"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ConsentDocumentBlock } from "@/components/consent-document-block"
import {
  formatRimStrengthNotes,
  formatRomNotes,
  parseRimStrengthNotes,
  parseRomNotes,
  ROM_RIM_MOTION_LEGEND,
} from "@/lib/rom-rim-chart-notes"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export type DynamicFormFillerHandle = {
  serialize: () => string
}

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
  /** Shown in consent copy; defaults to "the patient" when omitted */
  patientDisplayName?: string
  /** Debounced auto-save after edits (default true). Set false for consent-only step. */
  enableAutoSave?: boolean
}

/** Keep consent block immediately after the main INITIAL ASSESSMENT title for older saved templates */
function orderFieldsWithConsentFirst(fields: FormField[]): FormField[] {
  const start = fields.findIndex(
    (f) => f.type === "section" && (f as FormFieldSection).title?.trim() === "Consent:",
  )
  if (start < 0) return fields
  const mainIdx = fields.findIndex(
    (f) =>
      f.type === "section" && Boolean((f as FormFieldSection).title?.includes("INITIAL")),
  )
  if (start === mainIdx + 1) return fields

  let end = start + 1
  while (end < fields.length && fields[end].type !== "section") {
    end++
  }
  const block = fields.slice(start, end)
  const without = [...fields.slice(0, start), ...fields.slice(end)]
  const newMainIdx = without.findIndex(
    (f) =>
      f.type === "section" && Boolean((f as FormFieldSection).title?.includes("INITIAL")),
  )
  const insertAt = newMainIdx >= 0 ? newMainIdx + 1 : 1
  return [...without.slice(0, insertAt), ...block, ...without.slice(insertAt)]
}

export const DynamicFormFiller = forwardRef<DynamicFormFillerHandle, DynamicFormFillerProps>(
  function DynamicFormFiller(
    {
      schemaJson,
      initialContent,
      editable,
      onSave,
      saving = false,
      onAfterDraftSave,
      className,
      patientDisplayName,
      enableAutoSave = true,
    },
    ref,
  ) {
  const schema = useMemo(() => parseFormSchema(schemaJson), [schemaJson])
  const orderedFields = useMemo(
    () => (schema ? orderFieldsWithConsentFirst(schema.fields) : []),
    [schema],
  )
  const consentPatientLabel = patientDisplayName?.trim() || "the patient"
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

  useImperativeHandle(ref, () => ({ serialize: () => serializeContent() }), [serializeContent])

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
    if (!enableAutoSave) return
    if (!editable || !dirty || !onSave) return
    const t = setTimeout(handleSave, 800)
    return () => clearTimeout(t)
  }, [enableAutoSave, editable, dirty, responses, onSave, handleSave])

  if (!schema || schema.fields.length === 0) {
    return (
      <div className={cn("rounded-lg border border-dashed p-8 text-center text-muted-foreground", className)}>
        No form fields defined. Edit the form template to add fields.
      </div>
    )
  }

  const CONSENT_SECTION_TITLE = "Consent:"
  const consentAskedOption = "Consent was discussed and the patient was asked to proceed (questions answered)"
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
      {orderedFields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={responses[field.id]}
          otherValue={responses[`${field.id}_other`] as string | undefined}
          editable={editable}
          patientDisplayName={consentPatientLabel}
          onValueChange={(v) => setResponse(field.id, v)}
          onOtherChange={(v) => setOtherText(field.id, v)}
        />
      ))}

      {/* Consent injection for existing templates missing Consent checkbox field. */}
      {!hasConsentAskedField && (
        <div className="pt-4 border-t space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{CONSENT_SECTION_TITLE}</h3>
          <ConsentDocumentBlock patientDisplayName={consentPatientLabel} />
          <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 flex items-start gap-3">
            <Checkbox
              checked={consentAskedChecked}
              onCheckedChange={(c) => {
                const checked = c === true
                setResponse("consent_asked", checked ? [consentAskedOption] : [])
              }}
              disabled={!editable}
              className="shrink-0 mt-0.5"
            />
            <Label className="text-sm font-medium leading-snug cursor-pointer select-none">
              {consentAskedOption}
            </Label>
          </div>
        </div>
      )}
    </div>
  )
})

DynamicFormFiller.displayName = "DynamicFormFiller"

interface FieldRendererProps {
  field: FormField
  value: string | string[] | null | undefined
  otherValue?: string
  editable: boolean
  patientDisplayName: string
  onValueChange: (v: string | string[] | null) => void
  onOtherChange: (v: string) => void
}

/** Form-template charts store ROM as one string; expand to labeled inputs (matches chart template form). */
function RomMotionFormBlock({
  label,
  required,
  editable,
  value,
  onValueChange,
}: {
  label: string
  required: boolean
  editable: boolean
  value: string
  onValueChange: (v: string | string[] | null) => void
}) {
  const rom = useMemo(() => parseRomNotes(value ?? ""), [value])
  const commit = (patch: Partial<typeof rom>) => {
    const next = { ...rom, ...patch }
    onValueChange(
      formatRomNotes(
        next.flexion,
        next.extension,
        next.abduction,
        next.adduction,
        next.internalRotation,
        next.externalRotation,
        next.additionalNotes,
      ),
    )
  }

  return (
    <div className="rounded-xl border-2 border-border/60 bg-muted/10 p-4 space-y-3">
      <div>
        <Label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ROM_RIM_MOTION_LEGEND}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(
          [
            ["flexion", "Flex (flexion)", rom.flexion] as const,
            ["extension", "Ext (extension)", rom.extension] as const,
            ["abduction", "Abd (abduction)", rom.abduction] as const,
            ["adduction", "Add (adduction)", rom.adduction] as const,
            ["internalRotation", "IR (internal rotation)", rom.internalRotation] as const,
            ["externalRotation", "ER (external rotation)", rom.externalRotation] as const,
          ] as const
        ).map(([key, sublabel, fieldVal]) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">{sublabel}</Label>
            {editable ? (
              <Input
                value={fieldVal}
                onChange={(e) => commit({ [key]: e.target.value } as Partial<typeof rom>)}
                placeholder="___"
                className="w-full sm:w-[120px] h-9 text-sm"
              />
            ) : (
              <p className="text-sm text-foreground">{fieldVal || "—"}</p>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-muted-foreground">Additional notes</Label>
        <Textarea
          value={rom.additionalNotes}
          onChange={(e) => commit({ additionalNotes: e.target.value })}
          placeholder="Add notes if needed…"
          className="min-h-[60px] text-sm resize-y rounded-lg border-border/80 bg-background focus-visible:ring-2"
          rows={2}
          readOnly={!editable}
        />
      </div>
    </div>
  )
}

function RimStrengthFormBlock({
  label,
  required,
  editable,
  value,
  onValueChange,
}: {
  label: string
  required: boolean
  editable: boolean
  value: string
  onValueChange: (v: string | string[] | null) => void
}) {
  const rim = useMemo(() => parseRimStrengthNotes(value ?? ""), [value])
  const commit = (patch: Partial<typeof rim>) => {
    const next = { ...rim, ...patch }
    onValueChange(
      formatRimStrengthNotes(
        next.flexion,
        next.extension,
        next.abduction,
        next.adduction,
        next.internalRotation,
        next.externalRotation,
        next.additionalNotes,
      ),
    )
  }

  return (
    <div className="rounded-xl border-2 border-border/60 bg-muted/10 p-4 space-y-3">
      <div>
        <Label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ROM_RIM_MOTION_LEGEND}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(
          [
            ["flexion", "Flex (flexion)", rim.flexion] as const,
            ["extension", "Ext (extension)", rim.extension] as const,
            ["abduction", "Abd (abduction)", rim.abduction] as const,
            ["adduction", "Add (adduction)", rim.adduction] as const,
            ["internalRotation", "IR (internal rotation)", rim.internalRotation] as const,
            ["externalRotation", "ER (external rotation)", rim.externalRotation] as const,
          ] as const
        ).map(([key, sublabel, fieldVal]) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">{sublabel}</Label>
            {editable ? (
              <Select
                value={fieldVal || undefined}
                onValueChange={(v) => commit({ [key]: v } as Partial<typeof rim>)}
              >
                <SelectTrigger className="w-full sm:w-[100px] h-9 text-sm">
                  <SelectValue placeholder="—/5" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}/5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-foreground">{fieldVal ? `${fieldVal}/5` : "—/5"}</p>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-muted-foreground">Additional notes</Label>
        <Textarea
          value={rim.additionalNotes}
          onChange={(e) => commit({ additionalNotes: e.target.value })}
          placeholder="Add notes if needed…"
          className="min-h-[60px] text-sm resize-y rounded-lg border-border/80 bg-background focus-visible:ring-2"
          rows={2}
          readOnly={!editable}
        />
      </div>
    </div>
  )
}

function FieldRenderer({
  field,
  value,
  otherValue,
  editable,
  patientDisplayName,
  onValueChange,
  onOtherChange,
}: FieldRendererProps) {
  if (field.type === "section") {
    const isConsentSection = field.title?.trim() === "Consent:"
    return (
      <div className="pt-4 border-t first:border-t-0 first:pt-0">
        <h3 className="text-lg font-semibold text-foreground">{(field as FormFieldSection).title}</h3>
        {isConsentSection && (
          <div className="pt-4">
            <ConsentDocumentBlock patientDisplayName={patientDisplayName} />
          </div>
        )}
      </div>
    )
  }

  const required = field.required ?? false
  const val = value ?? null
  const stringVal = typeof val === "string" ? val : ""

  if (
    field.id === "rom" &&
    (field.type === "short_text" || field.type === "long_text")
  ) {
    const f = field as FormFieldShortText | FormFieldLongText
    return (
      <RomMotionFormBlock
        label={f.label}
        required={required}
        editable={editable}
        value={stringVal}
        onValueChange={onValueChange}
      />
    )
  }

  if (
    field.id === "strength" &&
    (field.type === "short_text" || field.type === "long_text")
  ) {
    const f = field as FormFieldShortText | FormFieldLongText
    return (
      <RimStrengthFormBlock
        label={f.label}
        required={required}
        editable={editable}
        value={stringVal}
        onValueChange={onValueChange}
      />
    )
  }

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
