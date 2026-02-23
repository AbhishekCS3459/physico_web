"use client"

import { ChartEditor } from "@/components/chart-editor"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  Copy,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Share2,
  User,
  Users,
  History,
  Home,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

interface ChartData {
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
    phoneNumber: string
    dateOfBirth: string | null
    condition: string | null
    medicalHistory: string | null
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
  accessList: {
    adminId: string
    permission: string
    admin: { id: string; email: string; name: string | null }
  }[]
  pendingInvitations?: {
    id: string
    inviteeId: string
    permission: string
    invitee: { id: string; email: string; name: string | null }
    invitedBy: { id: string; email: string; name: string | null }
    createdAt: string
  }[]
  myPermission: "view" | "edit"
}

interface TimelineEvent {
  id: string
  action: string
  createdAt: string
  admin: { id: string; email: string; name: string | null } | null
}

interface AdminOption {
  id: string
  email: string
  name: string | null
}

export default function ChartDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [chart, setChart] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [showShare, setShowShare] = useState(false)
  const [admins, setAdmins] = useState<AdminOption[]>([])
  const [shareAdminId, setShareAdminId] = useState("")
  const [shareEmail, setShareEmail] = useState("")
  const [sharePermission, setSharePermission] = useState<"view" | "edit">("view")
  const [addingShare, setAddingShare] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const fetchChart = useCallback(async () => {
    try {
      const res = await fetch(`/api/patient-charts/${id}`, { credentials: "include" })
      const data = await res.json()
      if (data.success) {
        setChart(data.data)
      } else {
        if (res.status === 403 || res.status === 404) {
          toast.error(data.error || "Access denied")
          router.push("/admin/charts")
        } else {
          toast.error(data.error || "Failed to load chart")
        }
      }
    } catch {
      toast.error("Failed to load chart")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  const fetchTimeline = useCallback(async () => {
    try {
      const res = await fetch(`/api/patient-charts/${id}/timeline`, { credentials: "include" })
      const data = await res.json()
      if (data.success) setTimeline(data.data)
    } catch {
      // ignore
    }
  }, [id])

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) router.push("/login")
      })
      .catch(() => router.push("/login"))
  }, [router])

  useEffect(() => {
    fetchChart()
  }, [fetchChart])

  useEffect(() => {
    if (chart) fetchTimeline()
  }, [chart, fetchTimeline])

  const handleSave = useCallback(
    async (content: string) => {
      if (!chart || chart.myPermission !== "edit") return
      setSaving(true)
      try {
        const res = await fetch(`/api/patient-charts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success("Chart saved")
          setChart((prev) =>
            prev ? { ...prev, content: data.data.content, updatedAt: data.data.updatedAt } : null
          )
          fetchTimeline()
        } else {
          toast.error(data.error || "Failed to save")
        }
      } catch {
        toast.error("Failed to save")
      } finally {
        setSaving(false)
      }
    },
    [id, chart, fetchTimeline]
  )

  const chartLink =
    typeof window !== "undefined" ? `${window.location.origin}/admin/charts/${id}` : ""

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(chartLink)
      setLinkCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const openShare = () => {
    setShowShare(true)
    setShareAdminId("")
    setShareEmail("")
    setSharePermission("view")
    fetch("/api/admins", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAdmins(d.data)
      })
  }

  const addShare = async () => {
    if (!shareAdminId && !shareEmail.trim()) {
      toast.error("Enter an email or select a doctor")
      return
    }
    setAddingShare(true)
    try {
      const body = shareEmail.trim()
        ? { email: shareEmail.trim().toLowerCase(), permission: sharePermission }
        : { adminId: shareAdminId, permission: sharePermission }
      const res = await fetch(`/api/patient-charts/${id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        if (data.invitation) {
          toast.success("Invitation sent — they can accept from their chart list")
        } else {
          toast.success("Access added")
        }
        setShareEmail("")
        setShareAdminId("")
        fetchChart()
      } else {
        toast.error(data.error || "Failed to add access")
      }
    } catch {
      toast.error("Failed to add access")
    } finally {
      setAddingShare(false)
    }
  }

  const revokeAccess = async (adminId: string) => {
    try {
      const res = await fetch(`/api/patient-charts/${id}/access/${adminId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Access revoked")
        fetchChart()
      } else {
        toast.error(data.error || "Failed to revoke")
      }
    } catch {
      toast.error("Failed to revoke")
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/patient-charts/${id}/invitation/${invitationId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Invitation cancelled")
        fetchChart()
      } else {
        toast.error(data.error || "Failed to cancel")
      }
    } catch {
      toast.error("Failed to cancel invitation")
    }
  }

  if (loading || !chart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/charts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {chart.booking
                  ? `${chart.booking.firstName} ${chart.booking.lastName}`
                  : chart.patient
                    ? `${chart.patient.firstName} ${chart.patient.lastName ?? ""}`.trim()
                    : "Patient"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Patient chart · {chart.myPermission === "edit" ? "You can edit" : "View only"}
              </p>
            </div>
            <Badge variant={chart.myPermission === "edit" ? "default" : "secondary"}>
              {chart.myPermission === "edit" ? "Edit access" : "View only"}
            </Badge>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-2" />
              {linkCopied ? "Copied!" : "Copy link"}
            </Button>
            {chart.myPermission === "edit" && (
              <Button variant="outline" onClick={openShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/admin">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/charts">
                <RefreshCw className="h-4 w-4 mr-2" />
                Back to charts
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient info sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient information
                </CardTitle>
                <CardDescription>
                  {chart.booking ? "From booking" : "From patient record"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {chart.booking ? (
                  <>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        {chart.booking.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        {chart.booking.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Appointment</p>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        {chart.booking.endDate
                          ? `${format(new Date(chart.booking.preferredDate), "MMM d, yyyy")} – ${format(new Date(chart.booking.endDate), "MMM d, yyyy")}`
                          : format(new Date(chart.booking.preferredDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    {chart.booking.dateOfBirth && (
                      <div>
                        <p className="text-muted-foreground">Date of birth</p>
                        <p>{format(new Date(chart.booking.dateOfBirth), "MMM d, yyyy")}</p>
                      </div>
                    )}
                    {chart.booking.condition && (
                      <div>
                        <p className="text-muted-foreground">Condition</p>
                        <p>{chart.booking.condition}</p>
                      </div>
                    )}
                    {chart.booking.medicalHistory && (
                      <div>
                        <p className="text-muted-foreground">Medical history</p>
                        <p className="whitespace-pre-wrap">{chart.booking.medicalHistory}</p>
                      </div>
                    )}
                  </>
                ) : chart.patient ? (
                  <>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        {chart.patient.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        {chart.patient.phoneNumber || "—"}
                      </p>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Timeline
                </CardTitle>
                <CardDescription>Chart activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[240px] pr-4">
                  <div className="space-y-3">
                    {timeline.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No activity yet.</p>
                    ) : (
                      timeline.map((event) => (
                        <div
                          key={event.id}
                          className="flex gap-2 text-sm border-l-2 border-primary/30 pl-3 py-1"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium capitalize">{event.action}</p>
                            <p className="text-muted-foreground text-xs">
                              {event.admin?.name || event.admin?.email || "Unknown"} ·{" "}
                              {format(new Date(event.createdAt), "MMM d, HH:mm")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Chart notes</CardTitle>
                <CardDescription>
                  {chart.myPermission === "edit"
                    ? "Add and edit patient information. Changes are shared with doctors who have access."
                    : "You have view-only access. Ask the chart owner to grant edit access."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartEditor
                  initialContent={chart.content}
                  editable={chart.myPermission === "edit"}
                  onSave={chart.myPermission === "edit" ? handleSave : undefined}
                />
                {saving && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Who has access */}
            <Card className="border-2 mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Access
                </CardTitle>
                <CardDescription>Doctors with access to this chart</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {chart.createdBy && (
                    <li className="flex items-center justify-between">
                      <span>
                        {chart.createdBy.name || chart.createdBy.email}
                        <Badge variant="default" className="ml-2 text-xs">
                          Owner (edit)
                        </Badge>
                      </span>
                    </li>
                  )}
                  {chart.accessList.map((a) => (
                    <li key={a.adminId} className="flex items-center justify-between">
                      <span>
                        {a.admin.name || a.admin.email}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {a.permission}
                        </Badge>
                      </span>
                      {chart.myPermission === "edit" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => revokeAccess(a.adminId)}
                        >
                          Revoke
                        </Button>
                      )}
                    </li>
                  ))}
                  {(chart.pendingInvitations ?? []).map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between">
                      <span>
                        {inv.invitee.name || inv.invitee.email}
                        <Badge variant="outline" className="ml-2 text-xs">
                          Pending ({inv.permission})
                        </Badge>
                      </span>
                      {chart.myPermission === "edit" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => cancelInvitation(inv.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </li>
                  ))}
                  {(!chart.createdBy || chart.accessList.length === 0) && (chart.pendingInvitations?.length ?? 0) === 0 && (
                    <li className="text-muted-foreground">Only the owner has access.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share chart</DialogTitle>
            <DialogDescription>
              Send an invitation by email or select a staff/admin. They can accept from their chart list to get view or edit access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {((chart?.accessList?.length ?? 0) > 0 || (chart?.pendingInvitations?.length ?? 0) > 0) && (
              <div className="space-y-2">
                <Label>Current access</Label>
                <ul className="text-sm space-y-1 rounded border p-2 bg-muted/30">
                  {chart?.createdBy && (
                    <li className="flex items-center gap-2">
                      {chart.createdBy.name || chart.createdBy.email}
                      <Badge variant="default" className="text-xs">Owner</Badge>
                    </li>
                  )}
                  {chart?.accessList?.map((a) => (
                    <li key={a.adminId} className="flex items-center gap-2">
                      {a.admin.name || a.admin.email}
                      <Badge variant="secondary" className="text-xs">{a.permission}</Badge>
                    </li>
                  ))}
                </ul>
                {(chart?.pendingInvitations?.length ?? 0) > 0 && (
                  <>
                    <Label className="pt-2 block">Pending invitations</Label>
                    <ul className="text-sm space-y-1 rounded border p-2 bg-muted/30">
                      {chart?.pendingInvitations?.map((inv) => (
                        <li key={inv.id} className="flex items-center justify-between gap-2">
                          <span>
                            {inv.invitee.name || inv.invitee.email}
                            <Badge variant="outline" className="ml-2 text-xs">Pending ({inv.permission})</Badge>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive h-7"
                            onClick={() => cancelInvitation(inv.id)}
                          >
                            Cancel
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Email (staff/admin to invite)</Label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={shareEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setShareEmail(e.target.value)
                  setShareAdminId("")
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">Or select from list:</div>
            <div className="space-y-2">
              <Label>Doctor / Staff</Label>
              <Select
                value={shareAdminId}
                onValueChange={(v) => {
                  setShareAdminId(v)
                  setShareEmail("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {admins
                    .filter(
                      (a) =>
                        a.id !== chart?.createdBy?.id &&
                        !chart?.accessList?.some((x) => x.adminId === a.id) &&
                        !chart?.pendingInvitations?.some((inv) => inv.inviteeId === a.id)
                    )
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name || a.email} ({a.email})
                      </SelectItem>
                    ))}
                  {admins.length === 0 && (
                    <SelectItem value="_none" disabled>
                      No other staff
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permission</Label>
              <Select
                value={sharePermission}
                onValueChange={(v) => setSharePermission(v as "view" | "edit")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border-t pt-4 space-y-2">
              <Label>Chart link (share with people who have access)</Label>
              <div className="flex gap-2">
                <Input readOnly value={chartLink} className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={copyLink} title="Copy link">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with view/edit access who is logged in with the allowed email will see this chart in their list.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShare(false)}>
              Cancel
            </Button>
            <Button
              onClick={addShare}
              disabled={(!shareAdminId && !shareEmail.trim()) || addingShare}
            >
              {addingShare ? "Sending..." : "Send invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
