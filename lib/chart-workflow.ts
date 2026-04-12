export type ChartWorkflowPhase = "consent" | "initial" | "active"

export function getChartWorkflowPhase(chart: {
  consentCompletedAt: string | null
  initialAssessmentCompletedAt: string | null
}): ChartWorkflowPhase {
  if (!chart.consentCompletedAt) return "consent"
  if (!chart.initialAssessmentCompletedAt) return "initial"
  return "active"
}
