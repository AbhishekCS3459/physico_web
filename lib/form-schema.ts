/**
 * Form template schema (Google-Forms-style).
 * Stored as JSON in FormTemplate.schema; responses stored in PatientChart.content.
 */

export const FORM_SCHEMA_VERSION = 1 as const

export type FormFieldType =
  | "section"
  | "short_text"
  | "long_text"
  | "checkbox"
  | "radio"
  | "dropdown"

export interface FormFieldBase {
  id: string
  type: FormFieldType
  label: string
  required?: boolean
}

export interface FormFieldSection extends FormFieldBase {
  type: "section"
  title: string
}

export interface FormFieldShortText extends FormFieldBase {
  type: "short_text"
  placeholder?: string
}

export interface FormFieldLongText extends FormFieldBase {
  type: "long_text"
  placeholder?: string
}

export interface FormFieldCheckbox extends FormFieldBase {
  type: "checkbox"
  options: string[]
  allowOther?: boolean
}

export interface FormFieldRadio extends FormFieldBase {
  type: "radio"
  options: string[]
  allowOther?: boolean
}

export interface FormFieldDropdown extends FormFieldBase {
  type: "dropdown"
  options: string[]
}

export type FormField =
  | FormFieldSection
  | FormFieldShortText
  | FormFieldLongText
  | FormFieldCheckbox
  | FormFieldRadio
  | FormFieldDropdown

export interface FormSchema {
  version: typeof FORM_SCHEMA_VERSION
  fields: FormField[]
}

export type FormResponses = Record<string, string | string[] | null>

/** Fields that collect a response (exclude section) */
export function isResponseField(f: FormField): f is Exclude<FormField, FormFieldSection> {
  return f.type !== "section"
}

export function createEmptyResponses(schema: FormSchema): FormResponses {
  const out: FormResponses = {}
  for (const f of schema.fields) {
    if (f.type === "section") continue
    if (f.type === "checkbox") out[f.id] = []
    else out[f.id] = null
  }
  return out
}

export function parseFormSchema(json: string | null): FormSchema | null {
  if (!json || json.trim() === "") return null
  try {
    const raw = JSON.parse(json) as unknown
    if (typeof raw !== "object" || raw === null) return null
    const obj = raw as { version?: number; fields?: unknown[] }
    if (obj.version !== FORM_SCHEMA_VERSION || !Array.isArray(obj.fields)) return null
    const fields = obj.fields.filter(
      (f): f is FormField =>
        typeof f === "object" &&
        f !== null &&
        typeof (f as FormField).id === "string" &&
        typeof (f as FormField).type === "string" &&
        typeof (f as FormField).label === "string"
    )
    return { version: FORM_SCHEMA_VERSION, fields }
  } catch {
    return null
  }
}

export function parseFormResponses(json: string | null): FormResponses {
  if (!json || json.trim() === "") return {}
  try {
    const raw = JSON.parse(json) as unknown
    if (typeof raw !== "object" || raw === null) return {}
    return raw as FormResponses
  } catch {
    return {}
  }
}

