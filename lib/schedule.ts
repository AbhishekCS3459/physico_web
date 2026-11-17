import { TZDate } from "@date-fns/tz"
import { format } from "date-fns"

export const CLINIC_TIME_ZONE = "America/Edmonton"

export const VISIT_DURATION_OPTIONS = [30, 45, 60, 75, 90, 120] as const

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Converts a Calgary wall-clock date ("yyyy-MM-dd") and time ("HH:mm") to an absolute instant. */
export function clinicLocalToDate(date: string, time: string): Date | null {
  const d = DATE_PATTERN.exec(date)
  const t = TIME_PATTERN.exec(time)
  if (!d || !t) return null

  const [year, month, day] = [Number(d[1]), Number(d[2]), Number(d[3])]
  const [hours, minutes] = [Number(t[1]), Number(t[2])]
  const zoned = new TZDate(year, month - 1, day, hours, minutes, CLINIC_TIME_ZONE)

  // Rejects impossible dates (e.g. Feb 30) and times skipped by a daylight-saving jump.
  if (zoned.getFullYear() !== year || zoned.getMonth() !== month - 1 || zoned.getDate() !== day) return null
  if (zoned.getHours() !== hours || zoned.getMinutes() !== minutes) return null

  return new Date(zoned.getTime())
}

export function toClinicLocalParts(value: Date | string): { date: string; time: string } {
  const zoned = new TZDate(new Date(value).getTime(), CLINIC_TIME_ZONE)
  return { date: format(zoned, "yyyy-MM-dd"), time: format(zoned, "HH:mm") }
}

export function formatClinicDateTime(value: Date | string, pattern = "EEE, MMM d, yyyy 'at' h:mm a"): string {
  return format(new TZDate(new Date(value).getTime(), CLINIC_TIME_ZONE), pattern)
}

export function formatClinicTimeRange(start: Date | string, end: Date | string): string {
  return `${formatClinicDateTime(start)} – ${formatClinicDateTime(end, "h:mm a")} (Calgary time)`
}
