"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FORM_SCHEMA_VERSION,
  generateFieldId,
  type FormField,
  type FormFieldCheckbox,
  type FormFieldDropdown,
  type FormFieldLongText,
  type FormFieldRadio,
  type FormFieldSection,
  type FormFieldShortText,
  type FormSchema,
  type FormFieldType,
} from "@/lib/form-schema"
import { cn } from "@/lib/utils"
import {
  GripVertical,
  Plus,
  Trash2,
  Type,
  ListChecks,
  CircleDot,
  ChevronDown,
  Heading1,
  AlignLeft,
  Loader2,
} from "lucide-react"

const FIELD_TYPES: { type: FormFieldType; label: string; icon: React.ReactNode }[] = [
  { type: "section", label: "Section header", icon: <Heading1 className="h-4 w-4" /> },
  { type: "short_text", label: "Short text", icon: <Type className="h-4 w-4" /> },
  { type: "long_text", label: "Long text (paragraph)", icon: <AlignLeft className="h-4 w-4" /> },
  { type: "checkbox", label: "Checkboxes (multiple)", icon: <ListChecks className="h-4 w-4" /> },
  { type: "radio", label: "Single choice (radio)", icon: <CircleDot className="h-4 w-4" /> },
  { type: "dropdown", label: "Dropdown", icon: <ChevronDown className="h-4 w-4" /> },
]

function createDefaultField(type: FormFieldType, id?: string): FormField {
  const fid = id ?? generateFieldId()
  switch (type) {
    case "section":
      return { id: fid, type: "section", label: "Section", title: "New section" }
    case "short_text":
      return { id: fid, type: "short_text", label: "Question", required: false }
    case "long_text":
      return { id: fid, type: "long_text", label: "Question", required: false }
    case "checkbox":
      return { id: fid, type: "checkbox", label: "Question", options: ["Option 1"], required: false }
    case "radio":
      return { id: fid, type: "radio", label: "Question", options: ["Option 1"], required: false }
    case "dropdown":
      return { id: fid, type: "dropdown", label: "Question", options: ["Option 1"], required: false }
    default:
      return { id: fid, type: "short_text", label: "Question", required: false }
  }
}

export interface FormBuilderProps {
  schema: FormSchema
  onChange: (schema: FormSchema) => void
  disabled?: boolean
  className?: string
}

