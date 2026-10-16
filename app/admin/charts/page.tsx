"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  Trash2,
  User,
  UserPlus,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { NotificationsBell } from "@/components/notifications-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import toast from "react-hot-toast"

interface ChartItem {
  id: string
  bookingId: string | null
  patientId: string | null
  content: string | null
  createdAt: string
  updatedAt: string
  createdBy: { id: string; email: string; name: string | null } | null
  booking: {
    id: string
    firstName: string
    lastName: string
    email: string
    preferredDate: string
    endDate: string | null
  } | null
  patient: {
    id: string
    firstName: string
    lastName: string | null
    email: string
    phoneNumber: string | null
  } | null
  accessList: { adminId: string; permission: string; admin: { id: string; email: string; name: string | null } }[]
  myPermission: string | null
  isOwner?: boolean
}

interface BookingOption {
  id: string
  firstName: string
  lastName: string
  email: string
  preferredDate: string
  endDate: string | null
  status: string
}

interface PatientOption {
  id: string
  email: string
  firstName: string
  lastName: string | null
  phoneNumber: string | null
  createdAt: string
}

interface PendingInvitation {
  id: string
  chartId: string
  permission: string
  createdAt: string
  chart: {
    id: string
    booking: { id: string; firstName: string; lastName: string; email: string; preferredDate: string; endDate: string | null } | null
    patient: { id: string; firstName: string; lastName: string | null; email: string } | null
  }
  invitedBy: { id: string; email: string; name: string | null }
}

