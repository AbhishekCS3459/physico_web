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
import { cn } from "@/lib/utils"
import { FileText, Loader2 } from "lucide-react"

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
}

function parseContent(value: string | null): ParsedChartDoc | null {
  if (!value || value.trim() === "") return null
  return parseChartDoc(value)
}

export function ChartTemplateForm({
  initialContent,
  editable,
  onSave,
  saving = false,
  onAfterDraftSave,
  className,
}: ChartTemplateFormProps) {
  const parsed = useMemo(() => parseContent(initialContent), [initialContent])
  const [data, setData] = useState<ParsedChartDoc | null>(() => parsed)
  const initialContentRef = useRef(initialContent)

  // Sync when initialContent changes from outside (e.g. after save from server)
  useEffect(() => {
    if (initialContentRef.current !== initialContent) {
      initialContentRef.current = initialContent
      if (parsed) setData(parsed)
    }
  }, [initialContent, parsed])

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
        const line = { ...lines[lineIndex], prefix: newPrefix }
        lines[lineIndex] = line
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
    const doc = serializeChartDoc(data)
    onSave(JSON.stringify(doc))
  }, [data, onSave])

  const handleSaveDraftAndClose = useCallback(async () => {
    if (!data || !onSave || !onAfterDraftSave) return
    const doc = serializeChartDoc(data)
    const result = await Promise.resolve(onSave(JSON.stringify(doc)))
    if (result === true) onAfterDraftSave()
  }, [data, onSave, onAfterDraftSave])

  if (!data || data.sections.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border-2 border-dashed border-border bg-muted/20 min-h-[200px] flex flex-col items-center justify-center p-8 text-center",
          className
        )}
      >
        <FileText className="h-10 w-10 text-muted-foreground/60 mb-3" />
        <p className="text-sm font-medium text-foreground">Chart could not be shown as a form</p>
        <p className="text-sm text-muted-foreground mt-1">Use the Edit view to edit content.</p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl border-2 border-border/60 bg-card overflow-hidden shadow-sm", className)}>
      <div className="px-5 py-5 border-b border-border/60 bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{data.mainTitle || "Chart notes"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tick/untick options and add notes below each section. Changes are shared with doctors who have access.
            </p>
            {editable && onSave && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
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
          </div>
        </div>
      </div>
      <div className="min-h-[280px] px-5 py-5 space-y-6 overflow-auto">
        {data.sections.map((section, sectionIndex) => (
          <SectionBlock
            key={`${section.title}-${sectionIndex}`}
            section={section}
            sectionIndex={sectionIndex}
            editable={editable}
            onCheckboxChange={(lineIndex, optionIndex, checked) =>
              setCheckboxLine(sectionIndex, lineIndex, optionIndex, checked)
            }
            onCheckboxLinePrefixChange={(lineIndex, newPrefix) =>
              setCheckboxLinePrefix(sectionIndex, lineIndex, newPrefix)
            }
            onNotesChange={(notes) => setSectionNotes(sectionIndex, notes)}
            onListItemsChange={(listItems) => setSectionListItems(sectionIndex, listItems)}
          />
        ))}
      </div>
    </div>
  )
}

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

function isTreatmentSection(section: ChartSection): boolean {
  return section.title === TREATMENT_SECTION_TITLE || section.title.startsWith("Treatment")
}

/** RIM/Strength section: Flex ___/5 and Abd ___/5 as separate fields */
const RIM_STRENGTH_TITLE_REGEX = /^RIM\/Strength:?$/i

function parseRimStrengthNotes(notes: string): { flex: string; abd: string; additionalNotes: string } {
  const parts = notes.split(/\n\n+/)
  const firstLine = (parts[0] ?? "").trim()
  const additionalNotes = parts.slice(1).join("\n\n").trim()
  const flexMatch = firstLine.match(/Flex\s*(___|\d+)\/5/i)
  const abdMatch = firstLine.match(/Abd\s*(___|\d+)\/5/i)
  const flex = flexMatch ? (flexMatch[1] === "___" ? "" : flexMatch[1]) : ""
  const abd = abdMatch ? (abdMatch[1] === "___" ? "" : abdMatch[1]) : ""
  return { flex, abd, additionalNotes }
}

