import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyAccessRevoked } from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updatePermissionSchema = z.object({ permission: z.enum(['view', 'edit']) })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; adminId: string }> }
) {
  try {
    const session = await requireAuth()
    const { id, adminId } = await params
    const body = await request.json()
    const { permission } = updatePermissionSchema.parse(body)

    const chart = await prisma.patientChart.findUnique({
      where: { id },
      include: { accessList: true },
    })

    if (!chart) {
      return NextResponse.json({ success: false, error: 'Chart not found' }, { status: 404 })
    }

    const canEdit = chart.createdById === session.id || chart.accessList.some((a) => a.adminId === session.id && a.permission === 'edit')
    if (!canEdit) {
      return NextResponse.json({ success: false, error: 'Edit access required' }, { status: 403 })
    }

    const updated = await prisma.patientChartAccess.update({
      where: { chartId_adminId: { chartId: id, adminId } },
      data: { permission },
    })

    return NextResponse.json({ success: true, data: { adminId: updated.adminId, permission: updated.permission } })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: e.errors }, { status: 400 })
    }
    console.error('PATCH /api/patient-charts/[id]/access/[adminId]', e)
    return NextResponse.json({ success: false, error: 'Failed to update permission' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; adminId: string }> }
) {
  try {
    const session = await requireAuth()
    const { id, adminId } = await params

    const chart = await prisma.patientChart.findUnique({
      where: { id },
      include: { accessList: true, booking: true, patient: true },
    })

    if (!chart) {
      return NextResponse.json({ success: false, error: 'Chart not found' }, { status: 404 })
    }

    const canEdit = chart.createdById === session.id || chart.accessList.some((a) => a.adminId === session.id && a.permission === 'edit')
    if (!canEdit) {
      return NextResponse.json({ success: false, error: 'Edit access required' }, { status: 403 })
    }

    await prisma.patientChartAccess.delete({
      where: { chartId_adminId: { chartId: id, adminId } },
    })

    const chartLabel = chart.booking
      ? `${chart.booking.firstName} ${chart.booking.lastName}`
      : chart.patient
        ? `${chart.patient.firstName} ${chart.patient.lastName ?? ''}`.trim()
        : 'Patient chart'
    const revokedByName = (await prisma.admin.findUnique({ where: { id: session.id }, select: { name: true, email: true } }))
    await notifyAccessRevoked(adminId, id, chartLabel, revokedByName?.name || revokedByName?.email || 'Chart owner')

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('DELETE /api/patient-charts/[id]/access/[adminId]', e)
    return NextResponse.json({ success: false, error: 'Failed to revoke access' }, { status: 500 })
  }
}
