"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
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
import { Bold, FileText, Italic, Loader2, Underline as UnderlineIcon } from "lucide-react"

// ─── Treatment constants (unchanged) ────────────────────────────────────────

const TREATMENT_ROW_LABELS = [
  "Modality", "ROM", "Strengthening", "Stretching", "HEP",
  "Education", "Restrictions", "Print outs given to the patient",
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
const TREATMENT_VALUES_SEP = " | "

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

function formatTreatmentListItemWithNotes(label: string, values: string[], notes: string): string {
  const valueStr = values.length ? values.join(TREATMENT_VALUES_SEP) : ""
  const base = valueStr ? `${label}: ${valueStr}` : `${label}:`
  return notes.trim() ? `${base}${TREATMENT_NOTES_PREFIX} ${notes.trim()}` : base
}

// ─── Rich Notes Editor ───────────────────────────────────────────────────────

interface RichNotesEditorProps {
  value: string          // HTML string
  onChange: (html: string) => void
  editable: boolean
  placeholder?: string
  minHeight?: string
  className?: string
}

export default function RichNotesEditor({
  value,
  onChange,
  editable,
  placeholder = "Add your notes here…",
  minHeight = "72px",
  className,
}: RichNotesEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: value || "",
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2 text-sm leading-relaxed",
          "[&_strong]:font-bold [&_em]:italic [&_u]:underline",
          `min-h-[${minHeight}]`,
        ),
      },
    },
  })

  // Sync external value changes (e.g. reset)
  const prevValueRef = useRef(value)
  useEffect(() => {
    if (!editor) return
    if (prevValueRef.current !== value) {
      prevValueRef.current = value
      // Only update if editor content is actually different to avoid cursor jumping
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value || "", false)
      }
    }
  }, [editor, value])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(editable)
  }, [editor, editable])

  if (!editable) {
    // Read-only: just render HTML
    if (!value) return null
    return (
      <div
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-foreground",
          "[&_strong]:font-bold [&_em]:italic [&_u]:underline",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    )
  }

  return (
    <div className={cn("rounded-lg border border-border/80 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/60 bg-muted/20">
        <button
          type="button"
          title="Bold (Ctrl+B)"
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run() }}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
            editor?.isActive("bold") && "bg-muted text-foreground",
          )}
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Italic (Ctrl+I)"
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run() }}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
            editor?.isActive("italic") && "bg-muted text-foreground",
          )}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Underline (Ctrl+U)"
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleUnderline().run() }}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
            editor?.isActive("underline") && "bg-muted text-foreground",
          )}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 bg-border/60 mx-1" />
        <span className="text-[10px] text-muted-foreground select-none">
          Ctrl+B · Ctrl+I · Ctrl+U
        </span>
      </div>
      {/* Editor area */}
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
      {/* Placeholder */}
      {editor && editor.isEmpty && (
        <div className="pointer-events-none absolute inset-0 px-3 py-2 text-sm text-muted-foreground/60 select-none" aria-hidden>
          {placeholder}
        </div>
      )}
    </div>
  )
}