function formatRimStrengthNotes(flex: string, abd: string, additionalNotes: string): string {
  const flexStr = flex ? `${flex}/5` : "___/5"
  const abdStr = abd ? `${abd}/5` : "___/5"
  const line = `Flex ${flexStr}    Abd ${abdStr}`
  return additionalNotes ? `${line}\n\n${additionalNotes}` : line
}

/** ROM section: Flex ___ and Abd ___ as separate fields (e.g. degrees) */
const ROM_SECTION_TITLE_REGEX = /^ROM:?$/i

function parseRomNotes(notes: string): { flex: string; abd: string; additionalNotes: string } {
  const parts = notes.split(/\n\n+/)
  const firstLine = (parts[0] ?? "").trim()
  const additionalNotes = parts.slice(1).join("\n\n").trim()
  const flexMatch = firstLine.match(/Flex\s*(.+?)\s{2,}Abd\s*(.*)$/i)
  if (!flexMatch) {
    const flexOnly = firstLine.match(/Flex\s*(.*)$/i)
    const abdOnly = firstLine.match(/Abd\s*(.*)$/i)
    const flex = flexOnly ? flexOnly[1].trim().replace(/^___$/, "") : ""
    const abd = abdOnly ? abdOnly[1].trim().replace(/^___$/, "") : ""
    return { flex, abd, additionalNotes }
  }
  const flex = (flexMatch[1] ?? "").trim().replace(/^___$/, "")
  const abd = (flexMatch[2] ?? "").trim().replace(/^___$/, "")
  return { flex, abd, additionalNotes }
}

function formatRomNotes(flex: string, abd: string, additionalNotes: string): string {
  const flexStr = flex.trim() || "___"
  const abdStr = abd.trim() || "___"
  const line = `Flex ${flexStr}    Abd ${abdStr}`
  return additionalNotes ? `${line}\n\n${additionalNotes}` : line
}

