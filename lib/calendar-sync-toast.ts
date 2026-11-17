import toast from "react-hot-toast"

export type CalendarSyncResult = { status: "synced" | "removed" | "skipped" | "error"; message: string } | null

/** Surfaces the Google Calendar outcome returned by booking/schedule updates. */
export function notifyCalendarResult(calendar: CalendarSyncResult | undefined) {
  if (!calendar || calendar.message === "No calendar event needed") return
  if (calendar.status === "synced" || calendar.status === "removed") toast.success(calendar.message)
  else if (calendar.status === "error") toast.error(calendar.message, { duration: 8000 })
  else toast(calendar.message, { duration: 6000 })
}
