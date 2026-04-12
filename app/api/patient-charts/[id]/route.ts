import { requireAuth } from '@/lib/auth'
import { resolvePatientDisplayName } from '@/lib/consent-copy'
import { getDefaultChartNotesAfterConsentContentString } from '@/lib/chart-template'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

function canAccessChart(chart: { createdById: string | null; accessList: { adminId: string; permission: string }[] }, adminId: string): 'view' | 'edit' | null {
  if (chart.createdById === adminId) return 'edit'
  const access = chart.accessList.find((a) => a.adminId === adminId)
  if (access?.permission === 'edit') return 'edit'
  if (access?.permission === 'view') return 'view'
  return null
}

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
        booking: true,
        patient: true,
        formTemplate: { select: { id: true, name: true, schema: true } },
        createdBy: { select: { id: true, email: true, name: true } },
        accessList: { include: { admin: { select: { id: true, email: true, name: true } } } },
        invitations: {
          where: { status: 'pending' },
          include: { invitee: { select: { id: true, email: true, name: true } }, invitedBy: { select: { id: true, email: true, name: true } } },
        },
        accessRequests: {
          where: { status: 'pending' },
          include: { requestedBy: { select: { id: true, email: true, name: true } } },
        },
      },
    })

    if (!chart) {
      return NextResponse.json({ success: false, error: 'Chart not found' }, { status: 404 })
    }

    const permission = canAccessChart(chart, session.id)
    if (!permission) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const data = {
      id: chart.id,
      bookingId: chart.bookingId,
      patientId: chart.patientId,
      formTemplateId: chart.formTemplateId,
      formTemplate: chart.formTemplate
        ? { id: chart.formTemplate.id, name: chart.formTemplate.name, schema: chart.formTemplate.schema }
        : null,
      content: chart.content,
      consentContent: chart.consentContent,
      consentCompletedAt: chart.consentCompletedAt?.toISOString() ?? null,
      initialAssessmentCompletedAt: chart.initialAssessmentCompletedAt?.toISOString() ?? null,
      createdAt: chart.createdAt.toISOString(),
      updatedAt: chart.updatedAt.toISOString(),
      createdBy: chart.createdBy ? { id: chart.createdBy.id, email: chart.createdBy.email, name: chart.createdBy.name } : null,
      booking: chart.booking
        ? {
            id: chart.booking.id,
            firstName: chart.booking.firstName,
            lastName: chart.booking.lastName,
            email: chart.booking.email,
            phoneNumber: chart.booking.phoneNumber,
            dateOfBirth: chart.booking.dateOfBirth?.toISOString() ?? null,
            condition: chart.booking.condition,
            medicalHistory: chart.booking.medicalHistory,
            preferredDate: chart.booking.preferredDate.toISOString(),
            endDate: chart.booking.endDate?.toISOString() ?? null,
          }
        : null,
      patient: chart.patient
        ? {
            id: chart.patient.id,
            firstName: chart.patient.firstName,
            lastName: chart.patient.lastName,
            email: chart.patient.email,
            phoneNumber: chart.patient.phoneNumber,
          }
        : null,
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
      myPermission: permission,
      isOwner: chart.createdById === session.id,
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('GET /api/patient-charts/[id]', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch chart' }, { status: 500 })
  }
}

const updateSchema = z.object({
  content: z.string().nullable().optional(),
  formTemplateId: z.string().nullable().optional(),
  clear: z.literal(true).optional(),
  consentContent: z.string().nullable().optional(),
  completeConsent: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.parse(body)

    const chart = await prisma.patientChart.findUnique({
      where: { id },
      include: {
        accessList: true,
        patient: { select: { firstName: true, lastName: true } },
        booking: { select: { firstName: true, lastName: true } },
      },
    })

    if (!chart) {
      return NextResponse.json({ success: false, error: 'Chart not found' }, { status: 404 })
    }

    const permission = canAccessChart(chart, session.id)
    if (permission !== 'edit') {
      return NextResponse.json({ success: false, error: 'Edit access required' }, { status: 403 })
    }

    const displayName = resolvePatientDisplayName({
      patient: chart.patient,
      booking: chart.booking,
    })

    const content =
      parsed.clear === true
        ? chart.formTemplateId
          ? '{}'
          : getDefaultChartNotesAfterConsentContentString(displayName)
        : parsed.content !== undefined
          ? parsed.content
          : chart.content

    const nextConsentContent =
      parsed.consentContent !== undefined ? parsed.consentContent : chart.consentContent
    const nextConsentCompletedAt =
      parsed.completeConsent === true ? new Date() : chart.consentCompletedAt

    const consentDoneForInitial =
      nextConsentCompletedAt != null

    const shouldMarkInitialComplete =
      parsed.clear !== true &&
      parsed.content !== undefined &&
      consentDoneForInitial &&
      chart.initialAssessmentCompletedAt == null

    const nextInitialAssessmentCompletedAt = shouldMarkInitialComplete
      ? new Date()
      : chart.initialAssessmentCompletedAt

    const updateData: {
      content: string | null
      formTemplateId?: string | null
      consentContent?: string | null
      consentCompletedAt?: Date | null
      initialAssessmentCompletedAt?: Date | null
    } = {
      content,
      consentContent: nextConsentContent,
      consentCompletedAt: nextConsentCompletedAt,
      initialAssessmentCompletedAt: nextInitialAssessmentCompletedAt,
    }
    if (parsed.formTemplateId !== undefined) updateData.formTemplateId = parsed.formTemplateId

    const updated = await prisma.patientChart.update({
      where: { id },
      data: updateData,
    })

    const action =
      parsed.clear === true
        ? 'cleared'
        : parsed.completeConsent === true
          ? 'consent_completed'
          : 'updated'
    await prisma.patientChartEvent.create({
      data: {
        chartId: id,
        adminId: session.id,
        action,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        content: updated.content,
        updatedAt: updated.updatedAt.toISOString(),
        formTemplateId: updated.formTemplateId,
        consentContent: updated.consentContent,
        consentCompletedAt: updated.consentCompletedAt?.toISOString() ?? null,
        initialAssessmentCompletedAt: updated.initialAssessmentCompletedAt?.toISOString() ?? null,
      },
    })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: e.errors }, { status: 400 })
    }
    console.error('PATCH /api/patient-charts/[id]', e)
    return NextResponse.json({ success: false, error: 'Failed to update chart' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const chart = await prisma.patientChart.findUnique({
      where: { id },
      select: { id: true, createdById: true },
    })

    if (!chart) {
      return NextResponse.json({ success: false, error: 'Chart not found' }, { status: 404 })
    }

    if (chart.createdById !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Only the chart owner can delete this chart' },
        { status: 403 }
      )
    }

    await prisma.patientChart.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('DELETE /api/patient-charts/[id]', e)
    return NextResponse.json({ success: false, error: 'Failed to delete chart' }, { status: 500 })
  }
}