export default function AdminChartsPage() {
  const router = useRouter()
  const [charts, setCharts] = useState<ChartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [adminInfo, setAdminInfo] = useState<{ email: string; name?: string; role?: "staff" | "super_admin" } | null>(null)
  const [showNewChart, setShowNewChart] = useState(false)
  const [bookings, setBookings] = useState<BookingOption[]>([])
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState("")
  const [chartToDelete, setChartToDelete] = useState<string | null>(null)
  const [deletingChartId, setDeletingChartId] = useState<string | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [creating, setCreating] = useState(false)
  const [newPatientMode, setNewPatientMode] = useState(false)
  const [newPatientEmail, setNewPatientEmail] = useState("")
  const [newPatientFirstName, setNewPatientFirstName] = useState("")
  const [newPatientLastName, setNewPatientLastName] = useState("")
  const [newPatientPhone, setNewPatientPhone] = useState("")
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [actingInvitationId, setActingInvitationId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login")
        } else {
          setAdminInfo(data.admin)
        }
      })
      .catch(() => router.push("/login"))
  }, [router])

  const fetchCharts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/patient-charts", { credentials: "include" })
      const data = await res.json()
      if (data.success) setCharts(data.data)
      else toast.error(data.error || "Failed to load charts")
    } catch {
      toast.error("Failed to load charts")
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingInvitations = async () => {
    try {
      setPendingLoading(true)
      const res = await fetch("/api/chart-invitations", { credentials: "include" })
      const data = await res.json()
      if (data.success) setPendingInvitations(data.data)
    } catch {
      setPendingInvitations([])
    } finally {
      setPendingLoading(false)
    }
  }

  useEffect(() => {
    fetchCharts()
    fetchPendingInvitations()
  }, [])

  const acceptInvitation = async (invitationId: string) => {
    const inv = pendingInvitations.find((i) => i.id === invitationId)
    const chartId = inv?.chartId
    setActingInvitationId(invitationId)
    try {
      const res = await fetch(`/api/chart-invitations/${invitationId}/accept`, {
        method: "POST",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Invitation accepted")
        fetchPendingInvitations()
        fetchCharts()
        if (chartId) router.push(`/admin/charts/${chartId}`)
      } else {
        toast.error(data.error || "Failed to accept")
      }
    } catch {
      toast.error("Failed to accept")
    } finally {
      setActingInvitationId(null)
    }
  }

  const declineInvitation = async (invitationId: string) => {
    setActingInvitationId(invitationId)
    try {
      const res = await fetch(`/api/chart-invitations/${invitationId}/decline`, {
        method: "POST",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Invitation declined")
        fetchPendingInvitations()
      } else {
        toast.error(data.error || "Failed to decline")
      }
    } catch {
      toast.error("Failed to decline")
    } finally {
      setActingInvitationId(null)
    }
  }

  const openNewChart = () => {
    setShowNewChart(true)
    setSelectedBookingId("")
    setSelectedPatientId("")
    setNewPatientMode(false)
    setNewPatientEmail("")
    setNewPatientFirstName("")
    setNewPatientLastName("")
    setNewPatientPhone("")
    setBookingsLoading(true)
    Promise.all([
      fetch("/api/bookings?status=all", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/patients", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([bookingsRes, patientsRes]) => {
        if (bookingsRes.success) setBookings(bookingsRes.data)
        if (patientsRes.success) setPatients(patientsRes.data)
      })
      .finally(() => setBookingsLoading(false))
  }

  const createChart = async (asDraft = false) => {
    const onChartCreated = (chartId: string) => {
      setShowNewChart(false)
      if (asDraft) {
        fetchCharts()
        toast.success("Chart saved as draft. Open it from the list to edit later.")
      } else {
        router.push(`/admin/charts/${chartId}`)
      }
    }
    if (newPatientMode) {
      if (!newPatientEmail.trim() || !newPatientFirstName.trim()) {
        toast.error("Email and name are required")
        return
      }
      setCreating(true)
      try {
        const createPatientRes = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: newPatientEmail.trim(),
            firstName: newPatientFirstName.trim(),
            lastName: newPatientLastName.trim() || undefined,
            phoneNumber: newPatientPhone.trim() || undefined,
          }),
        })
        const patientData = await createPatientRes.json()
        if (!patientData.success) {
          toast.error(patientData.error || "Failed to create patient")
          setCreating(false)
          return
        }
        const chartRes = await fetch("/api/patient-charts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ patientId: patientData.data.id }),
        })
        const chartData = await chartRes.json()
        if (chartData.success) {
          if (!asDraft) {
            const isNewPatient = createPatientRes.status === 201
            toast.success(isNewPatient ? "Patient and chart created" : "Chart created for existing patient")
          }
          onChartCreated(chartData.data.id)
        } else {
          toast.error(chartData.error || "Failed to create chart")
        }
      } catch {
        toast.error("Failed to create patient or chart")
      } finally {
        setCreating(false)
      }
      return
    }
    if (selectedPatientId) {
      setCreating(true)
      try {
        const res = await fetch("/api/patient-charts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ patientId: selectedPatientId }),
        })
        const data = await res.json()
        if (data.success) {
          if (!asDraft) toast.success("Chart created")
          onChartCreated(data.data.id)
        } else {
          toast.error(data.error || "Failed to create chart")
        }
      } catch {
        toast.error("Failed to create chart")
      } finally {
        setCreating(false)
      }
      return
    }
    if (!selectedBookingId) {
      toast.error("Select a patient/booking or create a new patient")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/patient-charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId: selectedBookingId }),
      })
      const data = await res.json()
      if (data.success) {
        if (!asDraft) toast.success("Chart created")
        onChartCreated(data.data.id)
      } else {
        toast.error(data.error || "Failed to create chart")
      }
    } catch {
      toast.error("Failed to create chart")
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      const data = await res.json()
      if (data.success) {
        toast.success("Logged out")
        router.push("/login")
        router.refresh()
      }
    } catch {
      toast.error("Failed to logout")
    }
  }

  const deleteChartFromList = async (chartId: string) => {
    setDeletingChartId(chartId)
    try {
      const res = await fetch(`/api/patient-charts/${chartId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        setChartToDelete(null)
        toast.success("Chart deleted")
        fetchCharts()
      } else {
        toast.error(data.error || "Failed to delete chart")
      }
    } catch {
      toast.error("Failed to delete chart")
    } finally {
      setDeletingChartId(null)
    }
  }

  const filtered = charts.filter((c) => {
    const term = searchTerm.toLowerCase()
    if (c.booking) {
      return (
        c.booking.firstName.toLowerCase().includes(term) ||
        c.booking.lastName.toLowerCase().includes(term) ||
        c.booking.email.toLowerCase().includes(term)
      )
    }
    if (c.patient) {
      return (
        c.patient.firstName.toLowerCase().includes(term) ||
        (c.patient.lastName?.toLowerCase().includes(term) ?? false) ||
        c.patient.email.toLowerCase().includes(term)
      )
    }
    return false
  })

  const bookingsWithoutChart = bookings.filter(
    (b) => !charts.some((c) => c.bookingId === b.id)
  )
  const patientsWithoutChart = patients.filter(
    (p) => !charts.some((c) => c.patientId === p.id)
  )
  const editableChartsCount = charts.filter((chart) => chart.myPermission === "edit").length
  const viewOnlyChartsCount = charts.length - editableChartsCount

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-foreground">Patient Charting</p>
              <p className="hidden text-xs leading-tight text-muted-foreground sm:block">Clinical workspace</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {adminInfo?.role === "super_admin" && (
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link href="/admin">
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/admin/coverage">
                <MapPin className="mr-1.5 h-4 w-4" />
                Coverage
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/admin/charts/forms">
                <FileText className="mr-1.5 h-4 w-4" />
                Form templates
              </Link>
            </Button>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            <NotificationsBell />
            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
            {adminInfo && (
              <div className="hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 lg:flex" title={`Logged in as ${adminInfo.email}`}>
                <Avatar className="h-7 w-7 border border-border">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {adminInfo.email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-[11px] text-muted-foreground">Logged in as</p>
                  <p className="max-w-[180px] truncate text-xs font-medium text-foreground">{adminInfo.email}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              title="Logout"
            >
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
          {adminInfo?.role === "super_admin" && (
            <Button variant="ghost" size="sm" asChild className="shrink-0 text-muted-foreground">
              <Link href="/admin">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild className="shrink-0 text-muted-foreground">
            <Link href="/admin/coverage">
              <MapPin className="mr-1.5 h-4 w-4" />
              Coverage
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="shrink-0 text-muted-foreground">
            <Link href="/admin/charts/forms">
              <FileText className="mr-1.5 h-4 w-4" />
              Form templates
            </Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-8 md:py-10">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Patient charts</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              View and edit shared patient charts. Only doctors with access can see each chart.
            </p>
          </div>
          <Button onClick={openNewChart} className="shrink-0 rounded-lg shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New chart
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Total charts", value: charts.length, icon: FileText, accent: "bg-foreground/5 text-foreground" },
            { label: "Can edit", value: editableChartsCount, icon: PencilLine, accent: "bg-primary/10 text-primary" },
            { label: "View only", value: viewOnlyChartsCount, icon: Eye, accent: "bg-muted text-muted-foreground" },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-4 shadow-sm"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold leading-tight text-foreground">{loading ? "–" : value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending invitations */}
        {!pendingLoading && pendingInvitations.length > 0 && (
          <Card className="overflow-hidden border-primary/30 bg-primary/[0.03] shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                  <UserPlus className="h-4 w-4 text-primary" />
                </span>
                Pending invitations
                <Badge variant="outline" className="ml-1 border-primary/30 text-primary">
                  {pendingInvitations.length}
                </Badge>
              </CardTitle>
              <CardDescription>You have been invited to access these charts. Accept to add them to your list.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {pendingInvitations.map((inv) => {
                  const chartName = inv.chart.booking
                    ? `${inv.chart.booking.firstName} ${inv.chart.booking.lastName}`
                    : inv.chart.patient
                      ? `${inv.chart.patient.firstName} ${inv.chart.patient.lastName ?? ""}`.trim()
                      : "Chart"
                  const inviterName = inv.invitedBy.name || inv.invitedBy.email
                  return (
                    <li
                      key={inv.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card p-3.5"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{chartName}</p>
                        <p className="text-sm text-muted-foreground">
                          {inviterName} invited you · {inv.permission} access
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          disabled={actingInvitationId !== null}
                          onClick={() => declineInvitation(inv.id)}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          disabled={actingInvitationId !== null}
                          onClick={() => acceptInvitation(inv.id)}
                        >
                          {actingInvitationId === inv.id ? "Accepting..." : "Accept"}
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Chart list */}
        <Card className="gap-0 overflow-hidden border-border/60 py-0 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or email…"
                aria-label="Search charts by patient name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 rounded-lg border-border/70 bg-background pl-10 focus-visible:ring-primary/40"
              />
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              {!loading && (
                <p className="whitespace-nowrap text-sm text-muted-foreground">
                  Showing {filtered.length} chart{filtered.length !== 1 ? "s" : ""}
                  {searchTerm && " (filtered)"}
                </p>
              )}
              <Button
                variant="outline"
                onClick={fetchCharts}
                disabled={loading}
                className="h-10 shrink-0 rounded-lg border-border/70"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <p className="font-medium text-foreground">Loading charts</p>
            <p className="mt-1 text-sm text-muted-foreground">Fetching your patient charts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              {searchTerm ? <Search className="h-7 w-7 text-primary" /> : <FileText className="h-7 w-7 text-primary" />}
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {searchTerm ? "No matching charts" : "No charts yet"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {searchTerm
                ? `No charts match "${searchTerm}". Try a different name or email.`
                : "Create your first patient chart to start documenting care. You can link a booking, pick an existing patient, or add a new patient."}
            </p>
            {searchTerm ? (
              <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-6 rounded-lg">
                Clear search
              </Button>
            ) : (
              <Button onClick={openNewChart} className="mt-6 rounded-lg shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                New chart
              </Button>
            )}
          </div>
        ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map((chart) => {
                const displayName = chart.booking
                  ? `${chart.booking.firstName} ${chart.booking.lastName}`
                  : chart.patient
                    ? `${chart.patient.firstName} ${chart.patient.lastName ?? ""}`.trim()
                    : "Unknown"
                const displayEmail = chart.booking?.email ?? chart.patient?.email ?? ""
                const displayDate = chart.booking
                  ? chart.booking.endDate
                    ? `${format(new Date(chart.booking.preferredDate), "MMM d, yyyy")} – ${format(new Date(chart.booking.endDate), "MMM d, yyyy")}`
                    : format(new Date(chart.booking.preferredDate), "MMM d, yyyy")
                  : null
                const initials = displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
                const canEdit = chart.myPermission === "edit"
                return (
                  <li
                    key={chart.id}
                    className="group relative flex cursor-pointer flex-col gap-4 px-4 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:px-5"
                    onClick={() => router.push(`/admin/charts/${chart.id}`)}
                  >
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <div className="flex min-w-0 flex-1 gap-4">
                      <Avatar className="h-11 w-11 shrink-0 rounded-full">
                        <AvatarFallback className="rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {initials || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                            {displayName}
                          </h3>
                          <Badge
                            variant="outline"
                            className={
                              canEdit
                                ? "shrink-0 border-primary/25 bg-primary/10 text-[11px] font-medium text-primary"
                                : "shrink-0 border-border bg-muted text-[11px] font-medium text-muted-foreground"
                            }
                          >
                            {canEdit ? <PencilLine className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                            {canEdit ? "Can edit" : "View only"}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{displayEmail}</span>
                          </span>
                          {displayDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              {displayDate}
                            </span>
                          )}
                        </div>
                        {chart.createdBy && (
                          <p className="mt-1.5 text-xs text-muted-foreground/80">
                            Chart by {chart.createdBy.name || chart.createdBy.email} · Updated{" "}
                            {format(new Date(chart.updatedAt), "MMM d, yyyy HH:mm")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pl-15 sm:pl-0">
                      <Button asChild variant="outline" size="sm" className="rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/admin/charts/${chart.id}`} className="flex items-center gap-1">
                          Open chart
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                      {chart.isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setChartToDelete(chart.id)
                          }}
                          title="Delete chart"
                          aria-label={`Delete chart for ${displayName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
        )}
        </Card>

        <Dialog open={showNewChart} onOpenChange={setShowNewChart}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create patient chart</DialogTitle>
              <DialogDescription>
                Select a booking or patient, or create a new patient (email, name, phone optional) and then create a chart.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2 border-b pb-2">
                <Button
                  type="button"
                  variant={!newPatientMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setNewPatientMode(false)
                    setSelectedPatientId("")
                  }}
                >
                  From booking / patient
                </Button>
                <Button
                  type="button"
                  variant={newPatientMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setNewPatientMode(true)
                    setSelectedBookingId("")
                    setSelectedPatientId("")
                  }}
                >
                  Create new patient
                </Button>
              </div>

              {!newPatientMode ? (
                <>
                  <div className="space-y-2">
                    <Label>From booking</Label>
                    <Select
                      value={selectedBookingId}
                      onValueChange={(v) => {
                        setSelectedBookingId(v)
                        setSelectedPatientId("")
                      }}
                      disabled={bookingsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={bookingsLoading ? "Loading..." : "Select booking"} />
                      </SelectTrigger>
                      <SelectContent>
                        {bookingsWithoutChart.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.firstName} {b.lastName} · {b.email} ·{" "}
                            {format(new Date(b.preferredDate), "MMM d, yyyy")}
                          </SelectItem>
                        ))}
                        {!bookingsLoading && bookingsWithoutChart.length === 0 && (
                          <SelectItem value="_none" disabled>
                            No bookings without a chart
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Or from existing patient (no chart yet)</Label>
                    <Select
                      value={selectedPatientId}
                      onValueChange={(v) => {
                        setSelectedPatientId(v)
                        setSelectedBookingId("")
                      }}
                      disabled={bookingsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={bookingsLoading ? "Loading..." : "Select patient"} />
                      </SelectTrigger>
                      <SelectContent>
                        {patientsWithoutChart.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName ?? ""} · {p.email}
                          </SelectItem>
                        ))}
                        {!bookingsLoading && patientsWithoutChart.length === 0 && (
                          <SelectItem value="_none" disabled>
                            No patients without a chart
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="patient@example.com"
                      value={newPatientEmail}
                      onChange={(e) => setNewPatientEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>First name *</Label>
                    <Input
                      placeholder="First name"
                      value={newPatientFirstName}
                      onChange={(e) => setNewPatientFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last name (optional)</Label>
                    <Input
                      placeholder="Last name"
                      value={newPatientLastName}
                      onChange={(e) => setNewPatientLastName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone (optional)</Label>
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      value={newPatientPhone}
                      onChange={(e) => setNewPatientPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowNewChart(false)} className="sm:mr-auto">
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => createChart(true)}
                disabled={
                  creating ||
                  (newPatientMode ? !newPatientEmail.trim() || !newPatientFirstName.trim() : !selectedBookingId && !selectedPatientId)
                }
              >
                {creating ? "Saving..." : "Save as draft"}
              </Button>
              <Button
                onClick={() => createChart(false)}
                disabled={
                  creating ||
                  (newPatientMode ? !newPatientEmail.trim() || !newPatientFirstName.trim() : !selectedBookingId && !selectedPatientId)
                }
              >
                {creating ? "Creating..." : newPatientMode ? "Create patient & chart" : "Create chart"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!chartToDelete} onOpenChange={(open) => !open && setChartToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this chart?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the chart and all its notes. Everyone who had access will no longer see it. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={!!deletingChartId}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  if (chartToDelete) deleteChartFromList(chartToDelete)
                }}
                disabled={!!deletingChartId}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletingChartId ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete chart"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
