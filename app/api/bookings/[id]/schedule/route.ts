import { getSession } from '@/lib/auth'
import { resolveSchedule, scheduleSchema } from '@/lib/booking-schedule'
import { syncBookingCalendarEvent, type CalendarSyncResult } from '@/lib/google-calendar'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  schedule: scheduleSchema.nullable(),
  // Moves a pending booking to confirmed so it reaches Google Calendar.
  confirm: z.boolean().optional(),
})

/**
 * Schedules (or unschedules) a single visit.
 * Super admins may schedule anyone; staff may only schedule visits for themselves.
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { schedule, confirm } = bodySchema.parse(await request.json())

    const booking = await prisma.therapyBooking.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, assignedAdminId: true },
    })
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    if (schedule && (booking.status === 'cancelled' || booking.status === 'completed')) {
      return NextResponse.json(
        { success: false, error: `A ${booking.status} booking can't be scheduled` },
        { status: 400 }
      )
    }

    if (session.role !== 'super_admin') {
      if (booking.assignedAdminId && booking.assignedAdminId !== session.id) {
        return NextResponse.json(
          { success: false, error: 'This visit is assigned to another clinician' },
          { status: 403 }
        )
      }
      if (schedule && schedule.assignedAdminId !== session.id) {
        return NextResponse.json(
          { success: false, error: 'Staff can only schedule visits for themselves' },
          { status: 403 }
        )
      }
    }

    const resolved = await resolveSchedule(schedule)
    if (!resolved.ok) {
      return NextResponse.json({ success: false, error: resolved.error }, { status: 400 })
    }

    const updated = await prisma.therapyBooking.update({
      where: { id: booking.id },
      data: {
        ...resolved.data,
        ...(schedule && confirm && booking.status === 'pending' ? { status: 'confirmed' } : {}),
      },
    })

    let calendar: CalendarSyncResult | null = null
    if (updated.status === 'confirmed' || updated.googleEventId) {
      calendar = await syncBookingCalendarEvent(updated.id)
    }

    const fresh = calendar ? await prisma.therapyBooking.findUnique({ where: { id: updated.id } }) : updated

    return NextResponse.json({ success: true, data: fresh ?? updated, calendar })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('PUT /api/bookings/[id]/schedule', error)
    return NextResponse.json({ success: false, error: 'Failed to schedule visit' }, { status: 500 })
  }
}
