import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Accept a chart invitation (invitee only)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: invitationId } = await params

    const invitation = await prisma.chartInvitation.findUnique({
      where: { id: invitationId, status: 'pending' },
    })

    if (!invitation) {
      return NextResponse.json({ success: false, error: 'Invitation not found or already resolved' }, { status: 404 })
    }

    if (invitation.inviteeId !== session.id) {
      return NextResponse.json({ success: false, error: 'This invitation was sent to another user' }, { status: 403 })
    }

    await prisma.$transaction([
      prisma.patientChartAccess.upsert({
        where: { chartId_adminId: { chartId: invitation.chartId, adminId: session.id } },
        create: { chartId: invitation.chartId, adminId: session.id, permission: invitation.permission },
        update: { permission: invitation.permission },
      }),
      prisma.chartInvitation.update({
        where: { id: invitationId },
        data: { status: 'accepted' },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: { chartId: invitation.chartId, permission: invitation.permission },
    })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('POST /api/chart-invitations/[id]/accept', e)
    return NextResponse.json({ success: false, error: 'Failed to accept invitation' }, { status: 500 })
  }
}
