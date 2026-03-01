"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Type,
  Loader2,
  FileText,
  Eye,
  Code,
} from "lucide-react"

export type ChartViewMode = "edit" | "preview" | "code"

export interface ChartEditorProps {
  initialContent: string | null
  editable: boolean
  onSave?: (content: string) => void | Promise<void> | Promise<boolean>
  saving?: boolean
  onAfterDraftSave?: () => void
  className?: string
}

function parseContent(value: string | null): object | undefined {
  if (!value || value.trim() === "") return undefined
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === "object" && parsed !== null ? parsed : undefined
  } catch {
    return undefined
  }
}

const editorContentClass =
  "min-h-[280px] px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-0 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2"

export function ChartEditor({
  initialContent,
  editable,
  onSave,
  saving = false,
  onAfterDraftSave,
  className,
}: ChartEditorProps) {
  const [viewMode, setViewMode] = useState<ChartViewMode>("edit")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const content = parseContent(initialContent)

  const editor = useEditor({
    extensions: [StarterKit],
    content: content ?? undefined,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: editorContentClass,
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const isEditView = viewMode === "edit"
    editor.setEditable(editable && isEditView)
  }, [editor, editable, viewMode])

  // Sync content only when prop changes (e.g. after save from server); avoid overwriting while user types
  const prevContentRef = React.useRef(initialContent)
  useEffect(() => {
    if (!editor || initialContent === undefined) return
    if (prevContentRef.current !== initialContent) {
      prevContentRef.current = initialContent
      const next = parseContent(initialContent)
      if (next !== undefined) editor.commands.setContent(next, false)
    }
  }, [editor, initialContent])

  const handleSave = useCallback(() => {
    if (!editor || !onSave) return
    const json = editor.getJSON()
    onSave(JSON.stringify(json))
  }, [editor, onSave])

  const handleSaveDraftAndClose = useCallback(async () => {
    if (!editor || !onSave || !onAfterDraftSave) return
    const json = editor.getJSON()
    const result = await Promise.resolve(onSave(JSON.stringify(json)))
    if (result === true) onAfterDraftSave()
  }, [editor, onSave, onAfterDraftSave])

  if (!mounted || !editor) {
    return (
      <div className={cn("flex items-center justify-center min-h-[200px] border rounded-lg bg-muted/30", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      {/* Gist-style tabs: Edit | Preview | Code */}
      <div className="flex flex-wrap items-center gap-0 border-b bg-muted/40">
        <div className="flex rounded-t-md overflow-hidden">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-none border-b-2 border-transparent px-3 py-2 h-auto font-medium",
              viewMode === "edit"
                ? "border-primary bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("edit")}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-none border-b-2 border-transparent px-3 py-2 h-auto font-medium",
              viewMode === "preview"
                ? "border-primary bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("preview")}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-none border-b-2 border-transparent px-3 py-2 h-auto font-medium",
              viewMode === "code"
                ? "border-primary bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("code")}
          >
            <Code className="h-4 w-4 mr-1.5" />
            Code
          </Button>
        </div>
        {editable && viewMode === "edit" && (
          <>
            <span className="mx-1 h-5 w-px bg-border hidden sm:block" />
            <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 flex-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <span className="mx-1 h-5 w-px bg-border" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <Heading3 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().toggleParagraph().run()}
              >
                <Type className="h-4 w-4" />
              </Button>
              <span className="mx-1 h-5 w-px bg-border" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>
            {onSave && (
              <div className="ml-auto mr-2 flex gap-1 shrink-0">
                <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
                  Save chart
                </Button>
                {onAfterDraftSave && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleSaveDraftAndClose}
                    disabled={saving}
                  >
                    Save as draft & close
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Always keep EditorContent mounted to avoid ProseMirror removeChild errors when switching tabs */}
      <div
        className={cn(
          viewMode === "code" && "invisible absolute h-0 w-0 overflow-hidden -z-10 pointer-events-none"
        )}
        aria-hidden={viewMode === "code"}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Code view: raw JSON (visible only when Code tab active) */}
      {viewMode === "code" && (
        <div className="min-h-[280px] max-h-[480px] overflow-auto bg-muted/20 p-4">
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words m-0">
            <code>{JSON.stringify(editor.getJSON(), null, 2)}</code>
          </pre>
        </div>
      )}

    </div>
  )
}
