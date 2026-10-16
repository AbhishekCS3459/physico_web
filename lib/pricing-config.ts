import { z } from "zod"

export const SERVICE_IDS = ["physiotherapy", "occupational-therapy", "massage-therapy"] as const
export type ServiceId = (typeof SERVICE_IDS)[number]

export const SERVICE_STATUSES = ["available", "contact", "coming-soon"] as const
export type ServiceStatus = (typeof SERVICE_STATUSES)[number]

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  available: "Show prices",
  contact: "Contact us for pricing",
  "coming-soon": "Coming soon",
}

const sessionSchema = z.object({
  id: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1, "Session name is required").max(80),
  durationMinutes: z.number().int().min(5).max(480),
  price: z.number().min(0).max(10000),
})

const serviceSchema = z.object({
  id: z.enum(SERVICE_IDS),
  name: z.string().trim().min(1).max(80),
  status: z.enum(SERVICE_STATUSES),
  sessions: z.array(sessionSchema).max(10),
})

const additionalFeeSchema = z.object({
  id: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1, "Fee name is required").max(120),
  amount: z.string().trim().min(1, "Fee amount is required").max(40),
})

export const pricingConfigSchema = z
  .object({
    services: z.array(serviceSchema).length(SERVICE_IDS.length),
    additionalFees: z.array(additionalFeeSchema).max(20),
  })
  .superRefine((config, ctx) => {
    const ids = new Set(config.services.map((s) => s.id))
    if (ids.size !== SERVICE_IDS.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Each service must appear exactly once" })
    }
    config.services.forEach((service, index) => {
      if (service.status === "available" && service.sessions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["services", index, "sessions"],
          message: `${service.name} needs at least one session to show prices`,
        })
      }
    })
  })

export type PricingSession = z.infer<typeof sessionSchema>
export type ServicePricing = z.infer<typeof serviceSchema>
export type AdditionalFee = z.infer<typeof additionalFeeSchema>
export type PricingConfig = z.infer<typeof pricingConfigSchema>

export const DEFAULT_PRICING: PricingConfig = {
  services: [
    {
      id: "physiotherapy",
      name: "Physiotherapy",
      status: "available",
      sessions: [
        { id: "initial", label: "Initial Assessment", durationMinutes: 60, price: 150 },
        { id: "followup", label: "Follow-Up Session", durationMinutes: 45, price: 150 },
      ],
    },
    {
      id: "occupational-therapy",
      name: "Occupational Therapy",
      status: "available",
      sessions: [
        { id: "initial", label: "Initial Assessment", durationMinutes: 60, price: 150 },
        { id: "followup", label: "Follow-Up Session", durationMinutes: 45, price: 130 },
      ],
    },
    {
      id: "massage-therapy",
      name: "Massage Therapy",
      status: "coming-soon",
      sessions: [],
    },
  ],
  additionalFees: [
    { id: "travel", label: "Travel Fee (outside service area)", amount: "$15–$25" },
    { id: "documentation", label: "Documentation/Forms/Reports", amount: "From $40" },
  ],
}

/** Returns a valid config, falling back to defaults for anything malformed. */
export function normalizePricing(value: unknown): PricingConfig {
  const parsed = pricingConfigSchema.safeParse(value)
  if (!parsed.success) return DEFAULT_PRICING
  const byId = new Map(parsed.data.services.map((s) => [s.id, s]))
  return {
    services: SERVICE_IDS.map((id) => byId.get(id)!),
    additionalFees: parsed.data.additionalFees,
  }
}

export function getService(config: PricingConfig, id: ServiceId): ServicePricing {
  return config.services.find((s) => s.id === id) ?? DEFAULT_PRICING.services.find((s) => s.id === id)!
}

export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`
}

export function hasVisiblePrices(service: ServicePricing): boolean {
  return service.status === "available" && service.sessions.length > 0
}

/** "$150", "$130–$150", "Contact us", or "Coming soon". */
export function formatPriceRange(service: ServicePricing): string {
  if (service.status === "coming-soon") return "Coming soon"
  if (!hasVisiblePrices(service)) return "Contact us"
  const prices = service.sessions.map((s) => s.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPrice(min) : `${formatPrice(min)}–${formatPrice(max)}`
}

/** "Starting at $130/session", or the status label when prices are hidden. */
export function formatStartingPrice(service: ServicePricing): string {
  if (!hasVisiblePrices(service)) return formatPriceRange(service)
  return `Starting at ${formatPrice(Math.min(...service.sessions.map((s) => s.price)))}/session`
}

export function formatDurations(service: ServicePricing): string {
  if (service.sessions.length === 0) return "—"
  const durations = new Set(service.sessions.map((s) => s.durationMinutes))
  if (durations.size === 1) return `${service.sessions[0].durationMinutes} min`
  return service.sessions.map((s) => `${s.durationMinutes} min ${s.label.toLowerCase()}`).join(" / ")
}

/** "$150 · 60 min" for a session, used in the booking form. */
export function formatSessionSummary(session: PricingSession): string {
  return `${formatPrice(session.price)} · ${session.durationMinutes} min`
}
