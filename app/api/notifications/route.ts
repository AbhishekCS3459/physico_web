import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const session = await requireAuth()

    const notifications = await prisma.adminNotification.findMany({
      where: { adminId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const data = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      chartId: n.chartId,
      link: n.link,
      createdAt: n.createdAt.toISOString(),
    }))

    const unreadCount = await prisma.adminNotification.count({
      where: { adminId: session.id, read: false },
    })

    return NextResponse.json({ success: true, data, unreadCount })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('GET /api/notifications', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json().catch(() => ({}))
    const { markAllRead } = body || {}

    if (markAllRead) {
      await prisma.adminNotification.updateMany({
        where: { adminId: session.id },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('PATCH /api/notifications', e)
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}
