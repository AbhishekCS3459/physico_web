/**
 * Parses TipTap chart doc JSON into a section-based structure for the template form UI.
 * Serializes back to TipTap JSON so storage format stays unchanged.
 */

export interface CheckboxOption {
  label: string
  checked: boolean
}

export interface CheckboxLine {
  /** Text before the first [ ] or [x] (e.g. "Pain ___/10") */
  prefix: string
  options: CheckboxOption[]
}

export interface ChartSection {
  /** Section title (from h3, or main title from h2) */
  title: string
  /** Level 2 = main title, 3 = section */
  level: 2 | 3
  /** Lines that contain [ ] / [x] options */
  checkboxLines: CheckboxLine[]
  /** Free-form notes (paragraphs that aren't checkbox lines), joined with \n\n */
  notes: string
  /** Bullet list items (e.g. Treatment section) */
  listItems: string[]
}

export interface ParsedChartDoc {
  mainTitle: string
  sections: ChartSection[]
}

/** Extract plain text from a TipTap node (paragraph, heading, list item). */
function getTextFromNode(node: { type: string; content?: unknown[] }): string {
  if (!node.content || !Array.isArray(node.content)) return ""
  return node.content
    .map((c: unknown) => {
      if (typeof c === "object" && c !== null && "text" in c && typeof (c as { text: string }).text === "string")
        return (c as { text: string }).text
      if (typeof c === "object" && c !== null && "content" in c && Array.isArray((c as { content: unknown[] }).content))
        return getTextFromNode(c as { type: string; content: unknown[] })
      return ""
    })
    .join("")
}

/** Check if a string contains at least one "[ ]" or "[x]" pattern. */
function hasCheckboxPattern(text: string): boolean {
  return /\[\s*[x ]\s*\]/i.test(text)
}

/**
 * Parse a line like "Pain ___/10    [ ] Intermittent    [ ] Constant" into
 * { prefix: "Pain ___/10", options: [{ label: "Intermittent", checked: false }, ...] }
 */
export function parseCheckboxLine(line: string): CheckboxLine | null {
  const regex = /\[\s*([x ]?)\s*\]\s*([^[\]]+?)(?=\s*\[\s*[x ]\s*\]|$)/gi
  const options: CheckboxOption[] = []
  let match: RegExpExecArray | null
  let prefix = line
  let firstIndex = -1
  while ((match = regex.exec(line)) !== null) {
    if (firstIndex < 0) firstIndex = match.index
    const checked = (match[1] || " ").toLowerCase() === "x"
    const label = (match[2] || "").trim()
    if (label) options.push({ label, checked })
  }
  if (options.length === 0) return null
  prefix = firstIndex >= 0 ? line.slice(0, firstIndex) : line
  return { prefix: prefix.trimEnd(), options }
}

/** Build a single checkbox line back to string for storage. */
export function serializeCheckboxLine(line: CheckboxLine): string {
  const parts = line.options.map((o) => `[${o.checked ? "x" : " "}] ${o.label}`)
  return line.prefix ? `${line.prefix}    ${parts.join("    ")}` : parts.join("    ")
}

/** Parse TipTap doc JSON (as object or string) into ParsedChartDoc. */
export function parseChartDoc(doc: unknown): ParsedChartDoc | null {
  const raw = typeof doc === "string" ? (() => { try { return JSON.parse(doc) } catch { return null } })() : doc
  if (!raw || typeof raw !== "object" || (raw as { type?: string }).type !== "doc") return null
  const content = (raw as { content?: unknown[] }).content
  if (!Array.isArray(content)) return { mainTitle: "", sections: [] }

  let mainTitle = ""
  const sections: ChartSection[] = []
  let current: ChartSection = {
    title: "",
    level: 3,
    checkboxLines: [],
    notes: "",
    listItems: [],
  }
  const noteChunks: string[] = []

  function pushCurrent() {
    if (current.title) {
      current.notes = noteChunks.join("\n\n").trim()
      sections.push({
        ...current,
        notes: current.notes,
      })
    }
    noteChunks.length = 0
    current = {
      title: "",
      level: 3,
      checkboxLines: [],
      notes: "",
      listItems: [],
    }
  }

  for (let i = 0; i < content.length; i++) {
    const node = content[i] as { type: string; attrs?: { level?: number }; content?: unknown[] }
    if (!node || typeof node.type !== "string") continue

    if (node.type === "heading") {
      const text = getTextFromNode(node).trim()
      const level = (node.attrs?.level ?? 2) as number
      if (level === 2) {
        pushCurrent()
        mainTitle = text
      } else {
        pushCurrent()
        current.title = text
        current.level = 3
      }
      continue
    }

    if (node.type === "paragraph") {
      const text = getTextFromNode(node)
      if (hasCheckboxPattern(text)) {
        const parsed = parseCheckboxLine(text)
        if (parsed) current.checkboxLines.push(parsed)
        else noteChunks.push(text)
      } else {
        noteChunks.push(text)
      }
      continue
    }

    if (node.type === "bulletList" && Array.isArray(node.content)) {
      current.listItems = []
      for (const item of node.content) {
        const itemNode = item as { type: string; content?: unknown[] }
        if (itemNode?.type === "listItem") current.listItems.push(getTextFromNode(itemNode).trim())
      }
      continue
    }
  }

  pushCurrent()
  return { mainTitle, sections }
}

/**
 * Rebuild TipTap doc JSON from ParsedChartDoc.
 * Preserves structure: doc > content array of heading, paragraph, bulletList nodes.
 */
export function serializeChartDoc(parsed: ParsedChartDoc): object {
  const content: object[] = []

  function h2(text: string) {
    content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] })
  }
  function h3(text: string) {
    content.push({ type: "heading", attrs: { level: 3 }, content: [{ type: "text", text }] })
  }
  function p(text: string) {
    content.push({
      type: "paragraph",
      content: text ? [{ type: "text", text }] : [],
    })
  }
  function emptyP() {
    content.push({ type: "paragraph", content: [] })
  }
  function bulletList(items: string[]) {
    content.push({
      type: "bulletList",
      content: items.map((t) => ({
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text: t }] }],
      })),
    })
  }

  if (parsed.mainTitle) h2(parsed.mainTitle)

  for (const section of parsed.sections) {
    h3(section.title)

    for (const line of section.checkboxLines) {
      p(serializeCheckboxLine(line))
      emptyP()
    }

    if (section.listItems.length > 0) {
      bulletList(section.listItems.filter(Boolean))
      emptyP()
    }

    if (section.notes) {
      const paragraphs = section.notes.split(/\n\n+/)
      for (const para of paragraphs) p(para)
    }
    emptyP()
  }

  return { type: "doc", content }
}
