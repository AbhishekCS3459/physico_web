"use client"

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
  FileText,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  User,
  UserPlus,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { NotificationsBell } from "@/components/notifications-bell"
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

  const createChart = async () => {
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
          toast.success("Patient and chart created")
          setShowNewChart(false)
          router.push(`/admin/charts/${chartData.data.id}`)
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
          toast.success("Chart created")
          setShowNewChart(false)
          router.push(`/admin/charts/${data.data.id}`)
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
        toast.success("Chart created")
        setShowNewChart(false)
        router.push(`/admin/charts/${data.data.id}`)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 rounded-2xl border-2 border-border/60 bg-card/80 backdrop-blur-sm p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Stethoscope className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  Patient Charting
                </h1>
                <p className="text-muted-foreground mt-1 max-w-xl">
                  View and edit shared patient charts. Only doctors with access can see each chart.
                </p>
                {adminInfo && (
                  <div className="mt-3 flex items-center gap-2">
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {adminInfo.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">Logged in as {adminInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap items-center shrink-0">
              <NotificationsBell />
              {adminInfo?.role === "super_admin" && (
                <Button variant="outline" asChild className="border-border">
                  <Link href="/admin">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <Button onClick={openNewChart} className="bg-primary hover:bg-primary/90 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                New chart
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-border">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Pending invitations */}
        {!pendingLoading && pendingInvitations.length > 0 && (
          <Card className="mb-6 border-2 border-primary/30 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-primary/5 py-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                Pending invitations
              </CardTitle>
              <CardDescription>You have been invited to access these charts. Accept to add them to your list.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
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
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 bg-muted/30"
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

        {/* Search */}
        <Card className="mb-6 border-2 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/30 py-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Find charts
            </CardTitle>
            <CardDescription>Search by patient name or email</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. John Smith, john@example.com..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 rounded-lg border-border bg-background"
                />
              </div>
              <Button variant="outline" onClick={fetchCharts} className="h-11 rounded-lg shrink-0">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="border-2 shadow-sm overflow-hidden">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
                <p className="text-lg font-medium text-foreground">Loading charts</p>
                <p className="text-sm text-muted-foreground mt-1">Fetching your patient charts...</p>
              </div>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-2 shadow-sm overflow-hidden border-dashed">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No charts yet</h3>
                <p className="text-muted-foreground mt-2">
                  Create your first patient chart to start documenting care. You can link a booking, pick an existing patient, or add a new patient.
                </p>
                <Button onClick={openNewChart} className="mt-6 bg-primary hover:bg-primary/90 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New chart
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filtered.length} chart{filtered.length !== 1 ? "s" : ""}
              {searchTerm && " (filtered)"}
            </p>
            <div className="space-y-4">
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
                return (
                  <Card
                    key={chart.id}
                    className="border-2 border-l-4 border-l-primary hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group overflow-hidden"
                    onClick={() => router.push(`/admin/charts/${chart.id}`)}
                  >
                    <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 shrink-0 rounded-xl border-2 border-border bg-primary/10">
                          <AvatarFallback className="text-sm font-medium text-primary rounded-xl">
                            {initials || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {displayName}
                            </h3>
                            <Badge variant={chart.myPermission === "edit" ? "default" : "secondary"} className="shrink-0 text-xs">
                              {chart.myPermission === "edit" ? "Can edit" : "View only"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
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
                            <p className="text-xs text-muted-foreground mt-2">
                              Chart by {chart.createdBy.name || chart.createdBy.email} · Updated{" "}
                              {format(new Date(chart.updatedAt), "MMM d, yyyy HH:mm")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button asChild variant="outline" size="sm" className="rounded-lg" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/admin/charts/${chart.id}`} className="flex items-center gap-1">
                            Open chart
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewChart(false)}>
                Cancel
              </Button>
              <Button
                onClick={createChart}
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
      </div>
    </div>
  )
}
