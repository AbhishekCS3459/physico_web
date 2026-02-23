import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const notification = await prisma.adminNotification.findFirst({
      where: { id, adminId: session.id },
    })

    if (!notification) {
      return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 })
    }

    await prisma.adminNotification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('PATCH /api/notifications/[id]', e)
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}
