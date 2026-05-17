"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
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
  parseChartDoc,
  serializeChartDoc,
  type ParsedChartDoc,
  type ChartSection,
  type CheckboxLine,
} from "@/lib/chart-template-parser"
import { interpolatePatientNameInTipTapJson } from "@/lib/consent-copy"
import {
  formatRimStrengthNotes,
  formatRomNotes,
  parseRimStrengthNotes,
  parseRomNotes,
  ROM_RIM_MOTION_LEGEND,
} from "@/lib/rom-rim-chart-notes"
import { cn } from "@/lib/utils"
import { FileText, Loader2 } from "lucide-react"
import RichNotesEditor from "./RichNotesEditor"

/** Treatment section: row labels and multiple-choice options (radio) per row */
const TREATMENT_ROW_LABELS = [
  "Modality",
  "ROM",
  "Strengthening",
  "Stretching",
  "HEP",
  "Education",
  "Restrictions",
  "Print outs given to the patient",
] as const

const TREATMENT_OPTIONS: Record<(typeof TREATMENT_ROW_LABELS)[number], string[]> = {
  Modality: ["None", "Heat", "Ice", "Ultrasound", "Electrical stimulation", "Manual therapy", "Other"],
  ROM: ["None", "AAROM", "AROM", "PROM", "Active-assisted", "Other"],
  Strengthening: ["None", "Isometric", "Isotonic", "Theraband", "Weights", "Functional", "Other"],
  Stretching: ["None", "Static", "Dynamic", "PNF", "Ballistic", "Other"],
  HEP: ["None", "Reviewed, advised to continue", "New HEP given", "Modified HEP", "Other"],
  Education: ["None", "Education and postural retraining", "Postural retraining", "Activity modification", "Body mechanics", "Other"],
  Restrictions: ["None", "Weight-bearing", "ROM restrictions", "Activity modification", "Other"],
  "Print outs given to the patient": ["No", "Yes", "Other"],
}

const TREATMENT_NOTES_PREFIX = "\nNotes:"

function parseTreatmentListItem(item: string, label: string): string {
  const prefix = label + ":"
  if (item.startsWith(prefix)) {
    const rest = item.slice(prefix.length).trim()
    const notesIndex = rest.toLowerCase().indexOf(TREATMENT_NOTES_PREFIX.toLowerCase())
    const value = notesIndex >= 0 ? rest.slice(0, notesIndex).trim() : rest
    return value
  }
  return item.trim()
}

/** Multi-select separator for treatment values (pipe – options can contain commas, e.g. "Reviewed, advised to continue"). */
const TREATMENT_VALUES_SEP = " | "

/** Parse a treatment list item into selected values (multi) and notes. */
function parseTreatmentValueAndNotes(item: string, label: string): { values: string[]; notes: string } {
  const prefix = label + ":"
  if (!item.startsWith(prefix)) {
    const trimmed = item.trim()
    return { values: trimmed ? [trimmed] : [], notes: "" }
  }
  const rest = item.slice(prefix.length).trim()
  const notesIndex = rest.toLowerCase().indexOf(TREATMENT_NOTES_PREFIX.toLowerCase())
  const valuePart = notesIndex < 0 ? rest : rest.slice(0, notesIndex).trim()
  const notes = notesIndex < 0 ? "" : rest.slice(notesIndex + TREATMENT_NOTES_PREFIX.length).trim()
  const values = valuePart
    ? valuePart.split(/\s*\|\s*/).map((v) => v.replace(/\.+$/, "").trim()).filter(Boolean)
    : []
  return { values, notes }
}

function formatTreatmentListItem(label: string, value: string): string {
  return value ? `${label}: ${value}` : `${label}:`
}

/** Format treatment list item (multi-select values) with optional notes for persistence. */
function formatTreatmentListItemWithNotes(label: string, values: string[], notes: string): string {
  const valueStr = values.length ? values.join(TREATMENT_VALUES_SEP) : ""
  const base = valueStr ? `${label}: ${valueStr}` : `${label}:`
  return notes.trim() ? `${base}${TREATMENT_NOTES_PREFIX} ${notes.trim()}` : base
}