const PAIN_PREFIX_REGEX = /^Pain\s*(___|\d+)\/10$/i

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

  return (
    <div className="rounded-xl border-2 border-border/60 bg-muted/10 p-5 space-y-4 shadow-sm">
      <h3 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 tracking-tight">
        {section.title}
      </h3>

      {/* Checkbox lines: tick/untick options */}
      {section.checkboxLines.length > 0 && (
        <div className="space-y-3">
          {section.checkboxLines.map((line, lineIndex) => (
            <CheckboxLineRow
              key={lineIndex}
              line={line}
              lineIndex={lineIndex}
              editable={editable}
              isPainLine={PAIN_PREFIX_REGEX.test(line.prefix.trim())}
              onToggle={(optionIndex, checked) =>
                onCheckboxChange(lineIndex, optionIndex, checked)
              }
              onPainLevelChange={
                onCheckboxLinePrefixChange
                  ? (value) => onCheckboxLinePrefixChange(lineIndex, `Pain ${value}/10`)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* ROM: Flex and Abd as separate fields (e.g. degrees) */}
      {isRom && romNotes && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Flex</Label>
              {editable ? (
                <Input
                  value={romNotes.flex}
                  onChange={(e) =>
                    onNotesChange(
                      formatRomNotes(e.target.value, romNotes.abd, romNotes.additionalNotes)
                    )
                  }
                  placeholder="___"
                  className="w-full sm:w-[120px] h-9 text-sm"
                />
              ) : (
                <p className="text-sm text-foreground">{romNotes.flex || "—"}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Abd</Label>
              {editable ? (
                <Input
                  value={romNotes.abd}
                  onChange={(e) =>
                    onNotesChange(
                      formatRomNotes(romNotes.flex, e.target.value, romNotes.additionalNotes)
                    )
                  }
                  placeholder="___"
                  className="w-full sm:w-[120px] h-9 text-sm"
                />
              ) : (
                <p className="text-sm text-foreground">{romNotes.abd || "—"}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">Additional notes</Label>
            <Textarea
              value={romNotes.additionalNotes}
              onChange={(e) =>
                onNotesChange(
                  formatRomNotes(romNotes.flex, romNotes.abd, e.target.value)
                )
              }
              placeholder="Add notes if needed…"
              className="min-h-[60px] text-sm resize-y rounded-lg border-border/80 bg-background focus-visible:ring-2"
              rows={2}
              readOnly={!editable}
            />
          </div>
        </div>
      )}

      {/* RIM/Strength: Flex and Abd as separate fields (/5 scale) */}
      {isRimStrength && rimStrength && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Flex</Label>
              {editable ? (
                <Select
                  value={rimStrength.flex || undefined}
                  onValueChange={(value) =>
                    onNotesChange(
                      formatRimStrengthNotes(value, rimStrength.abd, rimStrength.additionalNotes)
                    )
                  }
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
                <p className="text-sm text-foreground">
                  {rimStrength.flex ? `${rimStrength.flex}/5` : "—/5"}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Abd</Label>
              {editable ? (
                <Select
                  value={rimStrength.abd || undefined}
                  onValueChange={(value) =>
                    onNotesChange(
                      formatRimStrengthNotes(rimStrength.flex, value, rimStrength.additionalNotes)
                    )
                  }
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
                <p className="text-sm text-foreground">
                  {rimStrength.abd ? `${rimStrength.abd}/5` : "—/5"}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">Additional notes</Label>
            <Textarea
              value={rimStrength.additionalNotes}
              onChange={(e) =>
                onNotesChange(
                  formatRimStrengthNotes(
                    rimStrength.flex,
                    rimStrength.abd,
                    e.target.value
                  )
                )
              }
              placeholder="Add notes if needed…"
              className="min-h-[60px] text-sm resize-y rounded-lg border-border/80 bg-background focus-visible:ring-2"
              rows={2}
              readOnly={!editable}
            />
          </div>
        </div>
      )}

      {/* Treatment: multiple-choice options per row */}
      {isTreatment && (
        <TreatmentRadioSection
          listItems={section.listItems}
          editable={editable}
          onListItemsChange={onListItemsChange}
        />
      )}

      {/* Bullet list (non-Treatment sections with list items) - editable as one text per line */}
      {section.listItems.length > 0 && !isTreatment && (
        <div className="space-y-1">
          <Label className="text-sm font-medium text-muted-foreground">Items</Label>
          {editable ? (
            <Textarea
              value={section.listItems.join("\n")}
              onChange={(e) => {
                const lines = e.target.value.split("\n")
                onListItemsChange(lines.map((s) => s.trim()))
              }}
              placeholder="One item per line"
              className="min-h-[80px] text-sm rounded-lg border-border/80 focus-visible:ring-2"
              rows={Math.max(3, section.listItems.length)}
            />
          ) : (
            <ul className="list-disc pl-6 text-sm space-y-1 text-foreground">
              {section.listItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Notes: doctor adds notes below (only when not RIM/Strength or ROM; they have their own blocks above) */}
      {!isRimStrength && !isRom && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
          <Textarea
            value={section.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add your notes here…"
            className="min-h-[72px] text-sm resize-y rounded-lg border-border/80 bg-background focus-visible:ring-2"
            rows={3}
            readOnly={!editable}
          />
        </div>
      )}
    </div>
  )
}

interface TreatmentRadioSectionProps {
  listItems: string[]
  editable: boolean
  onListItemsChange: (listItems: string[]) => void
}

function TreatmentRadioSection({
  listItems,
  editable,
  onListItemsChange,
}: TreatmentRadioSectionProps) {
  const rows = useMemo(() => {
    return TREATMENT_ROW_LABELS.map((label, i) => {
      const raw = listItems[i] ?? ""
      const { values, notes } = parseTreatmentValueAndNotes(raw, label)
      const options = TREATMENT_OPTIONS[label]
      const selectedSet = new Set(values.map((v) => v.toLowerCase()))
      return { label, selectedSet, values, options, notes }
    })
  }, [listItems])

  const handleToggle = useCallback(
    (rowIndex: number, option: string, checked: boolean) => {
      const next = TREATMENT_ROW_LABELS.map((label, i) => {
        const raw = listItems[i] ?? ""
        const { values, notes } = parseTreatmentValueAndNotes(raw, label)
        if (i !== rowIndex) return formatTreatmentListItemWithNotes(label, values, notes)
        let nextValues: string[]
        if (checked) {
          const isNone = option.toLowerCase() === "none"
          if (isNone) {
            nextValues = [option]
          } else {
            nextValues = [
              ...values.filter((v) => v.toLowerCase() !== "none" && v.toLowerCase() !== option.toLowerCase()),
              option,
            ]
          }
        } else {
          nextValues = values.filter((v) => v.toLowerCase() !== option.toLowerCase())
        }
        return formatTreatmentListItemWithNotes(label, nextValues, notes)
      })
      onListItemsChange(next)
    },
    [listItems, onListItemsChange]
  )

  const handleNotesChange = useCallback(
    (rowIndex: number, newNotes: string) => {
      const next = TREATMENT_ROW_LABELS.map((label, i) => {
        const raw = listItems[i] ?? ""
        const { values, notes } = parseTreatmentValueAndNotes(raw, label)
        const notesForRow = i === rowIndex ? newNotes : notes
        return formatTreatmentListItemWithNotes(label, values, notesForRow)
      })
      onListItemsChange(next)
    },
    [listItems, onListItemsChange]
  )

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-muted-foreground">Options (multi-select)</Label>
      <div className="grid gap-3 sm:grid-cols-1">
        {rows.map((row, rowIndex) => (
          <div
            key={row.label}
            className="rounded-lg border border-border/60 bg-background/80 p-4 space-y-2 shadow-sm"
          >
            <span className="text-sm font-medium text-foreground">{row.label}:</span>
            {editable ? (
              <>
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                  {row.options.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Checkbox
                        checked={row.selectedSet.has(opt.toLowerCase())}
                        onCheckedChange={(checked) =>
                          handleToggle(rowIndex, opt, checked === true)
                        }
                        className="shrink-0"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <div className="pt-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {row.selectedSet.has("other")
                      ? "Describe other"
                      : "Notes"}
                  </Label>
                  <Textarea
                    value={row.notes}
                    onChange={(e) => handleNotesChange(rowIndex, e.target.value)}
                    placeholder={
                      row.selectedSet.has("other")
                        ? `Describe what "Other" refers to for ${row.label}…`
                        : `Add notes for ${row.label} (e.g. details for Other)…`
                    }
                    className="min-h-[60px] text-sm resize-y rounded-lg border-border/80 bg-background focus-visible:ring-2"
                    rows={2}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-foreground pt-1">
                  {row.values.length ? row.values.join(TREATMENT_VALUES_SEP) : "—"}
                </p>
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

function CheckboxLineRow({
  line,
  editable,
  isPainLine,
  onToggle,
  onPainLevelChange,
}: CheckboxLineRowProps) {
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
            <Select
              value={painValue || undefined}
              onValueChange={onPainLevelChange}
            >
              <SelectTrigger className="w-[72px] h-8 text-sm">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-foreground font-medium">
              {painValue ? `${painValue}/10` : "—/10"}
            </span>
          )}
          <span className="text-sm text-muted-foreground">/10</span>
        </>
      )}
      {line.options.map((opt, optionIndex) => (
        <label
          key={optionIndex}
          className={cn(
            "flex items-center gap-2 cursor-pointer text-sm",
            !editable && "cursor-default"
          )}
        >
          <Checkbox
            checked={opt.checked}
            onCheckedChange={(checked) =>
              editable && onToggle(optionIndex, checked === true)
            }
            disabled={!editable}
            className="shrink-0"
          />
          <span className={opt.checked ? "text-foreground" : "text-muted-foreground"}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  )
}
