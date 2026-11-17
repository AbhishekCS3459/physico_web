"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CLINIC_TIME_ZONE, formatClinicDateTime } from "@/lib/schedule"
import { cn } from "@/lib/utils"
import { TZDate } from "@date-fns/tz"
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight, Loader2, MapPin, Pencil, Plus } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { staffLabel, titleCase, type CalendarVisit, type StaffMember, type Viewer } from "./calendar-types"
import { ScheduleVisitDialog, type DialogTarget } from "./schedule-visit-dialog"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MAX_CHIPS = 3

const clinicNow = () => TZDate.tz(CLINIC_TIME_ZONE)
const dayKey = (day: Date) => format(day, "yyyy-MM-dd")
const fromDayKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number)
  return new TZDate(year, month - 1, day, CLINIC_TIME_ZONE)
}

function visitTone(visit: CalendarVisit) {
  if (visit.status === "completed") return "completed"
  if (visit.status !== "confirmed") return "pending"
  return visit.googleEventId ? "synced" : "unsynced"
}

const CHIP_CLASSES: Record<ReturnType<typeof visitTone>, string> = {
  synced: "bg-primary text-primary-foreground",
  unsynced: "border border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-100",
  pending: "border border-dashed border-muted-foreground/60 bg-background text-foreground",
  completed: "bg-muted text-muted-foreground",
}

const DOT_CLASSES: Record<ReturnType<typeof visitTone>, string> = {
  synced: "bg-primary",
  unsynced: "bg-amber-500",
  pending: "bg-muted-foreground/60",
  completed: "bg-muted-foreground/30",
}