export interface ChartTemplateFormProps {
  initialContent: string | null
  editable: boolean
  onSave?: (content: string) => void | Promise<void> | Promise<boolean>
  saving?: boolean
  onAfterDraftSave?: () => void
  className?: string
  patientDisplayName?: string
}


function prepareChartJsonForDisplay(raw: string | null, patientDisplayName?: string): string | null {
  if (!raw?.trim()) return raw
  if (!patientDisplayName?.trim()) return raw
  return interpolatePatientNameInTipTapJson(raw, patientDisplayName.trim())
}

function parseContent(value: string | null): ParsedChartDoc | null {
  if (!value || value.trim() === "") return null
  return parseChartDoc(value)
}

function orderSectionsWithConsentFirst(sections: ChartSection[]): ChartSection[] {
  const idx = sections.findIndex((s) => /^Consent:?$/i.test(s.title.trim()))
  if (idx <= 0) return sections
  const next = [...sections]
  const [consent] = next.splice(idx, 1)
  return [consent, ...next]
}

function withConsentFirst(doc: ParsedChartDoc | null): ParsedChartDoc | null {
  if (!doc) return null
  return { ...doc, sections: orderSectionsWithConsentFirst(doc.sections) }
}


export function ChartTemplateForm({
  initialContent,
  editable,
  onSave,
  saving = false,
  onAfterDraftSave,
  className,
  patientDisplayName,
}: ChartTemplateFormProps) {
  const preparedContent = useMemo(
    () => prepareChartJsonForDisplay(initialContent, patientDisplayName),
    [initialContent, patientDisplayName],
  )
  const parsed = useMemo(() => withConsentFirst(parseContent(preparedContent)), [preparedContent])
  const [data, setData] = useState<ParsedChartDoc | null>(() => parsed)
  const syncKeyRef = useRef<string>("")

  useEffect(() => {
    const key = `${initialContent ?? ""}\0${patientDisplayName ?? ""}`
    if (syncKeyRef.current !== key) {
      syncKeyRef.current = key
      if (parsed) setData(parsed)
    }
  }, [initialContent, patientDisplayName, parsed])

  const updateSection = useCallback((sectionIndex: number, updater: (section: ChartSection) => ChartSection) => {
    setData((prev) => {
      if (!prev) return prev
      const next = { ...prev, sections: [...prev.sections] }
      next.sections[sectionIndex] = updater(next.sections[sectionIndex])
      return next
    })
  }, [])

  const setCheckboxLine = useCallback(
    (sectionIndex: number, lineIndex: number, optionIndex: number, checked: boolean) => {
      updateSection(sectionIndex, (section) => {
        const lines = [...section.checkboxLines]
        const line = { ...lines[lineIndex], options: [...lines[lineIndex].options] }
        line.options[optionIndex] = { ...line.options[optionIndex], checked }
        lines[lineIndex] = line
        return { ...section, checkboxLines: lines }
      })
    },
    [updateSection]
  )

  const setCheckboxLinePrefix = useCallback(
    (sectionIndex: number, lineIndex: number, newPrefix: string) => {
      updateSection(sectionIndex, (section) => {
        const lines = [...section.checkboxLines]
        lines[lineIndex] = { ...lines[lineIndex], prefix: newPrefix }
        return { ...section, checkboxLines: lines }
      })
    },
    [updateSection]
  )

  const setSectionNotes = useCallback(
    (sectionIndex: number, notes: string) => {
      updateSection(sectionIndex, (section) => ({ ...section, notes }))
    },
    [updateSection]
  )

  const setSectionListItems = useCallback(
    (sectionIndex: number, listItems: string[]) => {
      updateSection(sectionIndex, (section) => ({ ...section, listItems }))
    },
    [updateSection]
  )

  const handleSave = useCallback(() => {
    if (!data || !onSave) return
    onSave(JSON.stringify(serializeChartDoc(data)))
  }, [data, onSave])

  const handleSaveDraftAndClose = useCallback(async () => {
    if (!data || !onSave || !onAfterDraftSave) return
    const result = await Promise.resolve(onSave(JSON.stringify(serializeChartDoc(data))))
    if (result === true) onAfterDraftSave()
  }, [data, onSave, onAfterDraftSave])

  if (!data || data.sections.length === 0) {
    return (
      <div className={cn("rounded-xl border-2 border-dashed border-border bg-muted/20 min-h-[200px] flex flex-col items-center justify-center p-8 text-center", className)}>
        <FileText className="h-10 w-10 text-muted-foreground/60 mb-3" />
        <p className="text-sm font-medium text-foreground">Chart could not be shown as a form</p>
        <p className="text-sm text-muted-foreground mt-1">Use the Edit view to edit content.</p>
      </div>
    )
  }

  const consentSection =
    data.sections.length > 0 && /^Consent:?$/i.test(data.sections[0].title.trim())
      ? data.sections[0] : null
  const sectionsAfterConsent = consentSection ? data.sections.slice(1) : data.sections

  const renderSectionBlock = (section: ChartSection, sectionIndex: number) => (
    <SectionBlock
      key={`${section.title}-${sectionIndex}`}
      section={section}
      sectionIndex={sectionIndex}
      editable={editable}
      onCheckboxChange={(li, oi, checked) => setCheckboxLine(sectionIndex, li, oi, checked)}
      onCheckboxLinePrefixChange={(li, p) => setCheckboxLinePrefix(sectionIndex, li, p)}
      onNotesChange={(notes) => setSectionNotes(sectionIndex, notes)}
      onListItemsChange={(items) => setSectionListItems(sectionIndex, items)}
    />
  )

  return (
    <div className={cn("rounded-xl border-2 border-border/60 bg-card overflow-hidden shadow-sm", className)}>
      {consentSection && (
        <div className="px-5 pt-5 pb-1 border-b border-border/60 bg-muted/25">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Step 1 — Consent</p>
          {renderSectionBlock(consentSection, 0)}
        </div>
      )}
      <div className="px-5 py-5 border-b border-border/60 bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{data.mainTitle || "Chart notes"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {consentSection
                ? "Complete consent above first, then work through the assessment sections below."
                : "Tick/untick options and add notes below each section. Changes are shared with doctors who have access."}
            </p>
            {editable && onSave && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={handleSave} disabled={saving} className="rounded-lg shadow-sm">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save chart"}
                </Button>
                {onAfterDraftSave && (
                  <Button type="button" size="sm" variant="secondary" onClick={handleSaveDraftAndClose} disabled={saving} className="rounded-lg">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save as draft & close"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="min-h-[280px] px-5 py-5 space-y-6 overflow-auto">
        {consentSection && (
          <p className="text-xs font-medium text-muted-foreground -mt-2 mb-2 uppercase tracking-wide">Step 2 — Assessment</p>
        )}
        {sectionsAfterConsent.map((section, i) => renderSectionBlock(section, consentSection ? i + 1 : i))}
      </div>
    </div>
  )
}

// ─── SectionBlock ─────────────────────────────────────────────────────────────

interface SectionBlockProps {
  section: ChartSection
  sectionIndex: number
  editable: boolean
  onCheckboxChange: (lineIndex: number, optionIndex: number, checked: boolean) => void
  onCheckboxLinePrefixChange?: (lineIndex: number, newPrefix: string) => void
  onNotesChange: (notes: string) => void
  onListItemsChange: (listItems: string[]) => void
}

const TREATMENT_SECTION_TITLE = "Treatment:"
const RIM_STRENGTH_TITLE_REGEX = /^RIM\/Strength:?$/i
const ROM_SECTION_TITLE_REGEX = /^ROM:?$/i
const PAIN_PREFIX_REGEX = /^Pain\s*(___|\d+)\/10$/i
const CONSENT_SECTION_TITLE_REGEX = /^Consent:?$/i

function isTreatmentSection(section: ChartSection): boolean {
  return section.title === TREATMENT_SECTION_TITLE || section.title.startsWith("Treatment")
}

function SectionBlock({
  section,
  sectionIndex,
  editable,
  onCheckboxChange,
  onCheckboxLinePrefixChange,
  onNotesChange,
  onListItemsChange,
}: SectionBlockProps) {
  const isTreatment = isTreatmentSection(section) && section.listItems.length > 0
  const isRimStrength = RIM_STRENGTH_TITLE_REGEX.test(section.title.trim())
  const rimStrength = isRimStrength ? parseRimStrengthNotes(section.notes) : null
  const isRom = ROM_SECTION_TITLE_REGEX.test(section.title.trim())
  const romNotes = isRom ? parseRomNotes(section.notes) : null
  const isConsentSection = CONSENT_SECTION_TITLE_REGEX.test(section.title.trim())

  return (
    <div className="rounded-xl border-2 border-border/60 bg-muted/10 p-5 space-y-4 shadow-sm">
      <h3 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 tracking-tight">
        {section.title}
      </h3>

      {/* Checkbox lines */}
      {section.checkboxLines.length > 0 && (
        <div className="space-y-3">
          {section.checkboxLines.map((line, lineIndex) => (
            <CheckboxLineRow
              key={lineIndex}
              line={line}
              lineIndex={lineIndex}
              editable={editable}
              isPainLine={PAIN_PREFIX_REGEX.test(line.prefix.trim())}
              onToggle={(oi, checked) => onCheckboxChange(lineIndex, oi, checked)}
              onPainLevelChange={
                onCheckboxLinePrefixChange
                  ? (v) => onCheckboxLinePrefixChange(lineIndex, `Pain ${v}/10`)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* ROM fields */}
      {isRom && romNotes && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">{ROM_RIM_MOTION_LEGEND}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(["flexion","extension","abduction","adduction","internalRotation","externalRotation"] as const).map((key) => {
              const labels: Record<string, string> = {
                flexion: "Flex (flexion)", extension: "Ext (extension)",
                abduction: "Abd (abduction)", adduction: "Add (adduction)",
                internalRotation: "IR (internal rotation)", externalRotation: "ER (external rotation)",
              }
              return (
                <div key={key} className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">{labels[key]}</Label>
                  {editable ? (
                    <Input
                      value={romNotes[key]}
                      onChange={(e) => onNotesChange(formatRomNotes(
                        key === "flexion" ? e.target.value : romNotes.flexion,
                        key === "extension" ? e.target.value : romNotes.extension,
                        key === "abduction" ? e.target.value : romNotes.abduction,
                        key === "adduction" ? e.target.value : romNotes.adduction,
                        key === "internalRotation" ? e.target.value : romNotes.internalRotation,
                        key === "externalRotation" ? e.target.value : romNotes.externalRotation,
                        romNotes.additionalNotes,
                      ))}
                      placeholder="___"
                      className="w-full sm:w-[120px] h-9 text-sm"
                    />
                  ) : (
                    <p className="text-sm text-foreground">{romNotes[key] || "—"}</p>
                  )}
                </div>
              )
            })}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">Additional notes</Label>
            <Textarea
              value={romNotes.additionalNotes}
              onChange={(e) => onNotesChange(formatRomNotes(
                romNotes.flexion, romNotes.extension, romNotes.abduction,
                romNotes.adduction, romNotes.internalRotation, romNotes.externalRotation, e.target.value,
              ))}
              placeholder="Add notes if needed…"
              className="min-h-[60px] text-sm resize-y rounded-lg border-border/80 bg-background focus-visible:ring-2"
              rows={2}
              readOnly={!editable}
            />
          </div>
        </div>
      )}

      {/* RIM/Strength fields */}
      {isRimStrength && rimStrength && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">{ROM_RIM_MOTION_LEGEND}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(["flexion","extension","abduction","adduction","internalRotation","externalRotation"] as const).map((key) => {
              const labels: Record<string, string> = {
                flexion: "Flex (flexion)", extension: "Ext (extension)",
                abduction: "Abd (abduction)", adduction: "Add (adduction)",
                internalRotation: "IR (internal rotation)", externalRotation: "ER (external rotation)",
              }
              return (
                <div key={key} className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">{labels[key]}</Label>
                  {editable ? (
                    <Select
                      value={rimStrength[key] || undefined}
                      onValueChange={(v) => onNotesChange(formatRimStrengthNotes(
                        key === "flexion" ? v : rimStrength.flexion,
                        key === "extension" ? v : rimStrength.extension,
                        key === "abduction" ? v : rimStrength.abduction,
                        key === "adduction" ? v : rimStrength.adduction,
                        key === "internalRotation" ? v : rimStrength.internalRotation,
                        key === "externalRotation" ? v : rimStrength.externalRotation,
                        rimStrength.additionalNotes,
                      ))}
                    >
                      <SelectTrigger className="w-full sm:w-[100px] h-9 text-sm">
                        <SelectValue placeholder="—/5" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}/5</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-foreground">
                      {rimStrength[key] ? `${rimStrength[key]}/5` : "—/5"}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">Additional notes</Label>
            <Textarea
              value={rimStrength.additionalNotes}
              onChange={(e) => onNotesChange(formatRimStrengthNotes(
                rimStrength.flexion, rimStrength.extension, rimStrength.abduction,
                rimStrength.adduction, rimStrength.internalRotation, rimStrength.externalRotation, e.target.value,
              ))}
              placeholder="Add notes if needed…"
              className="min-h-[60px] text-sm resize-y rounded-lg border-border/80 bg-background focus-visible:ring-2"
              rows={2}
              readOnly={!editable}
            />
          </div>
        </div>
      )}

      {/* Treatment section */}
      {isTreatment && (
        <TreatmentRadioSection
          listItems={section.listItems}
          editable={editable}
          onListItemsChange={onListItemsChange}
        />
      )}

      {/* Non-treatment list items */}
      {section.listItems.length > 0 && !isTreatment && (
        <div className="space-y-1">
          <Label className="text-sm font-medium text-muted-foreground">Items</Label>
          {editable ? (
            <Textarea
              value={section.listItems.join("\n")}
              onChange={(e) => onListItemsChange(e.target.value.split("\n").map((s) => s.trim()))}
              placeholder="One item per line"
              className="min-h-[80px] text-sm rounded-lg border-border/80 focus-visible:ring-2"
              rows={Math.max(3, section.listItems.length)}
            />
          ) : (
            <ul className="list-disc pl-6 text-sm space-y-1 text-foreground">
              {section.listItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Notes — now uses RichNotesEditor for rich text support */}
      {!isRimStrength && !isRom && section.title.trim() !== "Plan:" && (
        <div className={cn("space-y-2", isConsentSection && "rounded-xl border border-border/80 bg-card/50 p-4 sm:p-5 shadow-sm")}>
          {isConsentSection && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Informed consent — review with the patient; supports bold, italic, underline formatting
            </p>
          )}
          <Label className={cn("text-sm font-medium", isConsentSection ? "text-foreground" : "text-muted-foreground")}>
            {isConsentSection ? "Consent text on this chart" : "Notes"}
          </Label>
          <RichNotesEditor
            value={section.notes}
            onChange={onNotesChange}
            editable={editable}
            placeholder={isConsentSection ? "Consent paragraphs…" : "Add your notes here…"}
            minHeight={isConsentSection ? "220px" : "72px"}
          />
        </div>
      )}
    </div>
  )
}

// ─── TreatmentRadioSection (unchanged) ───────────────────────────────────────

interface TreatmentRadioSectionProps {
  listItems: string[]
  editable: boolean
  onListItemsChange: (listItems: string[]) => void
}

function TreatmentRadioSection({ listItems, editable, onListItemsChange }: TreatmentRadioSectionProps) {
  const rows = useMemo(() => TREATMENT_ROW_LABELS.map((label, i) => {
    const raw = listItems[i] ?? ""
    const { values, notes } = parseTreatmentValueAndNotes(raw, label)
    return { label, selectedSet: new Set(values.map((v) => v.toLowerCase())), values, options: TREATMENT_OPTIONS[label], notes }
  }), [listItems])

  const handleToggle = useCallback((rowIndex: number, option: string, checked: boolean) => {
    const next = TREATMENT_ROW_LABELS.map((label, i) => {
      const raw = listItems[i] ?? ""
      const { values, notes } = parseTreatmentValueAndNotes(raw, label)
      if (i !== rowIndex) return formatTreatmentListItemWithNotes(label, values, notes)
      let nextValues: string[]
      if (checked) {
        nextValues = option.toLowerCase() === "none"
          ? [option]
          : [...values.filter((v) => v.toLowerCase() !== "none" && v.toLowerCase() !== option.toLowerCase()), option]
      } else {
        nextValues = values.filter((v) => v.toLowerCase() !== option.toLowerCase())
      }
      return formatTreatmentListItemWithNotes(label, nextValues, notes)
    })
    onListItemsChange(next)
  }, [listItems, onListItemsChange])

  const handleNotesChange = useCallback((rowIndex: number, newNotes: string) => {
    const next = TREATMENT_ROW_LABELS.map((label, i) => {
      const raw = listItems[i] ?? ""
      const { values, notes } = parseTreatmentValueAndNotes(raw, label)
      return formatTreatmentListItemWithNotes(label, values, i === rowIndex ? newNotes : notes)
    })
    onListItemsChange(next)
  }, [listItems, onListItemsChange])

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-muted-foreground">Options (multi-select)</Label>
      <div className="grid gap-3 sm:grid-cols-1">
        {rows.map((row, rowIndex) => (
          <div key={row.label} className="rounded-lg border border-border/60 bg-background/80 p-4 space-y-2 shadow-sm">
            <span className="text-sm font-medium text-foreground">{row.label}:</span>
            {editable ? (
              <>
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                  {row.options.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      <Checkbox
                        checked={row.selectedSet.has(opt.toLowerCase())}
                        onCheckedChange={(checked) => handleToggle(rowIndex, opt, checked === true)}
                        className="shrink-0"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <div className="pt-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {row.selectedSet.has("other") ? "Describe other" : "Notes"}
                  </Label>
                  <Textarea
                    value={row.notes}
                    onChange={(e) => handleNotesChange(rowIndex, e.target.value)}
                    placeholder={row.selectedSet.has("other") ? `Describe "Other" for ${row.label}…` : `Add notes for ${row.label}…`}
                    className="min-h-[60px] text-sm resize-y rounded-lg border-border/80 bg-background focus-visible:ring-2"
                    rows={2}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-foreground pt-1">{row.values.length ? row.values.join(TREATMENT_VALUES_SEP) : "—"}</p>
                {row.notes && (
                  <div className="pt-1 space-y-0.5">
                    <span className="text-xs text-muted-foreground">Notes:</span>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{row.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── CheckboxLineRow (unchanged) ─────────────────────────────────────────────

interface CheckboxLineRowProps {
  line: CheckboxLine
  lineIndex: number
  editable: boolean
  isPainLine?: boolean
  onToggle: (optionIndex: number, checked: boolean) => void
  onPainLevelChange?: (value: string) => void
}

function parsePainLevel(prefix: string): string {
  const m = prefix.trim().match(/^Pain\s*(\d+)\/10$/i)
  return m ? m[1] : ""
}

function CheckboxLineRow({ line, editable, isPainLine, onToggle, onPainLevelChange }: CheckboxLineRowProps) {
  const painValue = isPainLine ? parsePainLevel(line.prefix) : ""
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {line.prefix && !isPainLine && (
        <span className="text-sm text-foreground font-medium">{line.prefix}</span>
      )}
      {isPainLine && (
        <>
          <span className="text-sm text-foreground font-medium">Pain</span>
          {editable && onPainLevelChange ? (
            <Select value={painValue || undefined} onValueChange={onPainLevelChange}>
              <SelectTrigger className="w-[72px] h-8 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-foreground font-medium">{painValue ? `${painValue}/10` : "—/10"}</span>
          )}
          <span className="text-sm text-muted-foreground">/10</span>
        </>
      )}
      {line.options.map((opt, optionIndex) => (
        <label key={optionIndex} className={cn("flex items-center gap-2 cursor-pointer text-sm", !editable && "cursor-default")}>
          <Checkbox
            checked={opt.checked}
            onCheckedChange={(checked) => editable && onToggle(optionIndex, checked === true)}
            disabled={!editable}
            className="shrink-0"
          />
          <span className={opt.checked ? "text-foreground" : "text-muted-foreground"}>{opt.label}</span>
        </label>
      ))}
    </div>
  )
}