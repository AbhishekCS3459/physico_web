import { prisma } from "@/lib/prisma"
import { DEFAULT_PRICING, normalizePricing, type PricingConfig } from "@/lib/pricing-config"
import { cache } from "react"

export const PRICING_SETTING_KEY = "pricing"

/**
 * Saved pricing, or defaults when nothing is saved yet or the database is unreachable,
 * so public pages never fail to render because of pricing.
 */
export const getPricing = cache(async (): Promise<PricingConfig> => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: PRICING_SETTING_KEY } })
    return setting ? normalizePricing(setting.value) : DEFAULT_PRICING
  } catch (error) {
    console.error("getPricing: falling back to default pricing", error)
    return DEFAULT_PRICING
  }
})
