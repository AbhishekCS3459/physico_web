/**
 * Default chart notes template (Initial Assessment) so doctors see a structured
 * form instead of an empty chart. Hierarchy matches the clinical form:
 * main title → section headings (h3) → prompts and sub-items. Plan is left
 * blank for the doctor to write themselves.
 *
 * Consent appears first (after the main title). Patient name uses {{patient_name}}
 * and is filled when the chart is created or at display time via interpolatePatientNameInTipTapJson.
 */

import { interpolatePatientNameInTipTapJson } from "@/lib/consent-copy"

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

const PATIENT = "{{patient_name}}"

/** Tiptap/ProseMirror JSON document for default chart notes (Initial Assessment). */
export const DEFAULT_CHART_NOTES_TEMPLATE = {
  type: "doc",
  content: [
    h2("INITIAL ASSESSMENT"),

    h3("Consent:"),
    p("[ ] Consent was discussed and the patient was asked to proceed (questions answered)"),
    p(
      `${PATIENT} was provided with information about who will perform the treatment/procedure(s) Bharat Vishembera, PT and who may provide assistance in their care.`,
    ),
    p("The scope of the treatment/procedure(s) plans/interventions and/or list of agreed upon treatment/procedure(s), that are clinically indicated and approved for the condition were explained."),
    p("The potential benefits, limitations, and possible risks of the assessment/treatment/intervention were discussed."),
    p(`${PATIENT} received the opportunity to ask questions.`),
    p(`${PATIENT} provided consent to proceed with the visit.`),
    p(
      `${PATIENT} was informed that they have the right to discontinue the appointment at any time. The decision to accept or refuse a treatment or procedure shall not prejudice their access to ongoing or future health care.`,
    ),
    p("Bharat Vishembera, PT"),
    emptyP(),

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
    p("Flex ___    Ext ___    Abd ___    Add ___    IR ___    ER ___"),
    emptyP(),

    h3("RIM/Strength:"),
    p("Flex ___/5    Ext ___/5    Abd ___/5    Add ___/5    IR ___/5    ER ___/5"),
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

    h3("Plan:"),
    bulletList([li("Ax strength"), li("Ax Range of Motion"), li("Exercise progression")]),
    emptyP(),
  ],
} as const

/**
 * Returns the default chart notes as a JSON string for storing in the database.
 * When patientDisplayName is set, {{patient_name}} is replaced in the JSON (e.g. on chart create).
 * Otherwise the token is kept for client-side interpolation when the chart is opened.
 */
export function getDefaultChartNotesContentString(patientDisplayName?: string): string {
  const raw = JSON.stringify(DEFAULT_CHART_NOTES_TEMPLATE)
  if (patientDisplayName?.trim()) {
    return interpolatePatientNameInTipTapJson(raw, patientDisplayName.trim())
  }
  return raw
}
