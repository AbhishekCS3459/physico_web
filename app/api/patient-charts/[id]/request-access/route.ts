import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyRequestReceived } from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const requestAccessSchema = z.object({ permission: z.enum(['view', 'edit']) })

// Staff requests access to a chart (they don't have access yet)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id: chartId } = await params
    const body = await request.json()
    const { permission } = requestAccessSchema.parse(body)

    const chart = await prisma.patientChart.findUnique({
      where: { id: chartId },
      include: { booking: true, patient: true, createdBy: { select: { id: true } }, accessList: true },
    })

    if (!chart) {
      return NextResponse.json({ success: false, error: 'Chart not found' }, { status: 404 })
    }

    const hasAccess = chart.createdById === session.id || chart.accessList.some((a) => a.adminId === session.id)
    if (hasAccess) {
      return NextResponse.json({ success: false, error: 'You already have access to this chart' }, { status: 400 })
    }

    const existing = await prisma.chartAccessRequest.findUnique({
      where: { chartId_requestedById: { chartId, requestedById: session.id } },
    })
    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json({ success: false, error: 'You already have a pending request for this chart' }, { status: 400 })
      }
      return NextResponse.json({ success: false, error: 'Your previous request was already responded to' }, { status: 400 })
    }

    const accessRequest = await prisma.chartAccessRequest.create({
      data: { chartId, requestedById: session.id, permission, status: 'pending' },
      include: {
        requestedBy: { select: { id: true, email: true, name: true } },
        chart: { include: { booking: true, patient: true } },
      },
    })

    const chartLabel = chart.booking
      ? `${chart.booking.firstName} ${chart.booking.lastName}`
      : chart.patient
        ? `${chart.patient.firstName} ${chart.patient.lastName ?? ''}`.trim()
        : 'Patient chart'
    const ownerId = chart.createdById
    if (ownerId) {
      const requesterName = accessRequest.requestedBy.name || accessRequest.requestedBy.email || 'A staff member'
      await notifyRequestReceived(ownerId, chartId, chartLabel, requesterName, permission)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: accessRequest.id,
        permission: accessRequest.permission,
        status: accessRequest.status,
        createdAt: accessRequest.createdAt.toISOString(),
      },
    }, { status: 201 })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: e.errors }, { status: 400 })
    }
    console.error('POST /api/patient-charts/[id]/request-access', e)
    return NextResponse.json({ success: false, error: 'Failed to request access' }, { status: 500 })
  }
}
