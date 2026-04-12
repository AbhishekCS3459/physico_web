import { requireAuth } from '@/lib/auth'
import { resolvePatientDisplayName } from '@/lib/consent-copy'
import { getDefaultChartNotesAfterConsentContentString } from '@/lib/chart-template'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createChartSchema = z
  .object({
    bookingId: z.string().min(1).optional(),
    patientId: z.string().min(1).optional(),
    formTemplateId: z.string().min(1).optional().nullable(),
  })
  .refine((data) => (data.bookingId ? !data.patientId : !!data.patientId), {
    message: 'Provide either bookingId or patientId',
  })

/** Prisma codes that indicate DB unavailable / transient – return 503 so client can retry. */
const PRISMA_UNAVAILABLE_CODES = new Set([
  'P1001', // Can't reach DB server
  'P1002', // Connection timeout
  'P1008', // Operations timed out
  'P1017', // Server closed connection
])

function isPrismaUnavailable(e: { code?: string }): boolean {
  return typeof e.code === 'string' && PRISMA_UNAVAILABLE_CODES.has(e.code)
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    const baseWhere = {
      OR: [
        { createdById: session.id },
        { accessList: { some: { adminId: session.id } } },
      ],
    }

    // If bookingId provided, return only that booking's chart (if any)
    const where = bookingId ? { ...baseWhere, bookingId } : baseWhere

    const charts = await prisma.patientChart.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            preferredDate: true,
            endDate: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        createdBy: { select: { id: true, email: true, name: true } },
        accessList: {
          include: { admin: { select: { id: true, email: true, name: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const data = charts.map((c) => ({
      id: c.id,
      bookingId: c.bookingId,
      patientId: c.patientId,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      createdBy: c.createdBy
        ? { id: c.createdBy.id, email: c.createdBy.email, name: c.createdBy.name }
        : null,
      booking: c.booking
        ? {
            id: c.booking.id,
            firstName: c.booking.firstName,
            lastName: c.booking.lastName,
            email: c.booking.email,
            preferredDate: c.booking.preferredDate.toISOString(),
            endDate: c.booking.endDate?.toISOString() ?? null,
          }
        : null,
      patient: c.patient
        ? {
            id: c.patient.id,
            firstName: c.patient.firstName,
            lastName: c.patient.lastName,
            email: c.patient.email,
            phoneNumber: c.patient.phoneNumber,
          }
        : null,
      accessList: c.accessList.map((a) => ({
        adminId: a.adminId,
        permission: a.permission,
        admin: { id: a.admin.id, email: a.admin.email, name: a.admin.name },
      })),
      myPermission: c.createdById === session.id ? 'edit' : c.accessList.find((a) => a.adminId === session.id)?.permission ?? null,
      isOwner: c.createdById === session.id,
    }))

    return NextResponse.json({ success: true, data })
  } catch (e: unknown) {
    const err = e as { message?: string; code?: string }
    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Please sign in to view charts.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    console.error('GET /api/patient-charts', e)
    if (isPrismaUnavailable(err)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Charts are temporarily unavailable. Please try again in a moment.',
          code: 'SERVICE_UNAVAILABLE',
        },
        { status: 503 }
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: 'We couldn’t load your charts. Please try again.',
        code: 'CHARTS_LOAD_FAILED',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { bookingId, patientId, formTemplateId } = createChartSchema.parse(body)

    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { chart: true },
      })
      if (!patient) {
        return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 })
      }
      if (patient.chart) {
        return NextResponse.json({ success: false, error: 'Chart already exists for this patient' }, { status: 400 })
      }

      const patientDisplayName = resolvePatientDisplayName({
        patient: { firstName: patient.firstName, lastName: patient.lastName },
      })
      const chart = await prisma.patientChart.create({
        data: {
          patientId,
          createdById: session.id,
          formTemplateId: formTemplateId ?? null,
          content: formTemplateId ? '{}' : getDefaultChartNotesAfterConsentContentString(patientDisplayName),
        },
      })

      await prisma.patientChartEvent.create({
        data: { chartId: chart.id, adminId: session.id, action: 'created' },
      })

      const full = await prisma.patientChart.findUnique({
        where: { id: chart.id },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
          createdBy: { select: { id: true, email: true, name: true } },
          accessList: { include: { admin: { select: { id: true, email: true, name: true } } } },
        },
      })

      const data = full
        ? {
            id: full.id,
            bookingId: full.bookingId,
            patientId: full.patientId,
            content: full.content,
            createdAt: full.createdAt.toISOString(),
            updatedAt: full.updatedAt.toISOString(),
            createdBy: full.createdBy ? { id: full.createdBy.id, email: full.createdBy.email, name: full.createdBy.name } : null,
            booking: null,
            patient: full.patient
              ? {
                  id: full.patient.id,
                  firstName: full.patient.firstName,
                  lastName: full.patient.lastName,
                  email: full.patient.email,
                  phoneNumber: full.patient.phoneNumber,
                }
              : null,
            accessList: full.accessList.map((a) => ({
              adminId: a.adminId,
              permission: a.permission,
              admin: { id: a.admin.id, email: a.admin.email, name: a.admin.name },
            })),
            myPermission: 'edit' as const,
          }
        : null

      return NextResponse.json({ success: true, data }, { status: 201 })
    }

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Provide either bookingId or patientId' }, { status: 400 })
    }
    const booking = await prisma.therapyBooking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    const existing = await prisma.patientChart.findUnique({ where: { bookingId } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Chart already exists for this patient' }, { status: 400 })
    }

    const bookingDisplayName = resolvePatientDisplayName({
      booking: { firstName: booking.firstName, lastName: booking.lastName },
    })
    const chart = await prisma.patientChart.create({
      data: {
        bookingId,
        createdById: session.id,
        formTemplateId: formTemplateId ?? null,
        content: formTemplateId ? '{}' : getDefaultChartNotesAfterConsentContentString(bookingDisplayName),
      },
    })

    await prisma.patientChartEvent.create({
      data: { chartId: chart.id, adminId: session.id, action: 'created' },
    })

    const full = await prisma.patientChart.findUnique({
      where: { id: chart.id },
      include: {
        booking: { select: { id: true, firstName: true, lastName: true, email: true, preferredDate: true, endDate: true } },
        patient: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
        createdBy: { select: { id: true, email: true, name: true } },
        accessList: { include: { admin: { select: { id: true, email: true, name: true } } } },
      },
    })

    const data = full
      ? {
          id: full.id,
          bookingId: full.bookingId,
          patientId: full.patientId,
          content: full.content,
          createdAt: full.createdAt.toISOString(),
          updatedAt: full.updatedAt.toISOString(),
          createdBy: full.createdBy ? { id: full.createdBy.id, email: full.createdBy.email, name: full.createdBy.name } : null,
          booking: full.booking
            ? {
                id: full.booking.id,
                firstName: full.booking.firstName,
                lastName: full.booking.lastName,
                email: full.booking.email,
                preferredDate: full.booking.preferredDate.toISOString(),
                endDate: full.booking.endDate?.toISOString() ?? null,
              }
            : null,
          patient: full.patient ?? null,
          accessList: full.accessList.map((a) => ({
            adminId: a.adminId,
            permission: a.permission,
            admin: { id: a.admin.id, email: a.admin.email, name: a.admin.name },
          })),
          myPermission: 'edit' as const,
        }
      : null

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: e.errors }, { status: 400 })
    }
    console.error('POST /api/patient-charts', e)
    return NextResponse.json({ success: false, error: 'Failed to create chart' }, { status: 500 })
  }
}
