import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPostalCode, parsePincodeList } from '@/utils/postal-code'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createSchema = z.object({
  code: z.string().optional(),
  codes: z.string().optional(),
  label: z.string().optional(),
  travelFee: z.number().min(0).nullable().optional(),
})

export async function GET() {
  try {
    await requireAuth()

    const pincodes = await prisma.coveragePincode.findMany({
      orderBy: { code: 'asc' },
    })

    return NextResponse.json({ success: true, data: pincodes })
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('GET /api/admin/pincodes', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch pincodes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { code, codes, label, travelFee } = createSchema.parse(body)
    const parsed = parsePincodeList([code, codes].filter(Boolean).join('\n'))

    if (parsed.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enter at least one valid postal code or FSA (e.g. T2P or T2P 1J9).' },
        { status: 400 }
      )
    }

    const fee = travelFee != null && travelFee > 0 ? travelFee : null

    const existing = await prisma.coveragePincode.findMany({
      where: { code: { in: parsed } },
      select: { code: true },
    })
    const existingSet = new Set(existing.map((p) => p.code))
    const toCreate = parsed.filter((c) => !existingSet.has(c))

    if (toCreate.length > 0) {
      await prisma.coveragePincode.createMany({
        data: toCreate.map((c) => ({
          code: c,
          label: toCreate.length === 1 ? (label?.trim() || formatPostalCode(c)) : formatPostalCode(c),
          travelFee: fee,
        })),
      })
    }

    const data = await prisma.coveragePincode.findMany({
      orderBy: { code: 'asc' },
    })

    return NextResponse.json({
      success: true,
      added: toCreate.length,
      skipped: parsed.length - toCreate.length,
      data,
    })
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error' }, { status: 400 })
    }
    console.error('POST /api/admin/pincodes', error)
    return NextResponse.json({ success: false, error: 'Failed to add pincodes' }, { status: 500 })
  }
}
