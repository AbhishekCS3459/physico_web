"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
    Calendar,
    CalendarIcon,
    Clock,
    LogOut,
    MapPin,
    Phone,
    RefreshCw,
    User,
    X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

interface TherapyBooking {
  id: string
  serviceType: string
  appointmentType: string
  preferredDate: string
  preferredTime: string
  serviceLocation: string
  fullAddress: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<TherapyBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<{ email: string; firstName?: string; lastName?: string } | null>(null)
  const [reschedulingBooking, setReschedulingBooking] = useState<TherapyBooking | null>(null)
  const [newDate, setNewDate] = useState<string>("")
  const [newTime, setNewTime] = useState<string>("")
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [cancellingBooking, setCancellingBooking] = useState<TherapyBooking | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
  ]

  useEffect(() => {
    // Check authentication
    fetch("/api/auth/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/user-login")
        } else {
          setUserInfo(data.user)
          fetchBookings()
        }
      })
      .catch(() => {
        router.push("/user-login")
      })
  }, [router])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/bookings")
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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/user/logout", {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Logged out successfully")
        router.push("/user-login")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    }
  }

  const handleReschedule = async () => {
    if (!reschedulingBooking || !newDate || !newTime) {
      toast.error("Please select both date and time")
      return
    }

    setIsRescheduling(true)
    try {
      const response = await fetch(`/api/bookings/${reschedulingBooking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferredDate: newDate,
          preferredTime: newTime,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Booking rescheduled successfully!")
        setReschedulingBooking(null)
        setNewDate("")
        setNewTime("")
        fetchBookings()
      } else {
        toast.error(data.error || "Failed to reschedule booking")
      }
    } catch (error) {
      console.error("Error rescheduling booking:", error)
      toast.error("Failed to reschedule booking")
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleCancel = async () => {
    if (!cancellingBooking) return

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${cancellingBooking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Booking cancelled successfully")
        setCancellingBooking(null)
        fetchBookings()
      } else {
        toast.error(data.error || "Failed to cancel booking")
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
    } finally {
      setIsCancelling(false)
    }
  }

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
        return <Calendar className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      case "completed":
        return <Calendar className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Bookings
            </h1>
            <p className="text-muted-foreground text-lg">Manage your therapy appointments</p>
            {userInfo && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                {userInfo.firstName && userInfo.lastName
                  ? `${userInfo.firstName} ${userInfo.lastName}`
                  : userInfo.email}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/book")}>
              Book New Appointment
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground text-lg">Loading bookings...</p>
              </div>
            </CardContent>
          </Card>
        ) : bookings.length === 0 ? (
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mb-4">No bookings found</p>
                <Button onClick={() => router.push("/book")}>Book Your First Appointment</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="border-2 hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold">
                          {booking.firstName} {booking.lastName}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(booking.preferredDate), "MMM dd, yyyy")} at {booking.preferredTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="capitalize">{booking.serviceLocation.replace("-", " ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{booking.phoneNumber}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium">Service: <span className="capitalize text-muted-foreground">{booking.serviceType.replace("-", " ")}</span></p>
                        <p className="text-sm font-medium">Type: <span className="capitalize text-muted-foreground">{booking.appointmentType.replace("-", " ")}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {booking.status !== "cancelled" && booking.status !== "completed" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReschedulingBooking(booking)
                              setNewDate(format(new Date(booking.preferredDate), "yyyy-MM-dd"))
                              setNewTime(booking.preferredTime)
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCancellingBooking(booking)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reschedule Dialog */}
        {reschedulingBooking && (
          <Dialog open={!!reschedulingBooking} onOpenChange={() => setReschedulingBooking(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Reschedule Booking</DialogTitle>
                <DialogDescription>
                  Select a new date and time for your appointment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">New Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newDate ? format(new Date(newDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={newDate ? new Date(newDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setNewDate(format(date, "yyyy-MM-dd"))
                          }
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">New Time</label>
                  <Select value={newTime} onValueChange={setNewTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReschedulingBooking(null)} disabled={isRescheduling}>
                  Cancel
                </Button>
                <Button onClick={handleReschedule} disabled={isRescheduling}>
                  {isRescheduling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Rescheduling...
                    </>
                  ) : (
                    "Reschedule"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Cancel Confirmation Dialog */}
        {cancellingBooking && (
          <Dialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Booking</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Date:</strong> {format(new Date(cancellingBooking.preferredDate), "MMM dd, yyyy")} at {cancellingBooking.preferredTime}
                </p>
                <p className="text-sm mt-2">
                  <strong>Service:</strong> {cancellingBooking.serviceType.replace("-", " ")}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancellingBooking(null)} disabled={isCancelling}>
                  Keep Booking
                </Button>
                <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
                  {isCancelling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Booking"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

