/**
 * Parse/serialize ROM and RIM/Strength one-line notes (chart sections + form fields).
 * Kept framework-free so DynamicFormFiller and ChartTemplateForm can share logic.
 */

export type ParsedRomNotes = {
  flexion: string
  extension: string
  abduction: string
  adduction: string
  internalRotation: string
  externalRotation: string
  additionalNotes: string
}

export type ParsedRimStrengthNotes = ParsedRomNotes

export function parseRimStrengthNotes(notes: string): ParsedRimStrengthNotes {
  const parts = notes.split(/\n\n+/)
  const firstLine = (parts[0] ?? "").trim()
  const additionalNotes = parts.slice(1).join("\n\n").trim()

  const normalize = (v: string | undefined): string => {
    const val = (v ?? "").trim()
    return val === "___" ? "" : val
  }

  const matchValue = (regexes: RegExp[]): string => {
    for (const re of regexes) {
      const m = firstLine.match(re)
      if (m && typeof m[1] === "string") return normalize(m[1])
    }
    return ""
  }

  const flexion = matchValue([/(?:Flexion|Flex)\s*(___|\d+)\s*\/\s*5/i])
  const extension = matchValue([/(?:Extension|Ext)\s*(___|\d+)\s*\/\s*5/i])
  const abduction = matchValue([/(?:Abduction|Abd)\s*(___|\d+)\s*\/\s*5/i])
  const adduction = matchValue([/(?:Adduction|Add)\s*(___|\d+)\s*\/\s*5/i])
  const internalRotation = matchValue([/(?:Internal rotation|IR)\s*(___|\d+)\s*\/\s*5/i])
  const externalRotation = matchValue([/(?:External rotation|ER)\s*(___|\d+)\s*\/\s*5/i])

  return {
    flexion,
    extension,
    abduction,
    adduction,
    internalRotation,
    externalRotation,
    additionalNotes,
  }
}

export function formatRimStrengthNotes(
  flexion: string,
  extension: string,
  abduction: string,
  adduction: string,
  internalRotation: string,
  externalRotation: string,
  additionalNotes: string,
): string {
  const seg = (v: string): string => (v ? `${v}/5` : "___/5")
  const line = `Flex ${seg(flexion)}    Ext ${seg(extension)}    Abd ${seg(abduction)}    Add ${seg(
    adduction,
  )}    IR ${seg(internalRotation)}    ER ${seg(externalRotation)}`
  return additionalNotes ? `${line}\n\n${additionalNotes}` : line
}

export function parseRomNotes(notes: string): ParsedRomNotes {
  const parts = notes.split(/\n\n+/)
  const firstLine = (parts[0] ?? "").trim()
  const additionalNotes = parts.slice(1).join("\n\n").trim()

  const normalize = (v: string | undefined): string => {
    const val = (v ?? "").trim()
    return val === "___" ? "" : val
  }

  const matchValue = (regexes: RegExp[]): string => {
    for (const re of regexes) {
      const m = firstLine.match(re)
      if (m && typeof m[1] === "string") return normalize(m[1])
    }
    return ""
  }

  const flexion = matchValue([/(?:Flexion|Flex)\s*:? ?(___|\d+(?:\.\d+)?)\b/i])
  const extension = matchValue([/(?:Extension|Ext)\s*:? ?(___|\d+(?:\.\d+)?)\b/i])
  const abduction = matchValue([/(?:Abduction|Abd)\s*:? ?(___|\d+(?:\.\d+)?)\b/i])
  const adduction = matchValue([/(?:Adduction|Add)\s*:? ?(___|\d+(?:\.\d+)?)\b/i])
  const internalRotation = matchValue([/(?:Internal rotation|IR)\s*:? ?(___|\d+(?:\.\d+)?)\b/i])
  const externalRotation = matchValue([/(?:External rotation|ER)\s*:? ?(___|\d+(?:\.\d+)?)\b/i])

  return {
    flexion,
    extension,
    abduction,
    adduction,
    internalRotation,
    externalRotation,
    additionalNotes,
  }
}

export function formatRomNotes(
  flexion: string,
  extension: string,
  abduction: string,
  adduction: string,
  internalRotation: string,
  externalRotation: string,
  additionalNotes: string,
): string {
  const seg = (v: string): string => v.trim() || "___"
  const line = `Flex ${seg(flexion)}    Ext ${seg(extension)}    Abd ${seg(abduction)}    Add ${seg(
    adduction,
  )}    IR ${seg(internalRotation)}    ER ${seg(externalRotation)}`
  return additionalNotes ? `${line}\n\n${additionalNotes}` : line
}

/** Shown above ROM/RIM grids so the shorthand is explicit in the UI */
export const ROM_RIM_MOTION_LEGEND =
  "Flex (flexion) · Ext (extension) · Abd (abduction) · Add (adduction) · IR (internal rotation) · ER (external rotation)"
