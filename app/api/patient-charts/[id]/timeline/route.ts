import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const chart = await prisma.patientChart.findUnique({
      where: { id },
      include: { accessList: true },
    })

    if (!chart) {
      return NextResponse.json({ success: false, error: 'Chart not found' }, { status: 404 })
    }

    const canView =
      chart.createdById === session.id ||
      chart.accessList.some((a) => a.adminId === session.id)
    if (!canView) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const events = await prisma.patientChartEvent.findMany({
      where: { chartId: id },
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { id: true, email: true, name: true } } },
      take: 100,
    })

    const data = events.map((e) => ({
      id: e.id,
      action: e.action,
      createdAt: e.createdAt.toISOString(),
      admin: e.admin ? { id: e.admin.id, email: e.admin.email, name: e.admin.name } : null,
    }))

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('GET /api/patient-charts/[id]/timeline', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch timeline' }, { status: 500 })
  }
}
