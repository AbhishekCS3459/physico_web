"use client"

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import React, { useCallback, useEffect } from "react"
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
} from "lucide-react"

export interface ChartEditorProps {
  initialContent: string | null
  editable: boolean
  onSave?: (content: string) => void
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

export function ChartEditor({
  initialContent,
  editable,
  onSave,
  className,
}: ChartEditorProps) {
  const content = parseContent(initialContent)

  const editor = useEditor({
    extensions: [StarterKit],
    content: content ?? undefined,
    editable,
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-0 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2",
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(editable)
  }, [editor, editable])

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

  if (!editor) {
    return (
      <div className={cn("flex items-center justify-center min-h-[200px] border rounded-lg bg-muted/30", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      {editable && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 px-2 py-1.5">
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
            {onSave && (
              <>
                <span className="flex-1" />
                <Button type="button" size="sm" onClick={handleSave}>
                  Save chart
                </Button>
              </>
            )}
          </div>
          {/* Bubble menu on text selection */}
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="flex gap-0.5 rounded-md border bg-background p-1 shadow-md"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </BubbleMenu>
        </>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
