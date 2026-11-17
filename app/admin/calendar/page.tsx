"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, CalendarCheck, CalendarDays, Loader2, Unplug } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import type { StaffMember, Viewer } from "./calendar-types"
import { ScheduleCalendar } from "./schedule-calendar"

type CalendarStatus = {
  configured: boolean
  connected: boolean
  googleEmail: string | null
  connectedAt: string | null
}

const CONNECT_MESSAGES: Record<string, string> = {
  denied: "Google Calendar access was not granted.",
  invalid_state: "The Google sign-in session expired or didn't match. Please try connecting again.",
  calendar_permission_missing:
    "Calendar access wasn't granted. When Google asks, keep the \"See, edit, share and delete calendar events\" box ticked.",
  no_refresh_token: "Google didn't return long-term access. Please try connecting again.",
  no_identity: "Couldn't confirm which Google account was used. Please try again.",
  not_configured: "Google Calendar isn't set up on the server yet.",
  connect_failed: "Connecting to Google Calendar failed. Please try again.",
}

function CalendarSettings() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<CalendarStatus | null>(null)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [viewer, setViewer] = useState<Viewer | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  const load = useCallback(async () => {
    const [statusRes, staffRes] = await Promise.all([
      fetch("/api/admin/google-calendar", { credentials: "include" }).then((res) => res.json()),
      fetch("/api/admins", { credentials: "include" }).then((res) => res.json()),
    ])
    if (statusRes.success) setStatus(statusRes.data)
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

  useEffect(() => {
    if (searchParams.get("connected")) {
      toast.success("Google Calendar connected")
      router.replace("/admin/calendar")
    }
  }, [router, searchParams])

  const errorCode = searchParams.get("error")
  const errorMessage = errorCode ? CONNECT_MESSAGES[errorCode] ?? CONNECT_MESSAGES.connect_failed : null

  const disconnect = async () => {
    setDisconnecting(true)
    try {
      const res = await fetch("/api/admin/google-calendar", { method: "DELETE", credentials: "include" })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || "Failed to disconnect")
        return
      }
      toast.success("Google Calendar disconnected")
      await load()
    } catch {
      toast.error("Failed to disconnect")
    } finally {
      setDisconnecting(false)
    }
  }

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
              a booking a time. Confirmed visits appear on the assigned clinician&apos;s Google Calendar.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={viewer.role === "super_admin" ? "/admin" : "/admin/charts"}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {errorMessage ? (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <p>{errorMessage}</p>
          </div>
        ) : null}

        <Card>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              {!status?.configured ? (
                <div className="text-sm">
                  <p className="font-medium">Google Calendar isn&apos;t set up on the server yet.</p>
                  <p className="text-muted-foreground">
                    A developer needs to add <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code> and{" "}
                    <code>GOOGLE_TOKEN_ENCRYPTION_KEY</code> to the server environment.
                  </p>
                </div>
              ) : status.connected ? (
                <div className="text-sm">
                  <p className="font-medium">Your Google Calendar: {status.googleEmail}</p>
                  <p className="text-muted-foreground">
                    Confirmed visits assigned to you sync automatically
                    {status.connectedAt ? ` · connected ${new Date(status.connectedAt).toLocaleDateString()}` : ""}.
                  </p>
                </div>
              ) : (
                <div className="text-sm">
                  <p className="font-medium">Your Google Calendar isn&apos;t connected</p>
                  <p className="text-muted-foreground">Visits assigned to you won&apos;t reach Google Calendar until you connect.</p>
                </div>
              )}
            </div>
            {status?.configured &&
              (status.connected ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/api/admin/google-calendar/connect">Switch account</a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={disconnect} disabled={disconnecting}>
                    {disconnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unplug className="mr-2 h-4 w-4" />}
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button asChild>
                  <a href="/api/admin/google-calendar/connect">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Connect Google Calendar
                  </a>
                </Button>
              ))}
          </CardContent>
        </Card>

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