export function ScheduleCalendar({ viewer, staff }: { viewer: Viewer; staff: StaffMember[] }) {
  const [anchor, setAnchor] = useState(() => startOfMonth(clinicNow()))
  const [selectedDay, setSelectedDay] = useState(() => dayKey(clinicNow()))
  const [filter, setFilter] = useState(viewer.role === "super_admin" ? "all" : viewer.id)
  const [visits, setVisits] = useState<CalendarVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogTarget, setDialogTarget] = useState<DialogTarget | null>(null)

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(anchor), end: endOfWeek(endOfMonth(anchor)) }),
    [anchor]
  )
  const rangeFrom = new Date(days[0].getTime()).toISOString()
  const rangeTo = new Date(addDays(days[days.length - 1], 1).getTime()).toISOString()
  const todayKey = dayKey(clinicNow())

  const loadVisits = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true)
      const params = new URLSearchParams({ scheduledFrom: rangeFrom, scheduledTo: rangeTo, limit: "500" })
      if (filter !== "all") params.set("assignedTo", filter)
      try {
        const res = await fetch(`/api/bookings?${params}`, { credentials: "include", signal })
        const data = await res.json()
        if (data.success) setVisits(data.data)
        else toast.error(data.error || "Failed to load the calendar")
      } catch (error) {
        if ((error as Error).name !== "AbortError") toast.error("Failed to load the calendar")
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [rangeFrom, rangeTo, filter]
  )

  useEffect(() => {
    const controller = new AbortController()
    void loadVisits(controller.signal)
    return () => controller.abort()
  }, [loadVisits])

  const visitsByDay = useMemo(() => {
    const groups = new Map<string, CalendarVisit[]>()
    for (const visit of visits) {
      const key = formatClinicDateTime(visit.scheduledStart, "yyyy-MM-dd")
      groups.set(key, [...(groups.get(key) ?? []), visit])
    }
    return groups
  }, [visits])

  const staffById = useMemo(() => new Map(staff.map((member) => [member.id, member])), [staff])
  const clinicianName = (id: string | null) => {
    const member = id ? staffById.get(id) : undefined
    return member ? staffLabel(member) : "Unassigned"
  }

  const canEdit = (visit: CalendarVisit) => viewer.role === "super_admin" || visit.assignedAdminId === viewer.id
  const openVisit = (visit: CalendarVisit) => {
    if (canEdit(visit)) setDialogTarget({ mode: "edit", visit })
  }

  const goToMonth = (next: TZDate) => {
    const first = startOfMonth<TZDate>(next)
    setAnchor(first)
    setSelectedDay(dayKey(isSameMonth(next, clinicNow()) ? clinicNow() : first))
  }

  const selectedVisits = visitsByDay.get(selectedDay) ?? []
  const selectedDate = fromDayKey(selectedDay)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="overflow-hidden">
        <CardHeader className="gap-4 space-y-0 border-b sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => goToMonth(addMonths(anchor, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Next month" onClick={() => goToMonth(addMonths(anchor, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => goToMonth(clinicNow())}>
              Today
            </Button>
            <h2 className="ml-2 text-xl font-semibold">{format(anchor, "MMMM yyyy")}</h2>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]" aria-label="Show visits for">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All clinicians</SelectItem>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.id === viewer.id ? `${staffLabel(member)} (you)` : staffLabel(member)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setDialogTarget({ mode: "add", date: selectedDay })}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add visit
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="py-2">
                {weekday}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = dayKey(day)
              const dayVisits = visitsByDay.get(key) ?? []
              const inMonth = isSameMonth(day, anchor)
              const isSelected = key === selectedDay
              const isToday = key === todayKey
              const isPast = key < todayKey
              return (
                <div
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  className={cn(
                    "group relative min-h-[68px] cursor-pointer border-b border-r p-1 transition-colors hover:bg-muted/40 sm:min-h-[112px] sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                    !inMonth && "bg-muted/20 text-muted-foreground",
                    isSelected && "bg-primary/5 ring-2 ring-inset ring-primary"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(key)}
                      aria-pressed={isSelected}
                      aria-label={`${format(day, "EEEE, MMMM d")}${dayVisits.length ? `, ${dayVisits.length} visits` : ""}`}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                        isToday && "bg-primary font-semibold text-primary-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                    {!isPast && (
                      <button
                        type="button"
                        aria-label={`Add visit on ${format(day, "MMMM d")}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedDay(key)
                          setDialogTarget({ mode: "add", date: key })
                        }}
                        className="hidden h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-primary hover:text-primary-foreground focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-1 hidden space-y-1 sm:block">
                    {dayVisits.slice(0, MAX_CHIPS).map((visit) => (
                      <button
                        key={visit.id}
                        type="button"
                        title={`${formatClinicDateTime(visit.scheduledStart, "h:mm a")} ${visit.firstName} ${visit.lastName} · ${clinicianName(visit.assignedAdminId)}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedDay(key)
                          openVisit(visit)
                        }}
                        className={cn(
                          "block w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium",
                          CHIP_CLASSES[visitTone(visit)]
                        )}
                      >
                        {formatClinicDateTime(visit.scheduledStart, "h:mm a")} {visit.firstName} {visit.lastName.charAt(0)}
                      </button>
                    ))}
                    {dayVisits.length > MAX_CHIPS && (
                      <p className="px-1 text-xs text-muted-foreground">+{dayVisits.length - MAX_CHIPS} more</p>
                    )}
                  </div>

                  {dayVisits.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-0.5 px-1 sm:hidden">
                      {dayVisits.slice(0, 4).map((visit) => (
                        <span key={visit.id} className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASSES[visitTone(visit)])} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 p-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", DOT_CLASSES.synced)} /> On Google Calendar
            </span>
            <span className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", DOT_CLASSES.unsynced)} /> Confirmed, not synced
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-muted-foreground" /> Pending
            </span>
            <span className="ml-auto">Calgary time</span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="text-lg">{format(selectedDate, "EEEE, MMMM d")}</CardTitle>
          <CardDescription>
            {selectedVisits.length === 0
              ? "No visits scheduled."
              : `${selectedVisits.length} visit${selectedVisits.length === 1 ? "" : "s"} scheduled`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedVisits.map((visit) => (
            <div key={visit.id} className="space-y-1.5 rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                  {formatClinicDateTime(visit.scheduledStart, "h:mm a")} – {formatClinicDateTime(visit.scheduledEnd, "h:mm a")}
                </p>
                {canEdit(visit) && (
                  <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8" aria-label="Edit visit" onClick={() => openVisit(visit)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p>
                {visit.firstName} {visit.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {titleCase(visit.serviceType)} · {titleCase(visit.appointmentType)}
              </p>
              <p className="text-sm text-muted-foreground">With {clinicianName(visit.assignedAdminId)}</p>
              <p className="flex items-start gap-1 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {visit.fullAddress}
              </p>
              <div>
                {visitTone(visit) === "synced" ? (
                  <Badge variant="secondary">On Google Calendar</Badge>
                ) : visitTone(visit) === "unsynced" ? (
                  <Badge variant="destructive" title={visit.calendarSyncError ?? undefined}>
                    Not synced
                  </Badge>
                ) : (
                  <Badge variant="outline">{titleCase(visit.status)}</Badge>
                )}
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => setDialogTarget({ mode: "add", date: selectedDay })}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add visit on {format(selectedDate, "MMM d")}
          </Button>
        </CardContent>
      </Card>

      {dialogTarget && (
        <ScheduleVisitDialog
          key={dialogTarget.mode === "edit" ? dialogTarget.visit.id : `add-${dialogTarget.date}`}
          target={dialogTarget}
          viewer={viewer}
          staff={staff}
          visits={visits}
          onClose={() => setDialogTarget(null)}
          onSaved={() => {
            setDialogTarget(null)
            void loadVisits()
          }}
        />
      )}
    </div>
  )
}
