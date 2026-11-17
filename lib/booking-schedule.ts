import { z } from 'zod'
import { prisma } from './prisma'
import { clinicLocalToDate } from './schedule'

export const scheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Visit date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:mm'),
  durationMinutes: z.number().int().min(5).max(480),
  assignedAdminId: z.string().min(1, 'Choose a clinician'),
})

export type ScheduleInput = z.infer<typeof scheduleSchema>

type ScheduleFields = {
  scheduledStart: Date | null
  scheduledEnd: Date | null
  assignedAdminId: string | null
}

/** Turns a schedule request into booking fields; `null` clears the schedule. */
export async function resolveSchedule(
  input: ScheduleInput | null
): Promise<{ ok: true; data: ScheduleFields } | { ok: false; error: string }> {
  if (input === null) {
    return { ok: true, data: { scheduledStart: null, scheduledEnd: null, assignedAdminId: null } }
  }

  const start = clinicLocalToDate(input.date, input.startTime)
  if (!start) return { ok: false, error: 'That visit date/time does not exist in Calgary time' }

  const assignee = await prisma.admin.findUnique({ where: { id: input.assignedAdminId }, select: { id: true } })
  if (!assignee) return { ok: false, error: 'Selected clinician no longer exists' }

  return {
    ok: true,
    data: {
      scheduledStart: start,
      scheduledEnd: new Date(start.getTime() + input.durationMinutes * 60_000),
      assignedAdminId: input.assignedAdminId,
    },
  }
}
