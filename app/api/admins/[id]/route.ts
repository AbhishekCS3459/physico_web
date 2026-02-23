import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateRoleSchema = z.object({
  role: z.enum(['staff', 'super_admin']),
})

// PATCH: update admin role (super_admin only, cannot change own role)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()

    if (session.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admin can change roles' },
        { status: 403 }
      )
    }

    const { id } = await params
    if (id === session.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot change your own role' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role } = updateRoleSchema.parse(body)

    const admin = await prisma.admin.findUnique({
      where: { id },
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    await prisma.admin.update({
      where: { id },
      data: { role },
    })

    return NextResponse.json({
      success: true,
      data: { id, email: admin.email, name: admin.name, role },
    })
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid role', details: e.errors },
        { status: 400 }
      )
    }
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('PATCH /api/admins/[id]', e)
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    )
  }
}
