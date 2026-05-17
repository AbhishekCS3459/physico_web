"use client"

import { cn } from "@/lib/utils"
import { consentDocumentClauses } from "@/lib/consent-copy"
import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  CheckSquare, Quote, Minus, Link, Table, Pencil, Check,
  X, RefreshCw, Eye, Heading1, Heading2, Heading3,
} from "lucide-react"

function clausesToMarkdown(clauses: string[]): string {
  return clauses.map((c) => `- ${c}`).join("\n")
}

function parseMarkdown(md: string): string {
  let html = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^#{6}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{5}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{4}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/^---$/gm, "<hr>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  const lines = html.split("\n")
  const out: string[] = []
  let inUl = false, inOl = false

  for (const line of lines) {
    const chk = line.match(/^[-*]\s+\[( |x)\]\s+(.+)/)
    const ulm = !chk && line.match(/^[-*]\s+(.+)/)
    const olm = !chk && line.match(/^\d+\.\s+(.+)/)

    if (chk) {
      if (inOl) { out.push("</ol>"); inOl = false }
      if (!inUl) { out.push("<ul>"); inUl = true }
      const checked = chk[1] === "x" ? 'checked disabled style="margin-right:6px;"' : 'disabled style="margin-right:6px;"'
      out.push(`<li><input type="checkbox" ${checked}>${chk[2]}</li>`)
    } else if (ulm) {
      if (inOl) { out.push("</ol>"); inOl = false }
      if (!inUl) { out.push("<ul>"); inUl = true }
      out.push(`<li>${ulm[1]}</li>`)
    } else if (olm) {
      if (inUl) { out.push("</ul>"); inUl = false }
      if (!inOl) { out.push("<ol>"); inOl = true }
      out.push(`<li>${olm[1]}</li>`)
    } else {
      if (inUl) { out.push("</ul>"); inUl = false }
      if (inOl) { out.push("</ol>"); inOl = false }
      if (line.startsWith("&gt; ")) {
        out.push(`<blockquote>${line.slice(5)}</blockquote>`)
      } else if (line.startsWith("<h") || line.startsWith("<hr")) {
        out.push(line)
      } else {
        out.push(line ? `<p>${line}</p>` : "")
      }
    }
  }
  if (inUl) out.push("</ul>")
  if (inOl) out.push("</ol>")
  return out.join("\n")
}

type EditTab = "write" | "preview"

interface ToolbarButtonProps {
  title: string
  onClick: () => void
  children: React.ReactNode
}

function ToolbarButton({ title, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
    >
      {children}
    </button>
  )
}

function ToolbarSep() {
  return <div className="w-px h-4 bg-border/60 mx-1 shrink-0" />
}

