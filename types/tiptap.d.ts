declare module "@tiptap/react" {
  import type { ComponentType } from "react"
  export interface Editor {
    setEditable: (editable: boolean) => void
    commands: { setContent: (content: object, emitUpdate?: boolean) => void }
    getJSON: () => object
    chain: () => Chain
    can: () => Chain
  }
  export interface Chain {
    focus: () => Chain
    chain: () => Chain
    toggleBold: () => Chain
    toggleItalic: () => Chain
    toggleHeading: (opts: { level: number }) => Chain
    toggleParagraph: () => Chain
    toggleBulletList: () => Chain
    toggleOrderedList: () => Chain
    run: () => boolean
  }
  export function useEditor(options?: unknown): Editor | null
  export const EditorContent: ComponentType<{ editor: Editor | null; className?: string }>
  export const BubbleMenu: ComponentType<{
    editor: Editor | null
    children: React.ReactNode
    tippyOptions?: { duration: number }
    className?: string
  }>
}

declare module "@tiptap/starter-kit" {
  const StarterKit: unknown
  export default StarterKit
}
