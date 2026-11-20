"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import type { StaffMember, Viewer } from "./calendar-types"
import { ScheduleCalendar } from "./schedule-calendar"

function CalendarSettings() {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [viewer, setViewer] = useState<Viewer | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const staffRes = await fetch("/api/admins", { credentials: "include" }).then((res) => res.json())
    if (staffRes.success) setStaff(staffRes.data)
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await fetch("/api/auth/me", { credentials: "include" }).then((res) => res.json())
        if (!me.authenticated) {
          router.push("/login")
          return
        }
        if (active) setViewer({ id: me.admin.id, role: me.admin.role === "super_admin" ? "super_admin" : "staff" })
        await load()
      } catch {
        toast.error("Failed to load the calendar")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [load, router])

  if (loading || !viewer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="mx-auto w-full max-w-[1400px] space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Schedule</h1>
            <p className="max-w-2xl text-muted-foreground">
              Click a day to see its visits, or use <span className="font-medium text-foreground">Add visit</span> to give
              a booking a time. Times are shown in Calgary time.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={viewer.role === "super_admin" ? "/admin" : "/admin/charts"}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <ScheduleCalendar viewer={viewer} staff={staff} />
      </div>
    </div>
  )
}

export default function AdminCalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CalendarSettings />
    </Suspense>
  )
}
