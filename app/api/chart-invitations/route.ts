import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// List pending chart invitations for the current user
export async function GET() {
  try {
    const session = await requireAuth()

    const invitations = await prisma.chartInvitation.findMany({
      where: { inviteeId: session.id, status: 'pending' },
      include: {
        chart: {
          include: {
            booking: { select: { id: true, firstName: true, lastName: true, email: true, preferredDate: true, endDate: true } },
            patient: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        invitedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = invitations.map((inv) => ({
      id: inv.id,
      chartId: inv.chartId,
      permission: inv.permission,
      createdAt: inv.createdAt.toISOString(),
      chart: {
        id: inv.chart.id,
        booking: inv.chart.booking,
        patient: inv.chart.patient,
      },
      invitedBy: { id: inv.invitedBy.id, email: inv.invitedBy.email, name: inv.invitedBy.name },
    }))

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('GET /api/chart-invitations', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch invitations' }, { status: 500 })
  }
}
