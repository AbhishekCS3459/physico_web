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

    h3("Pain:"),
    p("Pain ___/10    [ ] Intermittent    [ ] Constant"),
    emptyP(),
    p("What makes the pain worse:"),
    emptyP(),
    p("What helps:    [ ] Rest    [ ] Taking pain meds as needed    [ ] Applying heat/cold"),
    emptyP(),

    h3("PMHx:"),
    emptyP(),

    h3("Associated/Relevant Imaging:"),
    emptyP(),

    h3("Activity:"),
    emptyP(),

    h3("Exercises:"),
    emptyP(),

    h3("Observation:"),
    emptyP(),

    h3("Swelling/circulation:"),
    emptyP(),

    h3("ROM:"),
    p("Flexion ___    Extension ___    Abduction ___    Adduction ___    Internal rotation ___    External rotation ___"),
    emptyP(),

    h3("RIM/Strength:"),
    p("Flexion ___/5    Extension ___/5    Abduction ___/5    Adduction ___/5    Internal rotation ___/5    External rotation ___/5"),
    emptyP(),

    h3("Neuro (screening, reflexes, tension tests):"),
    emptyP(),

    h3("Tenderness:"),
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
      li("Stretching:"),
      li("HEP: reviewed, advised to continue"),
      li("Education:"),
      li("Restrictions:"),
      li("Print outs given to the patient:"),
    ]),
    emptyP(),

    h3("Consent:"),
    p("[ ] Consent was discussed and the patient was asked if they agree to proceed (questions answered)"),
    p("D Patt was provided with information about who will perform the treatment/procedure(s) Bharat Vishembera, PT and who may provide assistance in her care."),
    p("The scope of the treatment/procedure(s) plans/interventions and/or list of agreed upon treatment/procedure(s), that are clinically indicated and approved for the condition were explained."),
    p("The potential benefits, limitations, and possible risks of the assessment/treatment/intervention were discussed."),
    p("D Patt received the opportunity to ask questions."),
    p("D Patt Patterson provided consent to proceed with the visit."),
    p("D Patt was informed that she had the right to discontinue the appointment at any time. The decision to accept or refuse a treatment/procedure(s) shall not prejudice her access to ongoing or future health care."),
    p("Bharat Vishembera"),
    emptyP(),

    h3("Plan:"),
    bulletList([li("Ax strength"), li("Ax Range of Motion"), li("Exercise progression")]),
    emptyP(),
  ],
} as const

/** Returns the default chart notes as a JSON string for storing in the database. */
export function getDefaultChartNotesContentString(): string {
  return JSON.stringify(DEFAULT_CHART_NOTES_TEMPLATE)
}