export function ConsentDocumentBlock({
  patientDisplayName,
  className,
  editable = true,
  onContentChange,
  initialMarkdown,
}: {
  patientDisplayName: string
  className?: string
  editable?: boolean
  onContentChange?: (markdown: string) => void
  initialMarkdown?: string | null
}) {
  const defaultMarkdown = clausesToMarkdown(consentDocumentClauses(patientDisplayName))
  const [markdown, setMarkdown] = useState(initialMarkdown ?? defaultMarkdown)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(markdown)
  const [tab, setTab] = useState<EditTab>("write")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /* ── helpers ── */
  const getSelection = () => {
    const el = textareaRef.current
    if (!el) return null
    return { el, start: el.selectionStart, end: el.selectionEnd, sel: el.value.slice(el.selectionStart, el.selectionEnd) }
  }

  const applyAndRefocus = (el: HTMLTextAreaElement, newVal: string, nextStart: number, nextEnd: number) => {
    setDraft(newVal)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(nextStart, nextEnd)
    })
  }

  const wrapInline = useCallback((before: string, after: string) => {
    const s = getSelection()
    if (!s) return
    const { el, start, end, sel } = s
    const text = sel || "text"
    const next = el.value.slice(0, start) + before + text + after + el.value.slice(end)
    applyAndRefocus(el, next, start + before.length, start + before.length + text.length)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const insertBlock = useCallback((snippet: string) => {
    const s = getSelection()
    if (!s) return
    const { el, start, end } = s
    const before = el.value.slice(0, start)
    const prefix = before.includes("\n") ? "\n" : ""
    const insert = (before.length > 0 && !before.endsWith("\n") ? "\n" : "") + snippet
    const next = before + insert + el.value.slice(end)
    applyAndRefocus(el, next, start + insert.length, start + insert.length)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const insertLink = useCallback(() => {
    const s = getSelection()
    if (!s) return
    const { el, start, end, sel } = s
    const text = sel || "link text"
    const snippet = `[${text}](https://example.com)`
    const next = el.value.slice(0, start) + snippet + el.value.slice(end)
    // select the URL part so they can immediately type over it
    applyAndRefocus(el, next, start + text.length + 3, start + snippet.length - 1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = useCallback(() => {
    setMarkdown(draft)
    setIsEditing(false)
    onContentChange?.(draft)
  }, [draft, onContentChange])

  const handleCancel = useCallback(() => {
    setDraft(markdown)
    setIsEditing(false)
    setTab("write")
  }, [markdown])

  const handleReset = useCallback(() => {
    setDraft(clausesToMarkdown(consentDocumentClauses(patientDisplayName)))
  }, [patientDisplayName])

  /* ── render ── */
  return (
    <div className={cn("rounded-xl border border-border/80 bg-card/50 shadow-sm overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Informed consent — please review with the patient
        </p>
        {editable && !isEditing && (
          <Button
            type="button" variant="ghost" size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground"
            onClick={() => { setDraft(markdown); setIsEditing(true); setTab("write") }}
          >
            <Pencil className="h-3 w-3" /> Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <>
          {/* Write / Preview tabs */}
          <div className="flex border-b border-border/60 bg-muted/10">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors",
                  tab === t
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "write" ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Toolbar — only in write mode */}
          {tab === "write" && (
            <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-border/60 bg-muted/10">
              <span className="text-[10px] font-medium text-muted-foreground px-1">Heading</span>
              <ToolbarButton title="Heading 1" onClick={() => insertBlock("# Heading\n")}><Heading1 className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Heading 2" onClick={() => insertBlock("## Heading\n")}><Heading2 className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Heading 3" onClick={() => insertBlock("### Heading\n")}><Heading3 className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarSep />
              <span className="text-[10px] font-medium text-muted-foreground px-1">Format</span>
              <ToolbarButton title="Bold (Ctrl+B)" onClick={() => wrapInline("**", "**")}><Bold className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Italic (Ctrl+I)" onClick={() => wrapInline("_", "_")}><Italic className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Strikethrough" onClick={() => wrapInline("~~", "~~")}><Strikethrough className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Inline code" onClick={() => wrapInline("`", "`")}><Code className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarSep />
              <span className="text-[10px] font-medium text-muted-foreground px-1">List</span>
              <ToolbarButton title="Bullet list" onClick={() => insertBlock("- List item\n")}><List className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Numbered list" onClick={() => insertBlock("1. List item\n")}><ListOrdered className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Checklist" onClick={() => insertBlock("- [ ] Task item\n")}><CheckSquare className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarSep />
              <span className="text-[10px] font-medium text-muted-foreground px-1">Insert</span>
              <ToolbarButton title="Blockquote" onClick={() => insertBlock("> Blockquote\n")}><Quote className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Divider" onClick={() => insertBlock("---\n")}><Minus className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Link" onClick={insertLink}><Link className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton title="Table" onClick={() => insertBlock("| Col 1 | Col 2 | Col 3 |\n|---|---|---|\n| Cell | Cell | Cell |\n")}>
                <Table className="h-3.5 w-3.5" />
              </ToolbarButton>
            </div>
          )}

          {/* Textarea / Live preview */}
          {tab === "write" ? (
            <Textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="rounded-none border-0 border-b border-border/60 min-h-[200px] font-mono text-sm resize-y focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Write consent clauses in Markdown…"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "b" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); wrapInline("**", "**") }
                if (e.key === "i" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); wrapInline("_", "_") }
              }}
            />
          ) : (
            <div
              className={cn(
                "min-h-[200px] px-4 py-3 text-sm text-foreground/90 leading-relaxed",
                "prose prose-sm dark:prose-invert max-w-none",
                "[&_ul]:my-1 [&_li]:my-0.5 [&_p]:my-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm",
              )}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(draft) }}
            />
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 bg-muted/10 border-b border-border/60">
            <span className="text-[11px] text-muted-foreground">Markdown supported · Ctrl+B bold · Ctrl+I italic</span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Reset to default
            </button>
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-2 px-4 py-3">
            <Button type="button" size="sm" onClick={handleSave} className="gap-1.5 rounded-lg">
              <Check className="h-3.5 w-3.5" /> Save
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleCancel} className="gap-1.5 rounded-lg">
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
        </>
      ) : (
        /* Read-only rendered markdown */
        <div
          className={cn(
            "px-4 py-3 text-sm text-foreground/90 leading-relaxed",
            "prose prose-sm dark:prose-invert max-w-none",
            "[&_ul]:my-1 [&_li]:my-0.5 [&_p]:my-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm",
          )}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
        />
      )}

      {/* Clinician row */}
      <div className="px-4 py-3 border-t border-border/60">
        <p className="text-sm font-semibold text-foreground">Clinician</p>
      </div>
    </div>
  )
}