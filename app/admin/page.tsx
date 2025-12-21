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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

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
  const [adminInfo, setAdminInfo] = useState<{ email: string; name?: string } | null>(null)

  useEffect(() => {
    // Check authentication
    fetch("/api/auth/me", {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login")
        } else {
          setAdminInfo(data.admin)
        }
      })
      .catch(() => {
        router.push("/login")
      })
  }, [router])

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
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Logged in as: {adminInfo.email}
              </p>
            )}
          </div>
          <div className="flex gap-2">
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
