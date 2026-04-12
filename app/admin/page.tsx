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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Edit,
    FileText,
    Filter,
    LogOut,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Search,
    Trash2,
    User,
    X,
    ClipboardList,
    Plus,
    Users,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { InitialAssessmentForm } from "@/components/assessment-forms/initial-assessment-form"
import { FollowupAssessmentForm } from "@/components/assessment-forms/followup-assessment-form"
import { ThemeToggle } from "@/components/theme-toggle"

interface TherapyBooking {
  id: string
  serviceType: string
  appointmentType: string
  preferredDate: string
  preferredTime: string | null
  endDate: string | null
  serviceLocation: string
  fullAddress: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string | null
  condition: string | null
  medicalHistory: string | null
  useDirectBilling: boolean
  insuranceProvider: string | null
  policyNumber: string | null
  groupNumber: string | null
  emergencyContact: string | null
  specialInstructions: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<TherapyBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<TherapyBooking | null>(null)
  const [editingBooking, setEditingBooking] = useState<TherapyBooking | null>(null)
  const [deletingBooking, setDeletingBooking] = useState<TherapyBooking | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<TherapyBooking>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [adminInfo, setAdminInfo] = useState<{ id: string; email: string; name?: string; role?: "staff" | "super_admin" } | null>(null)
  const [staffList, setStaffList] = useState<{ id: string; email: string; name: string | null; role: string }[]>([])
  const [updatingRoleFor, setUpdatingRoleFor] = useState<string | null>(null)
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false)
  const [assessmentType, setAssessmentType] = useState<"initial" | "followup" | null>(null)
  const [assessments, setAssessments] = useState<any[]>([])
  const [viewingAssessment, setViewingAssessment] = useState<any | null>(null)
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null)
  const [chartForBooking, setChartForBooking] = useState<{ id: string } | null | "loading">(null)
  const [creatingChart, setCreatingChart] = useState(false)

  useEffect(() => {
    // Check authentication; staff may only access patient charts (redirect handled by middleware + here as backup)
    fetch("/api/auth/me", {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login")
        } else if (data.admin?.role === "staff") {
          router.replace("/admin/charts")
        } else {
          setAdminInfo(data.admin)
        }
      })
      .catch(() => {
        router.push("/login")
      })
  }, [router])

  useEffect(() => {
    if (adminInfo?.role !== "super_admin") return
    fetch("/api/admins", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setStaffList(data.data)
      })
      .catch(() => {})
  }, [adminInfo?.role])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include',
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Logged out successfully")
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    }
  }

  const handleRoleChange = async (adminId: string, newRole: "staff" | "super_admin") => {
    if (adminInfo?.role !== "super_admin" || adminId === adminInfo?.id) return
    setUpdatingRoleFor(adminId)
    try {
      const res = await fetch(`/api/admins/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (data.success) {
        setStaffList((prev) =>
          prev.map((a) => (a.id === adminId ? { ...a, role: newRole } : a))
        )
        toast.success("Role updated")
      } else {
        toast.error(data.error || "Failed to update role")
      }
    } catch {
      toast.error("Failed to update role")
    } finally {
      setUpdatingRoleFor(null)
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      const response = await fetch(`/api/bookings?${params.toString()}`)
      const data = await response.json()
      if (data.success) {
        setBookings(data.data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Failed to fetch bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchAssessments = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/assessments?bookingId=${bookingId}`)
      const data = await response.json()
      if (data.success) {
        setAssessments(data.data)
      }
    } catch (error) {
      console.error("Error fetching assessments:", error)
    }
  }

  useEffect(() => {
    if (selectedBooking) {
      fetchAssessments(selectedBooking.id)
      setChartForBooking("loading")
      fetch(`/api/patient-charts?bookingId=${selectedBooking.id}`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data?.length > 0) {
            setChartForBooking({ id: d.data[0].id })
          } else {
            setChartForBooking(null)
          }
        })
        .catch(() => setChartForBooking(null))
    } else {
      setChartForBooking(null)
    }
  }, [selectedBooking])

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      booking.firstName.toLowerCase().includes(searchLower) ||
      booking.lastName.toLowerCase().includes(searchLower) ||
      booking.email.toLowerCase().includes(searchLower) ||
      booking.phoneNumber.includes(searchTerm) ||
      booking.serviceType.toLowerCase().includes(searchLower)
    )
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "confirmed":
        return "default"
      case "cancelled":
        return "destructive"
      case "completed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleEdit = (booking: TherapyBooking) => {
    setEditingBooking(booking)
    setEditFormData({
      ...booking,
      preferredDate: booking.preferredDate ? format(new Date(booking.preferredDate), "yyyy-MM-dd") : "",
      endDate: booking.endDate ? format(new Date(booking.endDate), "yyyy-MM-dd") : null,
      dateOfBirth: booking.dateOfBirth ? format(new Date(booking.dateOfBirth), "yyyy-MM-dd") : null,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingBooking) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Booking updated successfully")
        setEditingBooking(null)
        setEditFormData({})
        fetchBookings()
      } else {
        toast.error(data.error || "Failed to update booking")
      }
    } catch (error) {
      console.error("Error updating booking:", error)
      toast.error("Failed to update booking")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingBooking) return

    try {
      const response = await fetch(`/api/bookings/${deletingBooking.id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Booking deleted successfully")
        setDeletingBooking(null)
        fetchBookings()
      } else {
        toast.error(data.error || "Failed to delete booking")
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast.error("Failed to delete booking")
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Status updated successfully")
        fetchBookings()
      } else {
        toast.error(data.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Service Type",
      "Appointment Type",
      "Preferred Date",
      "End Date",
      "Address",
      "Status",
      "Created At",
    ]
    const rows = filteredBookings.map((booking) => [
      booking.id,
      `${booking.firstName} ${booking.lastName}`,
      booking.email,
      booking.phoneNumber,
      booking.serviceType,
      booking.appointmentType,
      format(new Date(booking.preferredDate), "yyyy-MM-dd"),
      booking.endDate ? format(new Date(booking.endDate), "yyyy-MM-dd") : "",
      booking.fullAddress,
      booking.status,
      format(new Date(booking.createdAt), "yyyy-MM-dd HH:mm:ss"),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `therapy-bookings-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("CSV exported successfully")
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">Manage therapy booking requests</p>
            {adminInfo && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2 flex-wrap">
                <User className="h-4 w-4" />
                Logged in as: {adminInfo.email}
                {adminInfo.role && (
                  <Badge variant={adminInfo.role === "super_admin" ? "default" : "secondary"} className="text-xs">
                    {adminInfo.role === "super_admin" ? "Super admin" : "Staff"}
                  </Badge>
                )}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" asChild className="w-full md:w-auto">
              <Link href="/admin/charts">
                <ClipboardList className="h-4 w-4 mr-2" />
                Patient Charts
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full md:w-auto">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full md:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Bookings
              </CardDescription>
              <CardTitle className="text-4xl font-bold">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pending
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Confirmed
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-blue-600">{stats.confirmed}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Completed
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-green-600">{stats.completed}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-600" />
                Cancelled
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-red-600">{stats.cancelled}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Team / Staff management (super_admin only) */}
        {adminInfo?.role === "super_admin" && (
          <Card className="mb-6 border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team
              </CardTitle>
              <CardDescription>
                Change staff roles. You cannot change your own role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Email</th>
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-left py-2 font-medium">Role</th>
                      <th className="text-left py-2 font-medium">Change role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((staff) => (
                      <tr key={staff.id} className="border-b last:border-0">
                        <td className="py-2">{staff.email}</td>
                        <td className="py-2">{staff.name ?? "—"}</td>
                        <td className="py-2">
                          <Badge variant={staff.role === "super_admin" ? "default" : "secondary"}>
                            {staff.role === "super_admin" ? "Super admin" : "Staff"}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {staff.id === adminInfo?.id ? (
                            <span className="text-muted-foreground text-xs">(you)</span>
                          ) : updatingRoleFor === staff.id ? (
                            <span className="text-muted-foreground text-xs">Updating...</span>
                          ) : (
                            <Select
                              value={staff.role}
                              onValueChange={(v) => handleRoleChange(staff.id, v as "staff" | "super_admin")}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="super_admin">Super admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Filters and Actions */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, phone, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchBookings} className="h-11">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportToCSV} className="h-11">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Bookings List */}
        {loading ? (
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground text-lg">Loading bookings...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">No bookings found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card
                key={booking.id}
                className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedBooking(booking)}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                          {booking.firstName} {booking.lastName}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{booking.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{booking.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {booking.endDate 
                              ? `${format(new Date(booking.preferredDate), "MMM dd, yyyy")} - ${format(new Date(booking.endDate), "MMM dd, yyyy")}`
                              : format(new Date(booking.preferredDate), "MMM dd, yyyy")
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="capitalize">{booking.serviceType.replace("-", " ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                      <div className="text-sm text-muted-foreground mb-2 lg:mb-0">
                        {format(new Date(booking.createdAt), "MMM dd, yyyy HH:mm")}
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(booking)}
                          className="h-9"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingBooking(booking)}
                          className="h-9 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Select
                          value={booking.status}
                          onValueChange={(value) => handleStatusChange(booking.id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-9" onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedBooking.firstName} {selectedBooking.lastName}
                    </DialogTitle>
                    <DialogDescription>Booking ID: {selectedBooking.id}</DialogDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(selectedBooking.status)} className="flex items-center gap-1">
                    {getStatusIcon(selectedBooking.status)}
                    {selectedBooking.status}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedBooking.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedBooking.phoneNumber}
                      </p>
                    </div>
                    {selectedBooking.dateOfBirth && (
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p>{format(new Date(selectedBooking.dateOfBirth), "MMM dd, yyyy")}</p>
                      </div>
                    )}
                    {selectedBooking.emergencyContact && (
                      <div>
                        <p className="text-sm text-muted-foreground">Emergency Contact</p>
                        <p>{selectedBooking.emergencyContact}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Service Type</p>
                      <p className="capitalize">{selectedBooking.serviceType.replace("-", " ")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Appointment Type</p>
                      <p className="capitalize">{selectedBooking.appointmentType.replace("-", " ")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date Range</p>
                      <p>
                        {selectedBooking.endDate 
                          ? `${format(new Date(selectedBooking.preferredDate), "MMM dd, yyyy")} - ${format(new Date(selectedBooking.endDate), "MMM dd, yyyy")}`
                          : format(new Date(selectedBooking.preferredDate), "MMM dd, yyyy")
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Service Location</p>
                      <p className="capitalize">{selectedBooking.serviceLocation.replace("-", " ")}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">Full Address</p>
                    <p className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      {selectedBooking.fullAddress}
                    </p>
                  </div>
                </div>

                {/* Medical Information */}
                {(selectedBooking.condition || selectedBooking.medicalHistory) && (
                  <div>
                    <h3 className="font-semibold mb-3">Medical Information</h3>
                    {selectedBooking.condition && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Condition/Reason</p>
                        <p>{selectedBooking.condition}</p>
                      </div>
                    )}
                    {selectedBooking.medicalHistory && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Medical History</p>
                        <p>{selectedBooking.medicalHistory}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Insurance Information */}
                {selectedBooking.useDirectBilling && (
                  <div>
                    <h3 className="font-semibold mb-3">Insurance Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBooking.insuranceProvider && (
                        <div>
                          <p className="text-sm text-muted-foreground">Provider</p>
                          <p>{selectedBooking.insuranceProvider}</p>
                        </div>
                      )}
                      {selectedBooking.policyNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">Policy Number</p>
                          <p>{selectedBooking.policyNumber}</p>
                        </div>
                      )}
                      {selectedBooking.groupNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">Group Number</p>
                          <p>{selectedBooking.groupNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {selectedBooking.specialInstructions && (
                  <div>
                    <h3 className="font-semibold mb-3">Special Instructions</h3>
                    <p>{selectedBooking.specialInstructions}</p>
                  </div>
                )}

                {/* Assessments Section */}
                <div className="pt-6 border-t">
                  <div className="rounded-xl border-2 border-border/60 bg-muted/20 overflow-hidden">
                    <div className="px-5 py-4 border-b border-border/60 bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Assessments
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {assessments.length} assessment{assessments.length !== 1 ? "s" : ""} on file
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-border"
                          onClick={() => {
                            setAssessmentType("initial")
                            setEditingAssessment(null)
                            setShowAssessmentDialog(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Initial Assessment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-border"
                          onClick={() => {
                            setAssessmentType("followup")
                            setEditingAssessment(null)
                            setShowAssessmentDialog(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Follow-up Assessment
                        </Button>
                      </div>
                    </div>
                    <div className="p-5">
                      {assessments.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border bg-background/50 py-10 px-6 text-center">
                          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
                          <p className="text-sm font-medium text-foreground">No assessments yet</p>
                          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                            Create an initial or follow-up assessment to document this patient&apos;s care.
                          </p>
                          <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => {
                                setAssessmentType("initial")
                                setEditingAssessment(null)
                                setShowAssessmentDialog(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Initial Assessment
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => {
                                setAssessmentType("followup")
                                setEditingAssessment(null)
                                setShowAssessmentDialog(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Follow-up
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {assessments.map((assessment) => (
                            <Card
                              key={assessment.id}
                              className="border-2 border-border/60 hover:border-primary/30 hover:shadow-sm transition-all overflow-hidden"
                            >
                              <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <Badge
                                        variant={assessment.assessmentType === "initial" ? "default" : "secondary"}
                                        className="shrink-0 font-medium"
                                      >
                                        {assessment.assessmentType === "initial"
                                          ? "Initial"
                                          : "Follow-up"}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {format(
                                          new Date(assessment.createdAt),
                                          "MMM dd, yyyy"
                                        )}
                                      </span>
                                    </div>
                                    {assessment.clinicalImpression && (
                                      <p className="text-sm text-foreground/90 line-clamp-2">
                                        {assessment.clinicalImpression.substring(0, 120)}
                                        {assessment.clinicalImpression.length > 120 ? "..." : ""}
                                      </p>
                                    )}
                                    {assessment.plan && !assessment.clinicalImpression && (
                                      <p className="text-sm text-foreground/90 line-clamp-2">
                                        {assessment.plan.substring(0, 120)}
                                        {assessment.plan.length > 120 ? "..." : ""}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-lg"
                                      onClick={() => setViewingAssessment(assessment)}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-lg"
                                      onClick={() => {
                                        setEditingAssessment(assessment)
                                        setAssessmentType(
                                          assessment.assessmentType as "initial" | "followup"
                                        )
                                        setShowAssessmentDialog(true)
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Patient chart */}
                <div className="pt-6 border-t">
                  <div className="rounded-xl border-2 border-border/60 bg-muted/20 overflow-hidden">
                    <div className="px-5 py-4 border-b border-border/60 bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Patient chart
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Shared chart for this patient. Doctors with access can view or edit notes.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {chartForBooking === "loading" ? (
                          <span className="text-sm text-muted-foreground">Checking...</span>
                        ) : chartForBooking ? (
                          <Button variant="outline" size="sm" className="rounded-lg" asChild>
                            <Link href={`/admin/charts/${chartForBooking.id}`}>
                              <FileText className="h-4 w-4 mr-2" />
                              Open chart
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                            disabled={creatingChart}
                            onClick={async () => {
                              if (!selectedBooking) return
                              setCreatingChart(true)
                              try {
                                const res = await fetch("/api/patient-charts", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  credentials: "include",
                                  body: JSON.stringify({ bookingId: selectedBooking.id }),
                                })
                                const data = await res.json()
                                if (data.success) {
                                  toast.success("Chart created")
                                  setChartForBooking({ id: data.data.id })
                                  router.push(`/admin/charts/${data.data.id}`)
                                } else {
                                  toast.error(data.error || "Failed to create chart")
                                }
                              } catch {
                                toast.error("Failed to create chart")
                              } finally {
                                setCreatingChart(false)
                              }
                            }}
                          >
                            {creatingChart ? "Creating..." : "Create chart"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p>Created: {format(new Date(selectedBooking.createdAt), "MMM dd, yyyy HH:mm:ss")}</p>
                    </div>
                    <div>
                      <p>Last Updated: {format(new Date(selectedBooking.updatedAt), "MMM dd, yyyy HH:mm:ss")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setSelectedBooking(null)
                  handleEdit(selectedBooking)
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Assessment Dialog */}
        {showAssessmentDialog && selectedBooking && assessmentType && (
          <Dialog
            open={showAssessmentDialog}
            onOpenChange={(open) => {
              if (!open) {
                setShowAssessmentDialog(false)
                setAssessmentType(null)
                setEditingAssessment(null)
              }
            }}
          >
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAssessment
                    ? `Edit ${assessmentType === "initial" ? "Initial" : "Follow-up"} Assessment`
                    : `Create ${assessmentType === "initial" ? "Initial" : "Follow-up"} Assessment`}
                </DialogTitle>
                <DialogDescription>
                  Patient: {selectedBooking.firstName} {selectedBooking.lastName}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {assessmentType === "initial" ? (
                  <InitialAssessmentForm
                    bookingId={selectedBooking.id}
                    initialData={editingAssessment}
                    onSuccess={() => {
                      setShowAssessmentDialog(false)
                      setAssessmentType(null)
                      setEditingAssessment(null)
                      if (selectedBooking) {
                        fetchAssessments(selectedBooking.id)
                      }
                    }}
                    onCancel={() => {
                      setShowAssessmentDialog(false)
                      setAssessmentType(null)
                      setEditingAssessment(null)
                    }}
                  />
                ) : (
                  <FollowupAssessmentForm
                    bookingId={selectedBooking.id}
                    initialData={editingAssessment}
                    onSuccess={() => {
                      setShowAssessmentDialog(false)
                      setAssessmentType(null)
                      setEditingAssessment(null)
                      if (selectedBooking) {
                        fetchAssessments(selectedBooking.id)
                      }
                    }}
                    onCancel={() => {
                      setShowAssessmentDialog(false)
                      setAssessmentType(null)
                      setEditingAssessment(null)
                    }}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* View Assessment Dialog */}
        {viewingAssessment && (
          <Dialog
            open={!!viewingAssessment}
            onOpenChange={() => setViewingAssessment(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {viewingAssessment.assessmentType === "initial"
                    ? "Initial Assessment"
                    : "Follow-up Assessment"}
                </DialogTitle>
                <DialogDescription>
                  Created {format(new Date(viewingAssessment.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-5 pr-1">
                {viewingAssessment.assessmentType === "initial" ? (
                  <div className="space-y-5">
                    {(viewingAssessment.reasonForReferral || viewingAssessment.hpi) && (
                      <Card className="border-2 border-border/60 overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                          <CardTitle className="text-sm font-semibold">Referral & history</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-4 space-y-4">
                          {viewingAssessment.reasonForReferral && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reason for Referral</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.reasonForReferral}</p>
                            </div>
                          )}
                          {viewingAssessment.hpi && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">HPI</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.hpi}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {(viewingAssessment.painDescription || viewingAssessment.painLevel || viewingAssessment.painType || viewingAssessment.whatMakesWorse || viewingAssessment.whatHelps) && (
                      <Card className="border-2 border-border/60 overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                          <CardTitle className="text-sm font-semibold">Pain</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-4 space-y-4">
                          {viewingAssessment.painDescription && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pain description</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.painDescription}</p>
                            </div>
                          )}
                          {(viewingAssessment.painLevel || viewingAssessment.painType) && (
                            <div className="grid grid-cols-2 gap-4">
                              {viewingAssessment.painLevel && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pain /10</Label>
                                  <p className="mt-1 text-sm">{viewingAssessment.painLevel}</p>
                                </div>
                              )}
                              {viewingAssessment.painType && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Intermittent / Constant</Label>
                                  <p className="mt-1 text-sm">{viewingAssessment.painType}</p>
                                </div>
                              )}
                            </div>
                          )}
                          {viewingAssessment.whatMakesWorse && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">What makes pain worse</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.whatMakesWorse}</p>
                            </div>
                          )}
                          {viewingAssessment.whatHelps && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">What helps</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.whatHelps}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {(viewingAssessment.pmhx || viewingAssessment.associatedImaging || viewingAssessment.baselineActivity) && (
                      <Card className="border-2 border-border/60 overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                          <CardTitle className="text-sm font-semibold">Medical history & imaging</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-4 space-y-4">
                          {viewingAssessment.pmhx && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">PMHx</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.pmhx}</p>
                            </div>
                          )}
                          {viewingAssessment.associatedImaging && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Associated / Relevant Imaging</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.associatedImaging}</p>
                            </div>
                          )}
                          {viewingAssessment.baselineActivity && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Baseline activity</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.baselineActivity}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {(viewingAssessment.observation || viewingAssessment.swellingCirculation || viewingAssessment.romInitial || viewingAssessment.strengthInitial || viewingAssessment.neuro || viewingAssessment.palpation || viewingAssessment.specialTests) && (
                      <Card className="border-2 border-border/60 overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                          <CardTitle className="text-sm font-semibold">Objective</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-4 space-y-4">
                          {viewingAssessment.observation && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Observation</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.observation}</p>
                            </div>
                          )}
                          {viewingAssessment.swellingCirculation && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Swelling / circulation</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.swellingCirculation}</p>
                            </div>
                          )}
                          {(viewingAssessment.romInitial || viewingAssessment.strengthInitial) && (
                            <div className="grid grid-cols-2 gap-4">
                              {viewingAssessment.romInitial && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ROM</Label>
                                  <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.romInitial}</p>
                                </div>
                              )}
                              {viewingAssessment.strengthInitial && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">RIM / Strength</Label>
                                  <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.strengthInitial}</p>
                                </div>
                              )}
                            </div>
                          )}
                          {viewingAssessment.neuro && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Neuro</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.neuro}</p>
                            </div>
                          )}
                          {viewingAssessment.palpation && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Palpation</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.palpation}</p>
                            </div>
                          )}
                          {viewingAssessment.specialTests && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Special tests / Outcome measures</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.specialTests}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {(viewingAssessment.clinicalImpression || viewingAssessment.goals) && (
                      <Card className="border-2 border-border/60 overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                          <CardTitle className="text-sm font-semibold">Clinical impression & goals</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-4 space-y-4">
                          {viewingAssessment.clinicalImpression && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Clinical impression</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.clinicalImpression}</p>
                            </div>
                          )}
                          {viewingAssessment.goals && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Goals</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.goals}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {(viewingAssessment.treatment ||
                      viewingAssessment.treatmentModality ||
                      viewingAssessment.treatmentROM ||
                      viewingAssessment.treatmentStrengthening ||
                      viewingAssessment.treatmentStretching ||
                      viewingAssessment.treatmentHEP ||
                      viewingAssessment.treatmentEducation ||
                      viewingAssessment.treatmentRestrictions ||
                      viewingAssessment.treatmentHandouts) && (
                      <Card className="border-2 border-border/60 overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                          <CardTitle className="text-sm font-semibold">Treatment</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-4 space-y-4">
                          {viewingAssessment.treatment && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Summary</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.treatment}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {viewingAssessment.treatmentModality && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Modality</Label>
                                <p className="mt-1 text-sm">{viewingAssessment.treatmentModality}</p>
                              </div>
                            )}
                            {viewingAssessment.treatmentROM && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ROM</Label>
                                <p className="mt-1 text-sm">{viewingAssessment.treatmentROM}</p>
                              </div>
                            )}
                            {viewingAssessment.treatmentStrengthening && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Strengthening</Label>
                                <p className="mt-1 text-sm">{viewingAssessment.treatmentStrengthening}</p>
                              </div>
                            )}
                            {viewingAssessment.treatmentStretching && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stretching</Label>
                                <p className="mt-1 text-sm">{viewingAssessment.treatmentStretching}</p>
                              </div>
                            )}
                            {viewingAssessment.treatmentRestrictions && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Restrictions</Label>
                                <p className="mt-1 text-sm">{viewingAssessment.treatmentRestrictions}</p>
                              </div>
                            )}
                          </div>
                          {viewingAssessment.treatmentHEP && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">HEP</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.treatmentHEP}</p>
                            </div>
                          )}
                          {viewingAssessment.treatmentEducation && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Education</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.treatmentEducation}</p>
                            </div>
                          )}
                          {viewingAssessment.treatmentHandouts && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Print outs given</Label>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{viewingAssessment.treatmentHandouts}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {viewingAssessment.plan && (
                      <Card className="border-2 border-border/60 overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                          <CardTitle className="text-sm font-semibold">Plan</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-4">
                          <p className="text-sm whitespace-pre-wrap">{viewingAssessment.plan}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Subjective */}
                    {(viewingAssessment.subjectivePain ||
                      viewingAssessment.subjectiveActivity ||
                      viewingAssessment.subjectiveExercises ||
                      viewingAssessment.subjectiveModalities ||
                      viewingAssessment.subjectiveMedications) && (
                      <div className="border-b pb-4">
                        <Label className="font-semibold text-base">Subjective</Label>
                        {viewingAssessment.subjectivePain && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Pain</Label>
                            <p className="mt-1">{viewingAssessment.subjectivePain}</p>
                          </div>
                        )}
                        {viewingAssessment.subjectiveActivity && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Activity</Label>
                            <p className="mt-1">{viewingAssessment.subjectiveActivity}</p>
                          </div>
                        )}
                        {viewingAssessment.subjectiveExercises && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Exercises</Label>
                            <p className="mt-1">{viewingAssessment.subjectiveExercises}</p>
                          </div>
                        )}
                        {viewingAssessment.subjectiveModalities && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Applying heat</Label>
                            <p className="mt-1">{viewingAssessment.subjectiveModalities}</p>
                          </div>
                        )}
                        {viewingAssessment.subjectiveMedications && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Medications</Label>
                            <p className="mt-1">{viewingAssessment.subjectiveMedications}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Objective */}
                    {(viewingAssessment.romFollowupFlexion ||
                      viewingAssessment.romFollowupExtension ||
                      viewingAssessment.romFollowupAbduction ||
                      viewingAssessment.romFollowupAdduction ||
                      viewingAssessment.romFollowupInternalRotation ||
                      viewingAssessment.romFollowupExternalRotation ||
                      viewingAssessment.strengthFollowupFlexion ||
                      viewingAssessment.strengthFollowupExtension ||
                      viewingAssessment.strengthFollowupAbduction ||
                      viewingAssessment.strengthFollowupAdduction ||
                      viewingAssessment.strengthFollowupInternalRotation ||
                      viewingAssessment.strengthFollowupExternalRotation ||
                      viewingAssessment.palpation ||
                      viewingAssessment.objectiveFindings) && (
                      <div className="border-b pb-4">
                        <Label className="font-semibold text-base">Objective</Label>
                        {(viewingAssessment.romFollowupFlexion ||
                          viewingAssessment.romFollowupExtension ||
                          viewingAssessment.romFollowupAbduction ||
                          viewingAssessment.romFollowupAdduction ||
                          viewingAssessment.romFollowupInternalRotation ||
                          viewingAssessment.romFollowupExternalRotation) && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Range of motion</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 text-sm">
                              {[
                                ["Flex", viewingAssessment.romFollowupFlexion],
                                ["Ext", viewingAssessment.romFollowupExtension],
                                ["Abd", viewingAssessment.romFollowupAbduction],
                                ["Add", viewingAssessment.romFollowupAdduction],
                                ["IR", viewingAssessment.romFollowupInternalRotation],
                                ["ER", viewingAssessment.romFollowupExternalRotation],
                              ].map(
                                ([label, val]) =>
                                  val ? (
                                    <p key={label}>
                                      {label}: {val}
                                    </p>
                                  ) : null
                              )}
                            </div>
                          </div>
                        )}
                        {(viewingAssessment.strengthFollowupFlexion ||
                          viewingAssessment.strengthFollowupExtension ||
                          viewingAssessment.strengthFollowupAbduction ||
                          viewingAssessment.strengthFollowupAdduction ||
                          viewingAssessment.strengthFollowupInternalRotation ||
                          viewingAssessment.strengthFollowupExternalRotation) && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">RIM / strength (/5)</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 text-sm">
                              {[
                                ["Flex", viewingAssessment.strengthFollowupFlexion],
                                ["Ext", viewingAssessment.strengthFollowupExtension],
                                ["Abd", viewingAssessment.strengthFollowupAbduction],
                                ["Add", viewingAssessment.strengthFollowupAdduction],
                                ["IR", viewingAssessment.strengthFollowupInternalRotation],
                                ["ER", viewingAssessment.strengthFollowupExternalRotation],
                              ].map(
                                ([label, val]) =>
                                  val ? (
                                    <p key={label}>
                                      {label}: {val}
                                    </p>
                                  ) : null
                              )}
                            </div>
                          </div>
                        )}
                        {viewingAssessment.palpation && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Tenderness</Label>
                            <p className="mt-1">{viewingAssessment.palpation}</p>
                          </div>
                        )}
                        {viewingAssessment.objectiveFindings && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Additional Objective Findings</Label>
                            <p className="mt-1">{viewingAssessment.objectiveFindings}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Assessment */}
                    {(viewingAssessment.assessmentModalities ||
                      viewingAssessment.assessmentROM ||
                      viewingAssessment.assessmentStrengthening ||
                      viewingAssessment.assessmentHEP ||
                      viewingAssessment.assessmentEducation ||
                      viewingAssessment.assessmentRestrictions ||
                      viewingAssessment.assessmentHandouts) && (
                      <div className="border-b pb-4">
                        <Label className="font-semibold text-base">Assessment</Label>
                        {viewingAssessment.assessmentModalities && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Modality</Label>
                            <p className="mt-1">{viewingAssessment.assessmentModalities}</p>
                          </div>
                        )}
                        {viewingAssessment.assessmentROM && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">ROM</Label>
                            <p className="mt-1">{viewingAssessment.assessmentROM}</p>
                          </div>
                        )}
                        {viewingAssessment.assessmentStrengthening && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Strengthening</Label>
                            <p className="mt-1">{viewingAssessment.assessmentStrengthening}</p>
                          </div>
                        )}
                        {viewingAssessment.assessmentHEP && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">HEP</Label>
                            <p className="mt-1">{viewingAssessment.assessmentHEP}</p>
                          </div>
                        )}
                        {viewingAssessment.assessmentEducation && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Education</Label>
                            <p className="mt-1">{viewingAssessment.assessmentEducation}</p>
                          </div>
                        )}
                        {viewingAssessment.assessmentRestrictions && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Restrictions</Label>
                            <p className="mt-1">{viewingAssessment.assessmentRestrictions}</p>
                          </div>
                        )}
                        {viewingAssessment.assessmentHandouts && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Print outs given to the patient</Label>
                            <p className="mt-1">{viewingAssessment.assessmentHandouts}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Plan */}
                    {(viewingAssessment.planAxStrength ||
                      viewingAssessment.planAxROM ||
                      viewingAssessment.planExerciseProgression ||
                      viewingAssessment.plan) && (
                      <div>
                        <Label className="font-semibold text-base">Plan</Label>
                        {viewingAssessment.planAxStrength && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Ax strength</Label>
                            <p className="mt-1">{viewingAssessment.planAxStrength}</p>
                          </div>
                        )}
                        {viewingAssessment.planAxROM && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Ax Range of Motion</Label>
                            <p className="mt-1">{viewingAssessment.planAxROM}</p>
                          </div>
                        )}
                        {viewingAssessment.planExerciseProgression && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Exercise progression</Label>
                            <p className="mt-1">{viewingAssessment.planExerciseProgression}</p>
                          </div>
                        )}
                        {viewingAssessment.plan && (
                          <div className="mt-2">
                            <Label className="font-semibold text-sm">Plan (general)</Label>
                            <p className="mt-1">{viewingAssessment.plan}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingAssessment(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setEditingAssessment(viewingAssessment)
                    setAssessmentType(
                      viewingAssessment.assessmentType as "initial" | "followup"
                    )
                    setViewingAssessment(null)
                    setShowAssessmentDialog(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Booking Dialog */}
        {editingBooking && (
          <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Booking</DialogTitle>
                <DialogDescription>Update booking information for {editingBooking.firstName} {editingBooking.lastName}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={editFormData.firstName || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={editFormData.lastName || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editFormData.email || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={editFormData.phoneNumber || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={editFormData.preferredDate || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, preferredDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={editFormData.endDate || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                      min={editFormData.preferredDate || undefined}
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editFormData.status || "pending"}
                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Full Address</Label>
                  <Textarea
                    value={editFormData.fullAddress || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, fullAddress: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Condition/Reason</Label>
                  <Textarea
                    value={editFormData.condition || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Medical History</Label>
                  <Textarea
                    value={editFormData.medicalHistory || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, medicalHistory: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editFormData.useDirectBilling || false}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, useDirectBilling: checked as boolean })}
                  />
                  <Label>Use Direct Billing</Label>
                </div>
                {editFormData.useDirectBilling && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Insurance Provider</Label>
                      <Input
                        value={editFormData.insuranceProvider || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, insuranceProvider: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Policy Number</Label>
                      <Input
                        value={editFormData.policyNumber || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, policyNumber: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingBooking(null)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {deletingBooking && (
          <AlertDialog open={!!deletingBooking} onOpenChange={() => setDeletingBooking(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the booking for{" "}
                  <strong>
                    {deletingBooking.firstName} {deletingBooking.lastName}
                  </strong>
                  .
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
