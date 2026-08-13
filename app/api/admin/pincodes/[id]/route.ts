import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  label: z.string().optional().nullable(),
  travelFee: z.number().min(0).nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const body = updateSchema.parse(await request.json())

    const updated = await prisma.coveragePincode.update({
      where: { id: params.id },
      data: {
        ...(body.label !== undefined ? { label: body.label?.trim() || null } : {}),
        ...(body.travelFee !== undefined
          ? { travelFee: body.travelFee != null && body.travelFee > 0 ? body.travelFee : null }
          : {}),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error' }, { status: 400 })
    }
    console.error('PATCH /api/admin/pincodes/[id]', error)
    return NextResponse.json({ success: false, error: 'Failed to update pincode' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    await prisma.coveragePincode.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('DELETE /api/admin/pincodes/[id]', error)
    return NextResponse.json({ success: false, error: 'Failed to delete pincode' }, { status: 500 })
  }
}
