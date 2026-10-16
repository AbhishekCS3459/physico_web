import { requireSuperAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PRICING_SETTING_KEY } from '@/lib/pricing'
import { DEFAULT_PRICING, normalizePricing, pricingConfigSchema } from '@/lib/pricing-config'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function authError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message === 'Unauthorized') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (message === 'Forbidden') {
    return NextResponse.json({ success: false, error: 'Only super admins can manage pricing' }, { status: 403 })
  }
  return null
}

export async function GET() {
  try {
    await requireSuperAdmin()
    const setting = await prisma.siteSetting.findUnique({ where: { key: PRICING_SETTING_KEY } })
    return NextResponse.json({
      success: true,
      data: setting ? normalizePricing(setting.value) : DEFAULT_PRICING,
      updatedAt: setting?.updatedAt ?? null,
      isDefault: !setting,
    })
  } catch (error) {
    const response = authError(error)
    if (response) return response
    console.error('GET /api/admin/pricing', error)
    return NextResponse.json({ success: false, error: 'Failed to load pricing' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSuperAdmin()

    const parsed = pricingConfigSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid pricing' },
        { status: 400 }
      )
    }
    const pricing = normalizePricing(parsed.data)

    const setting = await prisma.siteSetting.upsert({
      where: { key: PRICING_SETTING_KEY },
      create: { key: PRICING_SETTING_KEY, value: pricing, updatedById: session.id },
      update: { value: pricing, updatedById: session.id },
    })

    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true, data: pricing, updatedAt: setting.updatedAt, isDefault: false })
  } catch (error) {
    const response = authError(error)
    if (response) return response
    console.error('PUT /api/admin/pricing', error)
    return NextResponse.json({ success: false, error: 'Failed to save pricing' }, { status: 500 })
  }
}
