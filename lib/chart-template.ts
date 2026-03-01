/**
 * Default chart notes template (Initial Assessment) so doctors see a structured
 * form instead of an empty chart. Hierarchy matches the clinical form:
 * main title → section headings (h3) → prompts and sub-items. Plan is left
 * blank for the doctor to write themselves.
 */

function p(text: string): { type: "paragraph"; content: [{ type: "text"; text: string }] } {
  return { type: "paragraph", content: [{ type: "text", text }] }
}

function h2(text: string): { type: "heading"; attrs: { level: number }; content: [{ type: "text"; text: string }] } {
  return { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] }
}

function h3(text: string): { type: "heading"; attrs: { level: number }; content: [{ type: "text"; text: string }] } {
  return { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text }] }
}

function emptyP(): { type: "paragraph"; content: [] } {
  return { type: "paragraph", content: [] }
}

function li(text: string): { type: "listItem"; content: [{ type: "paragraph"; content: [{ type: "text"; text: string }] }] } {
  return {
    type: "listItem",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  }
}

function bulletList(items: Array<{ type: "listItem"; content: unknown[] }>): { type: "bulletList"; content: unknown[] } {
  return { type: "bulletList", content: items }
}

/** Tiptap/ProseMirror JSON document for default chart notes (Initial Assessment). */
export const DEFAULT_CHART_NOTES_TEMPLATE = {
  type: "doc",
  content: [
    h2("INITIAL ASSESSMENT"),

    h3("Reason for Referral:"),
    emptyP(),

    h3("HPI:"),
    emptyP(),

    h3("Pain description"),
    p("Pain ___/10    [ ] Intermittent    [ ] Constant"),
    emptyP(),
    p("What makes the pain worse:"),
    emptyP(),
    p("What helps:    [ ] Rest    [ ] Pain medication    [ ] Heat/cold pack"),
    emptyP(),

    h3("PMHx:"),
    emptyP(),

    h3("Associated/Relevant Imaging:"),
    emptyP(),

    h3("Baseline Physical Activity/occupation/leisure activities:"),
    emptyP(),

    h3("Observation:"),
    emptyP(),

    h3("Swelling/circulation:"),
    emptyP(),

    h3("ROM:"),
    p("Flex ___    Abd ___"),
    emptyP(),

    h3("RIM/Strength:"),
    p("Flex ___/5    Abd ___/5"),
    emptyP(),

    h3("Neuro (screening, reflexes, tension tests):"),
    emptyP(),

    h3("Palpation:"),
    emptyP(),

    h3("Special Tests/Outcome measures:"),
    emptyP(),

    h3("Clinical Impression/Analysis:"),
    emptyP(),

    h3("Goal:"),
    emptyP(),

    h3("Treatment:"),
    bulletList([
      li("Modality:"),
      li("ROM:"),
      li("Strengthening:"),
      li("Stretching"),
      li("HEP: reviewed, advised to continue"),
      li("Education: Education and postural retraining."),
      li("Restrictions:"),
      li("Print outs given to the patient."),
    ]),
    emptyP(),

    h3("Plan:"),
    emptyP(),
    emptyP(),
  ],
} as const

/** Returns the default chart notes as a JSON string for storing in the database. */
export function getDefaultChartNotesContentString(): string {
  return JSON.stringify(DEFAULT_CHART_NOTES_TEMPLATE)
}
