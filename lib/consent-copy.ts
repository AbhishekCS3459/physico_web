/**
 * Consent document copy: patient name token and interpolation for chart JSON + form UI.
 */

export const PATIENT_NAME_TOKEN = "{{patient_name}}"

export function resolvePatientDisplayName(parts: {
  patient?: { firstName: string; lastName?: string | null } | null
  booking?: { firstName: string; lastName: string } | null
}): string {
  if (parts.patient) {
    const s = [parts.patient.firstName, parts.patient.lastName].filter(Boolean).join(" ").trim()
    if (s) return s
  }
  if (parts.booking) {
    const s = `${parts.booking.firstName} ${parts.booking.lastName}`.trim()
    if (s) return s
  }
  return "the patient"
}

/** Replace token and legacy sample names in plain text */
export function interpolatePatientName(text: string, displayName: string): string {
  const name = displayName.trim() || "the patient"
  return text
    .split(PATIENT_NAME_TOKEN)
    .join(name)
    .replace(/\bD Patt Patterson\b/gi, name)
    .replace(/\bD Patt\b/gi, name)
}

/** Walk TipTap/ProseMirror JSON and interpolate all text nodes */
export function interpolatePatientNameInTipTapJson(jsonString: string, displayName: string): string {
  try {
    const doc = JSON.parse(jsonString) as { content?: unknown[] }
    const walk = (node: unknown): void => {
      if (!node || typeof node !== "object") return
      const o = node as Record<string, unknown>
      if (o.type === "text" && typeof o.text === "string") {
        o.text = interpolatePatientName(o.text, displayName)
      }
      if (Array.isArray(o.content)) o.content.forEach(walk)
    }
    if (Array.isArray(doc.content)) doc.content.forEach(walk)
    return JSON.stringify(doc)
  } catch {
    return jsonString
  }
}

/** Standard consent clauses (already gender-neutral where needed); pass resolved patient label */
export function consentDocumentClauses(patientDisplayName: string): string[] {
  const name = patientDisplayName.trim() || "the patient"
  return [
    `${name} was provided with information about who will perform the treatment/procedure(s) Bharat Vishembera Vishembera, PT and who may provide assistance in their care.`,
    "The scope of the treatment/procedure(s) plans/interventions and/or list of agreed upon treatment/procedure(s), that are clinically indicated and approved for the condition were explained.",
    "The potential benefits, limitations, and possible risks of the assessment/treatment/intervention were discussed.",
    `${name} received the opportunity to ask questions.`,
    `${name} provided consent to proceed with the visit.`,
    `${name} was informed that they have the right to discontinue the appointment at any time. The decision to accept or refuse a treatment or procedure shall not prejudice their access to ongoing or future health care.`,
  ]
}