export function FormBuilder({ schema, onChange, disabled, className }: FormBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addingType, setAddingType] = useState<FormFieldType | null>(null)

  const selectedField = schema.fields.find((f) => f.id === selectedId)

  const updateField = useCallback(
    (index: number, updates: Partial<FormField>) => {
      const next = [...schema.fields]
      const current = next[index] as FormField
      next[index] = { ...current, ...updates } as FormField
      onChange({ version: FORM_SCHEMA_VERSION, fields: next })
    },
    [schema.fields, onChange]
  )

  const addField = useCallback(
    (type: FormFieldType) => {
      setAddingType(type)
      const newField = createDefaultField(type)
      const next = { version: FORM_SCHEMA_VERSION, fields: [...schema.fields, newField] }
      onChange(next)
      setSelectedId(newField.id)
      setAddingType(null)
    },
    [schema.fields, onChange]
  )

  const removeField = useCallback(
    (index: number) => {
      const next = schema.fields.filter((_, i) => i !== index)
      const removedId = schema.fields[index]?.id
      if (removedId === selectedId) setSelectedId(next[0]?.id ?? null)
      onChange({ version: FORM_SCHEMA_VERSION, fields: next })
    },
    [schema.fields, onChange, selectedId]
  )

  const moveField = useCallback(
    (index: number, direction: "up" | "down") => {
      const i = direction === "up" ? index - 1 : index + 1
      if (i < 0 || i >= schema.fields.length) return
      const next = [...schema.fields]
      ;[next[index], next[i]] = [next[i], next[index]]
      onChange({ version: FORM_SCHEMA_VERSION, fields: next })
    },
    [schema.fields, onChange]
  )

  const addOption = useCallback(
    (fieldIndex: number) => {
      const f = schema.fields[fieldIndex]
      if (f.type !== "checkbox" && f.type !== "radio" && f.type !== "dropdown") return
      const opts = [...f.options, `Option ${f.options.length + 1}`]
      updateField(fieldIndex, { options: opts })
    },
    [schema.fields, updateField]
  )

  const updateOption = useCallback(
    (fieldIndex: number, optionIndex: number, value: string) => {
      const f = schema.fields[fieldIndex]
      if (f.type !== "checkbox" && f.type !== "radio" && f.type !== "dropdown") return
      const opts = [...f.options]
      opts[optionIndex] = value
      updateField(fieldIndex, { options: opts })
    },
    [schema.fields, updateField]
  )

  const removeOption = useCallback(
    (fieldIndex: number, optionIndex: number) => {
      const f = schema.fields[fieldIndex]
      if (f.type !== "checkbox" && f.type !== "radio" && f.type !== "dropdown") return
      if (f.options.length <= 1) return
      const opts = f.options.filter((_, i) => i !== optionIndex)
      updateField(fieldIndex, { options: opts })
    },
    [schema.fields, updateField]
  )

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        {FIELD_TYPES.map(({ type, label, icon }) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => addField(type)}
            className="gap-2"
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>

      <div className="space-y-2 border rounded-lg divide-y bg-muted/30">
        {schema.fields.map((field, index) => (
          <div
            key={field.id}
            className={cn(
              "p-3 flex gap-2 items-start transition-colors",
              selectedId === field.id && "bg-primary/5 ring-1 ring-primary/20 rounded-lg"
            )}
          >
            <div className="flex flex-col gap-0.5 pt-1 shrink-0">
              <button
                type="button"
                className="p-1 rounded hover:bg-muted text-muted-foreground"
                onClick={() => moveField(index, "up")}
                disabled={disabled || index === 0}
                aria-label="Move up"
              >
                <GripVertical className="h-4 w-4 rotate-90" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-muted text-muted-foreground"
                onClick={() => moveField(index, "down")}
                disabled={disabled || index === schema.fields.length - 1}
                aria-label="Move down"
              >
                <GripVertical className="h-4 w-4 -rotate-90" />
              </button>
            </div>
            <div
              className="flex-1 min-w-0 cursor-pointer rounded p-2 -m-2"
              onClick={() => setSelectedId(field.id)}
            >
              {field.type === "section" ? (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Section</span>
                  <Input
                    value={(field as FormFieldSection).title}
                    onChange={(e) => updateField(index, { title: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    disabled={disabled}
                    placeholder="Section title"
                    className="font-medium"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground capitalize">{field.type.replace("_", " ")}</span>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    disabled={disabled}
                    placeholder="Question or label"
                  />
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                removeField(index)
              }}
              aria-label="Remove field"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {selectedField && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h4 className="text-sm font-medium">Edit field</h4>
          {selectedField.type === "section" ? (
            <div className="space-y-2">
              <Label>Section title</Label>
              <Input
                value={(selectedField as FormFieldSection).title}
                onChange={(e) => {
                  const i = schema.fields.findIndex((f) => f.id === selectedField.id)
                  if (i >= 0) updateField(i, { title: e.target.value })
                }}
                disabled={disabled}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={selectedField.label}
                  onChange={(e) => {
                    const i = schema.fields.findIndex((f) => f.id === selectedField.id)
                    if (i >= 0) updateField(i, { label: e.target.value })
                  }}
                  disabled={disabled}
                />
              </div>
              {(selectedField.type === "short_text" || selectedField.type === "long_text") && (
                <div className="space-y-2">
                  <Label>Placeholder (optional)</Label>
                  <Input
                    value={
                      (selectedField as FormFieldShortText | FormFieldLongText).placeholder ?? ""
                    }
                    onChange={(e) => {
                      const i = schema.fields.findIndex((f) => f.id === selectedField.id)
                      if (i >= 0)
                        updateField(i, {
                          placeholder: e.target.value || undefined,
                        })
                    }
                    }
                    disabled={disabled}
                    placeholder="Placeholder text"
                  />
                </div>
              )}
              {(selectedField.type === "checkbox" || selectedField.type === "radio" || selectedField.type === "dropdown") && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {(selectedField as FormFieldCheckbox | FormFieldRadio | FormFieldDropdown).options.map(
                      (opt, oi) => (
                        <div key={oi} className="flex gap-2">
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const i = schema.fields.findIndex((f) => f.id === selectedField.id)
                              if (i >= 0) updateOption(i, oi, e.target.value)
                            }}
                            disabled={disabled}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={
                              disabled ||
                              (selectedField as FormFieldCheckbox).options.length <= 1
                            }
                            onClick={() => {
                              const i = schema.fields.findIndex((f) => f.id === selectedField.id)
                              if (i >= 0) removeOption(i, oi)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={() => {
                        const i = schema.fields.findIndex((f) => f.id === selectedField.id)
                        if (i >= 0) addOption(i)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add option
                    </Button>
                  </div>
                  {(selectedField.type === "checkbox" || selectedField.type === "radio") && (
                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox
                        id={`other-${selectedField.id}`}
                        checked={(selectedField as FormFieldCheckbox).allowOther ?? false}
                        onCheckedChange={(checked) => {
                          const i = schema.fields.findIndex((f) => f.id === selectedField.id)
                          if (i >= 0) updateField(i, { allowOther: checked === true })
                        }}
                        disabled={disabled}
                      />
                      <Label htmlFor={`other-${selectedField.id}`} className="text-sm font-normal">
                        Allow &quot;Other&quot; with custom text
                      </Label>
                    </div>
                  )}
                </div>
              )}
              {selectedField.type !== "section" && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`req-${selectedField.id}`}
                    checked={selectedField.required ?? false}
                    onCheckedChange={(checked) => {
                      const i = schema.fields.findIndex((f) => f.id === selectedField.id)
                      if (i >= 0) updateField(i, { required: checked === true })
                    }}
                    disabled={disabled}
                  />
                  <Label htmlFor={`req-${selectedField.id}`} className="text-sm font-normal">
                    Required
                  </Label>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