export function generateFieldId(): string {
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

/** Default Initial Assessment form schema matching the current chart (Reason for Referral, HPI, Pain, Treatment, Plan, etc.) */
export const DEFAULT_INITIAL_ASSESSMENT_TEMPLATE_NAME = "Default (Initial Assessment)"

/** Standalone consent step (chart `consentContent`); complete before initial assessment. */
export function getConsentOnlyFormSchema(): FormSchema {
  return {
    version: FORM_SCHEMA_VERSION,
    fields: [
      { id: "s_consent", type: "section", label: "Section", title: "Consent:" },
      {
        id: "consent_asked",
        type: "checkbox",
        label: "Consent asked",
        options: ["Consent was discussed and the patient was asked to proceed (questions answered)"],
        required: false,
      },
    ],
  }
}

export const CONSENT_ONLY_FORM_SCHEMA_JSON = JSON.stringify(getConsentOnlyFormSchema())

export function getDefaultInitialAssessmentFormSchema(): FormSchema {
  return {
    version: FORM_SCHEMA_VERSION,
    fields: [
      { id: "s_main", type: "section", label: "Section", title: "INITIAL ASSESSMENT" },
      { id: "s_referral", type: "section", label: "Section", title: "Reason for Referral:" },
      { id: "reason_for_referral", type: "long_text", label: "Reason for Referral", required: false },
      { id: "s_hpi", type: "section", label: "Section", title: "HPI:" },
      { id: "hpi", type: "long_text", label: "HPI", required: false },
      { id: "s_pain", type: "section", label: "Section", title: "Pain description" },
      { id: "pain_level", type: "short_text", label: "Pain", placeholder: "e.g. ___/10", required: false },
      { id: "pain_type", type: "radio", label: "Pain type", options: ["Intermittent", "Constant"], required: false },
      { id: "what_makes_worse", type: "long_text", label: "What makes the pain worse", required: false },
      { id: "what_helps", type: "checkbox", label: "What helps", options: ["Rest", "Pain medication", "Heat/cold pack"], allowOther: true, required: false },
      { id: "s_pmhx", type: "section", label: "Section", title: "PMHx:" },
      { id: "pmhx", type: "long_text", label: "PMHx", required: false },
      { id: "s_imaging", type: "section", label: "Section", title: "Associated/Relevant Imaging:" },
      { id: "imaging", type: "long_text", label: "Associated/Relevant Imaging", required: false },
      { id: "s_baseline", type: "section", label: "Section", title: "Baseline Physical Activity/occupation/leisure activities:" },
      { id: "baseline_activity", type: "long_text", label: "Baseline Physical Activity/occupation/leisure activities", required: false },
      { id: "s_observation", type: "section", label: "Section", title: "Observation:" },
      { id: "observation", type: "long_text", label: "Observation", required: false },
      { id: "s_swelling", type: "section", label: "Section", title: "Swelling/circulation:" },
      { id: "swelling", type: "long_text", label: "Swelling/circulation", required: false },
      { id: "s_rom", type: "section", label: "Section", title: "ROM:" },
      {
        id: "rom",
        type: "short_text",
        label: "ROM",
        placeholder:
          "Flex ___    Ext ___    Abd ___    Add ___    IR ___    ER ___",
        required: false,
      },
      { id: "s_strength", type: "section", label: "Section", title: "RIM/Strength:" },
      {
        id: "strength",
        type: "short_text",
        label: "RIM/Strength",
        placeholder:
          "Flex ___/5    Ext ___/5    Abd ___/5    Add ___/5    IR ___/5    ER ___/5",
        required: false,
      },
      { id: "s_neuro", type: "section", label: "Section", title: "Neuro (screening, reflexes, tension tests):" },
      { id: "neuro", type: "long_text", label: "Neuro", required: false },
      { id: "s_palpation", type: "section", label: "Section", title: "Palpation:" },
      { id: "palpation", type: "long_text", label: "Palpation", required: false },
      { id: "s_special_tests", type: "section", label: "Section", title: "Special Tests/Outcome measures:" },
      { id: "special_tests", type: "long_text", label: "Special Tests/Outcome measures", required: false },
      { id: "s_impression", type: "section", label: "Section", title: "Clinical Impression/Analysis:" },
      { id: "clinical_impression", type: "long_text", label: "Clinical Impression/Analysis", required: false },
      { id: "s_goal", type: "section", label: "Section", title: "Goal:" },
      { id: "goal", type: "long_text", label: "Goal", required: false },
      { id: "s_treatment", type: "section", label: "Section", title: "Treatment:" },
      { id: "treatment_modality", type: "checkbox", label: "Modality", options: ["None", "Heat", "Ice", "Ultrasound", "Electrical stimulation", "Manual therapy", "Other"], allowOther: true, required: false },
      { id: "treatment_rom", type: "checkbox", label: "ROM", options: ["None", "AAROM", "AROM", "PROM", "Active-assisted", "Other"], allowOther: true, required: false },
      { id: "treatment_strengthening", type: "checkbox", label: "Strengthening", options: ["None", "Isometric", "Isotonic", "Theraband", "Weights", "Functional", "Other"], allowOther: true, required: false },
      { id: "treatment_stretching", type: "checkbox", label: "Stretching", options: ["None", "Static", "Dynamic", "PNF", "Ballistic", "Other"], allowOther: true, required: false },
      { id: "treatment_hep", type: "checkbox", label: "HEP", options: ["None", "Reviewed, advised to continue", "New HEP given", "Modified HEP", "Other"], allowOther: true, required: false },
      { id: "treatment_education", type: "checkbox", label: "Education", options: ["None", "Education and postural retraining", "Postural retraining", "Activity modification", "Body mechanics", "Other"], allowOther: true, required: false },
      { id: "treatment_restrictions", type: "checkbox", label: "Restrictions", options: ["None", "Weight-bearing", "ROM restrictions", "Activity modification", "Other"], allowOther: true, required: false },
      { id: "treatment_handouts", type: "checkbox", label: "Print outs given to the patient", options: ["No", "Yes", "Other"], allowOther: true, required: false },
      { id: "s_plan", type: "section", label: "Section", title: "Plan:" },
      { id: "plan", type: "long_text", label: "Plan", required: false },
    ],
  }
}
