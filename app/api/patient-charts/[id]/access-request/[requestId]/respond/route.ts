import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyRequestGranted, notifyRequestDenied } from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const respondSchema = z.object({ action: z.enum(['grant', 'deny']) })

// Chart owner grants or denies an access request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: chartId, requestId } = await params
    const body = await request.json()
    const { action } = respondSchema.parse(body)

    const accessRequest = await prisma.chartAccessRequest.findFirst({
      where: { id: requestId, chartId, status: 'pending' },
      include: {
        requestedBy: { select: { id: true, email: true, name: true } },
        chart: { include: { accessList: true, booking: true, patient: true } },
      },
    })

    if (!accessRequest) {
      return NextResponse.json({ success: false, error: 'Request not found or already responded' }, { status: 404 })
    }

    const chart = accessRequest.chart
    const canEdit = chart.createdById === session.id || chart.accessList.some((a) => a.adminId === session.id && a.permission === 'edit')
    if (!canEdit) {
      return NextResponse.json({ success: false, error: 'Only chart owner/editors can grant or deny requests' }, { status: 403 })
    }

    const chartLabel = chart.booking
      ? `${chart.booking.firstName} ${chart.booking.lastName}`
      : chart.patient
        ? `${chart.patient.firstName} ${chart.patient.lastName ?? ''}`.trim()
        : 'Patient chart'

    if (action === 'grant') {
      await prisma.$transaction([
        prisma.patientChartAccess.upsert({
          where: { chartId_adminId: { chartId, adminId: accessRequest.requestedById } },
          create: { chartId, adminId: accessRequest.requestedById, permission: accessRequest.permission },
          update: { permission: accessRequest.permission },
        }),
        prisma.chartAccessRequest.update({
          where: { id: requestId },
          data: { status: 'granted', respondedById: session.id, respondedAt: new Date() },
        }),
      ])
      await notifyRequestGranted(accessRequest.requestedById, chartId, chartLabel)
      return NextResponse.json({
        success: true,
        data: { action: 'granted', permission: accessRequest.permission },
      })
    }

    await prisma.chartAccessRequest.update({
      where: { id: requestId },
      data: { status: 'denied', respondedById: session.id, respondedAt: new Date() },
    })
    await notifyRequestDenied(accessRequest.requestedById, chartLabel)
    return NextResponse.json({
      success: true,
      data: { action: 'denied' },
    })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: e.errors }, { status: 400 })
    }
    console.error('POST /api/patient-charts/[id]/access-request/[requestId]/respond', e)
    return NextResponse.json({ success: false, error: 'Failed to respond' }, { status: 500 })
  }
}
