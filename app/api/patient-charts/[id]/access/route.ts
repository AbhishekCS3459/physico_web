import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyInvitationReceived } from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const addAccessSchema = z
  .object({
    adminId: z.string().min(1).optional(),
    email: z.string().email().optional(),
    permission: z.enum(['view', 'edit']),
  })
  .refine((data) => data.adminId || data.email, { message: 'Provide adminId or email' })

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const chart = await prisma.patientChart.findUnique({
      where: { id },
      include: {
        accessList: { include: { admin: { select: { id: true, email: true, name: true } } } },
        invitations: {
          where: { status: 'pending' },
          include: { invitee: { select: { id: true, email: true, name: true } }, invitedBy: { select: { id: true, email: true, name: true } } },
        },
        accessRequests: {
          where: { status: 'pending' },
          include: { requestedBy: { select: { id: true, email: true, name: true } } },
        },
        booking: true,
        patient: true,
      },
    })

    if (!chart) {
      return NextResponse.json({ success: false, error: 'Chart not found' }, { status: 404 })
    }

    const canEdit = chart.createdById === session.id || chart.accessList.some((a) => a.adminId === session.id && a.permission === 'edit')
    if (!canEdit) {
      return NextResponse.json({ success: false, error: 'Edit access required to view access list' }, { status: 403 })
    }

    const data = {
      accessList: chart.accessList.map((a) => ({
        adminId: a.adminId,
        permission: a.permission,
        admin: { id: a.admin.id, email: a.admin.email, name: a.admin.name },
      })),
      pendingInvitations: chart.invitations.map((inv) => ({
        id: inv.id,
        inviteeId: inv.inviteeId,
        permission: inv.permission,
        invitee: { id: inv.invitee.id, email: inv.invitee.email, name: inv.invitee.name },
        invitedBy: { id: inv.invitedBy.id, email: inv.invitedBy.email, name: inv.invitedBy.name },
        createdAt: inv.createdAt.toISOString(),
      })),
      pendingRequests: chart.accessRequests.map((req) => ({
        id: req.id,
        requestedById: req.requestedById,
        permission: req.permission,
        requestedBy: { id: req.requestedBy.id, email: req.requestedBy.email, name: req.requestedBy.name },
        createdAt: req.createdAt.toISOString(),
      })),
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('GET /api/patient-charts/[id]/access', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch access' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const parsed = addAccessSchema.parse(body)
    const { permission } = parsed

    let adminId = parsed.adminId
    if (parsed.email) {
      const adminByEmail = await prisma.admin.findUnique({
        where: { email: parsed.email.trim().toLowerCase() },
      })
      if (!adminByEmail) {
        return NextResponse.json({ success: false, error: 'No staff or admin found with that email' }, { status: 404 })
      }
      adminId = adminByEmail.id
    }
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Provide adminId or email' }, { status: 400 })
    }

    const chart = await prisma.patientChart.findUnique({
      where: { id },
      include: { accessList: true },
    })

    if (!chart) {
      return NextResponse.json({ success: false, error: 'Chart not found' }, { status: 404 })
    }

    const canEdit = chart.createdById === session.id || chart.accessList.some((a) => a.adminId === session.id && a.permission === 'edit')
    if (!canEdit) {
      return NextResponse.json({ success: false, error: 'Edit access required to share chart' }, { status: 403 })
    }

    if (adminId === session.id) {
      return NextResponse.json({ success: false, error: 'Cannot add yourself' }, { status: 400 })
    }

    const adminExists = await prisma.admin.findUnique({ where: { id: adminId } })
    if (!adminExists) {
      return NextResponse.json({ success: false, error: 'Staff/admin not found' }, { status: 404 })
    }

    const existingAccess = await prisma.patientChartAccess.findUnique({
      where: { chartId_adminId: { chartId: id, adminId } },
    })
    if (existingAccess) {
      return NextResponse.json({ success: false, error: 'They already have access to this chart' }, { status: 400 })
    }

    const existingInvitation = await prisma.chartInvitation.findUnique({
      where: { chartId_inviteeId: { chartId: id, inviteeId: adminId } },
    })
    if (existingInvitation) {
      if (existingInvitation.status === 'pending') {
        const updated = await prisma.chartInvitation.update({
          where: { id: existingInvitation.id },
          data: { permission },
          include: { invitee: { select: { id: true, email: true, name: true } } },
        })
        return NextResponse.json({
          success: true,
          invitation: true,
          data: { id: updated.id, inviteeId: updated.inviteeId, permission: updated.permission, invitee: updated.invitee },
        })
      }
      return NextResponse.json({ success: false, error: 'Invitation was already accepted or declined' }, { status: 400 })
    }

    const invitation = await prisma.chartInvitation.create({
      data: { chartId: id, inviteeId: adminId, invitedById: session.id, permission, status: 'pending' },
      include: {
        invitee: { select: { id: true, email: true, name: true } },
        invitedBy: { select: { id: true, email: true, name: true } },
        chart: { include: { booking: true, patient: true } },
      },
    })

    const chartLabel = invitation.chart.booking
      ? `${invitation.chart.booking.firstName} ${invitation.chart.booking.lastName}`
      : invitation.chart.patient
        ? `${invitation.chart.patient.firstName} ${invitation.chart.patient.lastName ?? ''}`.trim()
        : 'Patient chart'
    const inviterName = session.name || session.email || 'A colleague'
    await notifyInvitationReceived(adminId, id, chartLabel, inviterName, permission)

    return NextResponse.json(
      {
        success: true,
        invitation: true,
        data: {
          id: invitation.id,
          inviteeId: invitation.inviteeId,
          permission: invitation.permission,
          status: invitation.status,
          invitee: invitation.invitee,
          invitedBy: invitation.invitedBy,
          createdAt: invitation.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: e.errors }, { status: 400 })
    }
    console.error('POST /api/patient-charts/[id]/access', e)
    return NextResponse.json({ success: false, error: 'Failed to add access' }, { status: 500 })
  }
}
