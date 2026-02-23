import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Cancel a pending invitation (chart owner only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: chartId, invitationId } = await params

    const invitation = await prisma.chartInvitation.findFirst({
      where: { id: invitationId, chartId, status: 'pending' },
      include: { chart: { include: { accessList: true } } },
    })

    if (!invitation) {
      return NextResponse.json({ success: false, error: 'Invitation not found or already resolved' }, { status: 404 })
    }

    const chart = invitation.chart
    const canEdit = chart.createdById === session.id || chart.accessList.some((a) => a.adminId === session.id && a.permission === 'edit')
    if (!canEdit) {
      return NextResponse.json({ success: false, error: 'Only chart owner/editors can cancel invitations' }, { status: 403 })
    }

    await prisma.chartInvitation.delete({
      where: { id: invitationId },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('DELETE /api/patient-charts/[id]/invitation/[invitationId]', e)
    return NextResponse.json({ success: false, error: 'Failed to cancel invitation' }, { status: 500 })
  }
}
