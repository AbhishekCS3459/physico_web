"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { notifyCalendarResult } from "@/lib/calendar-sync-toast"
import { VISIT_DURATION_OPTIONS, clinicLocalToDate, formatClinicDateTime, toClinicLocalParts } from "@/lib/schedule"
import { cn } from "@/lib/utils"
import { TZDate } from "@date-fns/tz"
import { format } from "date-fns"
import { AlertTriangle, Loader2, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { staffLabel, titleCase, type CalendarVisit, type StaffMember, type Viewer } from "./calendar-types"

export type DialogTarget = { mode: "add"; date: string } | { mode: "edit"; visit: CalendarVisit }

type UnscheduledBooking = {
  id: string
  firstName: string
  lastName: string
  serviceType: string
  appointmentType: string
  status: string
  preferredDate: string
  endDate: string | null
}

// Preferred dates are stored as UTC midnight of the patient's chosen day.
const formatPreferredDay = (value: string) => format(new TZDate(new Date(value).getTime(), "UTC"), "MMM d")

const defaultDuration = (appointmentType: string) => (appointmentType === "followup" ? "45" : "60")

export function ScheduleVisitDialog({
  target,
  viewer,
  staff,
  visits,
  onClose,
  onSaved,
}: {
  target: DialogTarget
  viewer: Viewer
  staff: StaffMember[]
  visits: CalendarVisit[]
  onClose: () => void
  onSaved: () => void
}) {
  const editing = target.mode === "edit" ? target.visit : null
  const initialParts = editing ? toClinicLocalParts(editing.scheduledStart) : null
  const isSuperAdmin = viewer.role === "super_admin"

  const [bookingId, setBookingId] = useState(editing?.id ?? "")
  const [bookings, setBookings] = useState<UnscheduledBooking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(!editing)
  const [query, setQuery] = useState("")
  const [date, setDate] = useState(initialParts?.date ?? (target.mode === "add" ? target.date : ""))
  const [startTime, setStartTime] = useState(initialParts?.time ?? "09:00")
  const [duration, setDuration] = useState(
    editing
      ? String(Math.round((new Date(editing.scheduledEnd).getTime() - new Date(editing.scheduledStart).getTime()) / 60_000))
      : "60"
  )
  const [clinicianId, setClinicianId] = useState(editing?.assignedAdminId ?? viewer.id)
  const [confirm, setConfirm] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editing) return
    const controller = new AbortController()
    fetch("/api/bookings?unscheduled=1&limit=200", { credentials: "include", signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBookings(data.data)
        else toast.error(data.error || "Failed to load bookings")
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") toast.error("Failed to load bookings")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingBookings(false)
      })
    return () => controller.abort()
  }, [editing])

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return bookings
    return bookings.filter((b) =>
      `${b.firstName} ${b.lastName} ${b.serviceType} ${b.appointmentType}`.toLowerCase().includes(q)
    )
  }, [bookings, query])

  const selectedBooking = bookings.find((b) => b.id === bookingId)
  const bookingStatus = editing?.status ?? selectedBooking?.status
  const clinician = staff.find((member) => member.id === clinicianId)
  const durationMinutes = Number.parseInt(duration, 10)

  const conflicts = useMemo(() => {
    const start = clinicLocalToDate(date, startTime)
    if (!start || !clinicianId || !Number.isFinite(durationMinutes)) return []
    const end = start.getTime() + durationMinutes * 60_000
    return visits.filter(
      (visit) =>
        visit.id !== bookingId &&
        visit.assignedAdminId === clinicianId &&
        new Date(visit.scheduledStart).getTime() < end &&
        new Date(visit.scheduledEnd).getTime() > start.getTime()
    )
  }, [visits, bookingId, clinicianId, date, startTime, durationMinutes])

  const durationOptions = Array.from(new Set<number>([...VISIT_DURATION_OPTIONS, durationMinutes]))
    .filter((minutes) => Number.isFinite(minutes))
    .sort((a, b) => a - b)

  const submit = async (schedule: Record<string, unknown> | null) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schedule, confirm: schedule ? confirm : undefined }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.details?.[0]?.message || data.error || "Failed to save the visit")
        return
      }
      toast.success(schedule ? "Visit scheduled" : "Visit removed from the schedule")
      notifyCalendarResult(data.calendar)
      onSaved()
    } catch {
      toast.error("Failed to save the visit")
    } finally {
      setSaving(false)
    }
  }

  const save = () => {
    if (!bookingId) return toast.error("Choose a booking to schedule")
    if (!clinicianId) return toast.error("Choose a clinician")
    if (!clinicLocalToDate(date, startTime)) return toast.error("Enter a valid visit date and start time")
    void submit({ date, startTime, durationMinutes, assignedAdminId: clinicianId })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit visit" : "Add visit to calendar"}</DialogTitle>
          <DialogDescription>
            {editing
              ? `${editing.firstName} ${editing.lastName} · ${titleCase(editing.serviceType)}`
              : "Pick a booking that still needs a visit time. Times are in Calgary time."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!editing && (
            <div className="space-y-2">
              <Label htmlFor="booking-search">Booking</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="booking-search"
                  placeholder="Search by patient or service"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="max-h-56 overflow-y-auto rounded-md border" role="listbox" aria-label="Unscheduled bookings">
                {loadingBookings ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    {bookings.length === 0 ? "Every open booking already has a visit time." : "No bookings match your search."}
                  </p>
                ) : (
                  filteredBookings.map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      role="option"
                      aria-selected={booking.id === bookingId}
                      onClick={() => {
                        setBookingId(booking.id)
                        setDuration(defaultDuration(booking.appointmentType))
                      }}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 border-b px-3 py-2 text-left last:border-b-0 transition-colors hover:bg-muted/60",
                        booking.id === bookingId && "bg-primary/10"
                      )}
                    >
                      <span>
                        <span className="block font-medium">
                          {booking.firstName} {booking.lastName}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {titleCase(booking.serviceType)} · {titleCase(booking.appointmentType)} · prefers{" "}
                          {formatPreferredDay(booking.preferredDate)}
                          {booking.endDate ? ` – ${formatPreferredDay(booking.endDate)}` : ""}
                        </span>
                      </span>
                      <Badge variant={booking.status === "confirmed" ? "secondary" : "outline"}>
                        {titleCase(booking.status)}
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Clinician</Label>
            {isSuperAdmin ? (
              <Select value={clinicianId} onValueChange={setClinicianId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clinician" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {staffLabel(member)}
                      {member.calendarConnected ? "" : " (calendar not connected)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="rounded-md border px-3 py-2 text-sm">{clinician ? staffLabel(clinician) : "You"}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="visit-date">Date</Label>
              <Input id="visit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visit-time">Start time</Label>
              <Input
                id="visit-time"
                type="time"
                step={300}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((minutes) => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {minutes} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {bookingStatus === "pending" && (
            <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
              <Checkbox checked={confirm} onCheckedChange={(checked) => setConfirm(checked === true)} />
              <span>
                <span className="block font-medium">Confirm this booking</span>
                <span className="text-muted-foreground">Only confirmed visits are added to Google Calendar.</span>
              </span>
            </label>
          )}

          {conflicts.length > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Overlaps with{" "}
                {conflicts
                  .map(
                    (visit) =>
                      `${visit.firstName} ${visit.lastName} (${formatClinicDateTime(visit.scheduledStart, "h:mm a")}–${formatClinicDateTime(visit.scheduledEnd, "h:mm a")})`
                  )
                  .join(", ")}
                .
              </span>
            </div>
          )}

          {clinician && !clinician.calendarConnected && (
            <p className="text-sm text-muted-foreground">
              {staffLabel(clinician)} hasn&apos;t connected Google Calendar, so this visit will be saved here but won&apos;t
              appear on their Google Calendar until they connect.
            </p>
          )}

          {editing?.calendarSyncError && (
            <p className="text-sm text-destructive">Last calendar sync failed: {editing.calendarSyncError}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {editing ? (
            <Button variant="ghost" className="text-destructive" disabled={saving} onClick={() => void submit(null)}>
              Remove from schedule
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving || (!editing && !bookingId)}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Add to calendar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
