"use client"

import { ChartEditor } from "@/components/chart-editor"
import { ChartTemplateForm } from "@/components/chart-template-form"
import { DynamicFormFiller, type DynamicFormFillerHandle } from "@/components/dynamic-form-filler"
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
  Eraser,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Share2,
  Trash2,
  User,
  Users,
  History,
  Home,
  FileCheck,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import { NotificationsBell } from "@/components/notifications-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import { resolvePatientDisplayName } from "@/lib/consent-copy"
import { getDefaultChartNotesAfterConsentContentString } from "@/lib/chart-template"
import { getChartWorkflowPhase } from "@/lib/chart-workflow"
import { CONSENT_ONLY_FORM_SCHEMA_JSON } from "@/lib/form-schema"

const CONSENT_ASKED_OPTION =
  "Consent was discussed and the patient was asked to proceed (questions answered)"

interface ChartData {
  id: string
  bookingId: string | null
  patientId: string | null
  formTemplateId: string | null
  formTemplate: { id: string; name: string; schema: string } | null
  content: string | null
  consentContent: string | null
  consentCompletedAt: string | null
  initialAssessmentCompletedAt: string | null
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
  pendingRequests?: {
    id: string
    requestedById: string
    permission: string
    requestedBy: { id: string; email: string; name: string | null }
    createdAt: string
  }[]
  myPermission: "view" | "edit"
  isOwner?: boolean
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
  const [accessError, setAccessError] = useState<"none" | "forbidden" | "not_found">("none")
  const [requestAccessPermission, setRequestAccessPermission] = useState<"view" | "edit">("view")
  const [requestingAccess, setRequestingAccess] = useState(false)
  const [requestAccessSent, setRequestAccessSent] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [clearingChart, setClearingChart] = useState(false)
  const [deletingChart, setDeletingChart] = useState(false)
  const [chartViewMode, setChartViewMode] = useState<"form" | "edit">("form")
  const [formTemplates, setFormTemplates] = useState<{ id: string; name: string }[]>([])
  const [switchingTemplate, setSwitchingTemplate] = useState(false)
  const [savingConsent, setSavingConsent] = useState(false)
  const [submittingConsent, setSubmittingConsent] = useState(false)
  const consentFormRef = useRef<DynamicFormFillerHandle>(null)

  const fetchChart = useCallback(async () => {
    try {
      setAccessError("none")
      const res = await fetch(`/api/patient-charts/${id}`, { credentials: "include" })
      const data = await res.json()
      if (data.success) {
        setChart(data.data)
      } else {
        if (res.status === 403) {
          setAccessError("forbidden")
          setChart(null)
          toast.error(data.error || "Access denied")
        } else if (res.status === 404) {
          setAccessError("not_found")
          setChart(null)
          toast.error("Chart not found")
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

  const chartPatientDisplayName = useMemo(() => {
    if (!chart) return ""
    return resolvePatientDisplayName({
      patient: chart.patient,
      booking: chart.booking,
    })
  }, [chart])

  const workflowPhase = useMemo(() => (chart ? getChartWorkflowPhase(chart) : "active"), [chart])

  const handleSaveConsentDraft = useCallback(
    async (content: string): Promise<boolean> => {
      if (!chart || chart.myPermission !== "edit") return false
      setSavingConsent(true)
      try {
        const res = await fetch(`/api/patient-charts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ consentContent: content }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success("Consent draft saved")
          setChart((prev) =>
            prev
              ? {
                  ...prev,
                  consentContent: data.data.consentContent,
                  consentCompletedAt: data.data.consentCompletedAt ?? prev.consentCompletedAt,
                  updatedAt: data.data.updatedAt,
                }
              : null,
          )
          fetchTimeline()
          return true
        }
        toast.error(data.error || "Failed to save consent")
        return false
      } catch {
        toast.error("Failed to save consent")
        return false
      } finally {
        setSavingConsent(false)
      }
    },
    [id, chart, fetchTimeline],
  )

  const handleSubmitConsent = useCallback(async () => {
    if (!chart || chart.myPermission !== "edit") return
    const json = consentFormRef.current?.serialize() ?? chart.consentContent ?? "{}"
    try {
      const parsed = JSON.parse(json) as { consent_asked?: unknown }
      const arr = parsed.consent_asked
      if (
        !Array.isArray(arr) ||
        !arr.some((s) => String(s).toLowerCase() === CONSENT_ASKED_OPTION.toLowerCase())
      ) {
        toast.error("Please confirm consent was discussed using the checkbox.")
        return
      }
    } catch {
      toast.error("Could not read the consent form.")
      return
    }
    setSubmittingConsent(true)
    try {
      const res = await fetch(`/api/patient-charts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ consentContent: json, completeConsent: true }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Consent submitted — you can complete the initial assessment next.")
        await fetchChart()
        fetchTimeline()
      } else {
        toast.error(data.error || "Failed to submit consent")
      }
    } catch {
      toast.error("Failed to submit consent")
    } finally {
      setSubmittingConsent(false)
    }
  }, [chart, fetchChart, fetchTimeline, id])

  useEffect(() => {
    fetch("/api/form-templates", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFormTemplates(data.data.map((t: { id: string; name: string }) => ({ id: t.id, name: t.name })))
      })
      .catch(() => {})
  }, [])

  const handleSave = useCallback(
    async (content: string): Promise<boolean> => {
      if (!chart || chart.myPermission !== "edit") return false
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
            prev
              ? {
                  ...prev,
                  content: data.data.content,
                  updatedAt: data.data.updatedAt,
                  formTemplateId: data.data.formTemplateId ?? prev.formTemplateId,
                  initialAssessmentCompletedAt:
                    data.data.initialAssessmentCompletedAt ?? prev.initialAssessmentCompletedAt,
                  consentContent: data.data.consentContent ?? prev.consentContent,
                  consentCompletedAt: data.data.consentCompletedAt ?? prev.consentCompletedAt,
                }
              : null,
          )
          fetchTimeline()
          return true
        } else {
          toast.error(data.error || "Failed to save")
          return false
        }
      } catch {
        toast.error("Failed to save")
        return false
      } finally {
        setSaving(false)
      }
    },
    [id, chart, fetchTimeline]
  )

  const switchFormTemplate = useCallback(
    async (templateId: string | null) => {
      if (!chart || chart.myPermission !== "edit") return
      setSwitchingTemplate(true)
      try {
        const content = templateId
          ? "{}"
          : getDefaultChartNotesAfterConsentContentString(
              resolvePatientDisplayName({
                patient: chart.patient,
                booking: chart.booking,
              }),
            )
        const res = await fetch(`/api/patient-charts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ formTemplateId: templateId, content }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(templateId ? "Switched to form template" : "Switched to default notes")
          fetchChart()
        } else {
          toast.error(data.error || "Failed to switch template")
        }
      } catch {
        toast.error("Failed to switch template")
      } finally {
        setSwitchingTemplate(false)
      }
    },
    [id, chart, fetchChart]
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
        toast.success("Access revoked — they will be notified")
        fetchChart()
      } else {
        toast.error(data.error || "Failed to revoke")
      }
    } catch {
      toast.error("Failed to revoke")
    }
  }

  const updateAccessPermission = async (adminId: string, permission: "view" | "edit") => {
    try {
      const res = await fetch(`/api/patient-charts/${id}/access/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permission }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Permission updated")
        fetchChart()
      } else {
        toast.error(data.error || "Failed to update")
      }
    } catch {
      toast.error("Failed to update")
    }
  }

  const respondToRequest = async (requestId: string, action: "grant" | "deny") => {
    try {
      const res = await fetch(`/api/patient-charts/${id}/access-request/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(action === "grant" ? "Access granted — they will be notified and can see all notes" : "Request denied")
        fetchChart()
      } else {
        toast.error(data.error || "Failed to respond")
      }
    } catch {
      toast.error("Failed to respond")
    }
  }

  const requestAccess = async () => {
    setRequestingAccess(true)
    try {
      const res = await fetch(`/api/patient-charts/${id}/request-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permission: requestAccessPermission }),
      })
      const data = await res.json()
      if (data.success) {
        setRequestAccessSent(true)
        toast.success("Request sent — the chart owner will be notified and can grant access")
      } else {
        toast.error(data.error || "Failed to request access")
      }
    } catch {
      toast.error("Failed to request access")
    } finally {
      setRequestingAccess(false)
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

  const handleClearChart = async () => {
    setClearingChart(true)
    try {
      const res = await fetch(`/api/patient-charts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ clear: true }),
      })
      const data = await res.json()
      if (data.success) {
        setShowClearConfirm(false)
        toast.success("Chart cleared — reset to default notes")
        setChart((prev) =>
          prev
            ? {
                ...prev,
                content: data.data.content,
                updatedAt: data.data.updatedAt,
              }
            : null
        )
        fetchTimeline()
      } else {
        toast.error(data.error || "Failed to clear chart")
      }
    } catch {
      toast.error("Failed to clear chart")
    } finally {
      setClearingChart(false)
    }
  }

  const handleDeleteChart = async () => {
    setDeletingChart(true)
    try {
      const res = await fetch(`/api/patient-charts/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        setShowDeleteConfirm(false)
        toast.success("Chart deleted")
        router.push("/admin/charts")
      } else {
        toast.error(data.error || "Failed to delete chart")
      }
    } catch {
      toast.error("Failed to delete chart")
    } finally {
      setDeletingChart(false)
    }
  }

  if (loading || (!chart && accessError === "none")) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (accessError === "forbidden") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/charts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <ThemeToggle />
          </div>
          <Card className="max-w-md border-2">
            <CardHeader>
              <CardTitle>You don&apos;t have access to this chart</CardTitle>
              <CardDescription>
                Request view or edit access. The chart owner will be notified and can grant you access. Once granted, you can see all notes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requestAccessSent ? (
                <p className="text-sm text-primary font-medium">Request sent. You will be notified when access is granted.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Access type</Label>
                    <Select
                      value={requestAccessPermission}
                      onValueChange={(v) => setRequestAccessPermission(v as "view" | "edit")}
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
                  <Button onClick={requestAccess} disabled={requestingAccess} className="w-full">
                    {requestingAccess ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Request access"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!chart) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-6">
      <div className="container max-w-[1400px] mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="shrink-0 rounded-lg" asChild>
              <Link href="/admin/charts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">
                {chart.booking
                  ? `${chart.booking.firstName} ${chart.booking.lastName}`
                  : chart.patient
                    ? `${chart.patient.firstName} ${chart.patient.lastName ?? ""}`.trim()
                    : "Patient"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Patient chart · {chart.myPermission === "edit" ? "You can edit" : "View only"}
              </p>
            </div>
            <Badge variant={chart.myPermission === "edit" ? "default" : "secondary"} className="shrink-0">
              {chart.myPermission === "edit" ? "Edit access" : "View only"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <ThemeToggle />
            <NotificationsBell />
            <Button variant="outline" size="sm" className="rounded-lg" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-2" />
              {linkCopied ? "Copied!" : "Copy link"}
            </Button>
            {chart.myPermission === "edit" && (
              <Button variant="outline" size="sm" className="rounded-lg" onClick={openShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            {chart.myPermission === "edit" && (
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setShowClearConfirm(true)}>
                <Eraser className="h-4 w-4 mr-2" />
                Clear chart
              </Button>
            )}
            {chart.isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete chart
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <Link href="/admin">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <Link href="/admin/charts">
                <RefreshCw className="h-4 w-4 mr-2" />
                Back to charts
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Patient info sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="rounded-xl border border-border/80 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30 border-b border-border/60">
                <CardTitle className="text-base flex items-center gap-2 font-semibold">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Patient information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {chart.booking ? "From booking" : "From patient record"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
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
            <Card className="rounded-xl border border-border/80 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30 border-b border-border/60">
                <CardTitle className="text-base flex items-center gap-2 font-semibold">
                  <History className="h-4 w-4 text-muted-foreground" />
                  Timeline
                </CardTitle>
                <CardDescription className="text-muted-foreground">Chart activity</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[240px] pr-4">
                  <div className="space-y-3">
                    {timeline.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No activity yet.</p>
                    ) : (
                      timeline.map((event) => (
                        <div
                          key={event.id}
                          className="flex gap-2 text-sm border-l-2 border-primary/40 pl-3 py-1.5"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium capitalize text-foreground">{event.action}</p>
                            <p className="text-muted-foreground text-xs mt-0.5">
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

          {/* Editor - wider column for chart notes */}
          <div className="lg:col-span-3">
            {workflowPhase === "consent" && (
              <Card className="rounded-xl border border-border/80 shadow-sm overflow-hidden mb-6">
                <CardHeader className="pb-3 bg-muted/30 border-b border-border/60">
                  <CardTitle className="text-lg font-semibold tracking-tight">Step 1: Consent</CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Complete consent and submit here first. The initial assessment opens next and only needs to be done
                    once for this chart; after that you can record follow-up visits without repeating consent or the
                    initial assessment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <DynamicFormFiller
                    ref={consentFormRef}
                    key={`${chart.id}-consent-${chart.consentContent ?? "new"}`}
                    schemaJson={CONSENT_ONLY_FORM_SCHEMA_JSON}
                    initialContent={chart.consentContent}
                    editable={chart.myPermission === "edit"}
                    patientDisplayName={chartPatientDisplayName}
                    onSave={chart.myPermission === "edit" ? handleSaveConsentDraft : undefined}
                    saving={savingConsent}
                    enableAutoSave={false}
                  />
                  {chart.myPermission === "edit" && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSubmitConsent}
                        disabled={submittingConsent || savingConsent}
                        className="rounded-lg shadow-sm"
                      >
                        {submittingConsent ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Submitting…
                          </>
                        ) : (
                          "Submit consent and continue"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {(workflowPhase === "initial" || workflowPhase === "active") && (
            <Card className="rounded-xl border border-border/80 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30 border-b border-border/60">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-semibold tracking-tight">Chart notes</CardTitle>
                    <div className="text-muted-foreground mt-1 space-y-2 text-sm">
                      {workflowPhase === "initial" && chart.myPermission === "edit" && (
                        <p className="text-amber-800 dark:text-amber-200/90 font-medium">
                          Step 2: Initial assessment — the first save completes this step. You can then add subsequent
                          visits and switch templates as needed.
                        </p>
                      )}
                      {workflowPhase === "active" && (
                        <p className="text-xs">
                          Consent and initial assessment are on file. Use the template dropdown for follow-up forms or
                          continue in chart notes.
                        </p>
                      )}
                      <p>
                        {chart.formTemplate
                          ? `Using form: ${chart.formTemplate.name}. Data is saved automatically.`
                          : chart.myPermission === "edit"
                            ? "Select treatment options and add notes below each section. Changes are shared with doctors who have access."
                            : "You have view-only access. Ask the chart owner to grant edit access."}
                      </p>
                    </div>
                    {chart.myPermission === "edit" && (
                      <div className="mt-2 flex items-center gap-2">
                        <Select
                          value={chart.formTemplateId ?? "default"}
                          onValueChange={(v) => {
                            if (v === "default") switchFormTemplate(null)
                            else switchFormTemplate(v)
                          }}
                          disabled={switchingTemplate}
                        >
                          <SelectTrigger className="w-[220px] h-8 text-sm">
                            <SelectValue placeholder="Form template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default (chart notes)</SelectItem>
                            {formTemplates.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Link href="/admin/charts/forms" className="text-xs text-muted-foreground hover:underline">
                          Manage templates
                        </Link>
                      </div>
                    )}
                  </div>
                  {!chart.formTemplate && (
                    <div className="flex rounded-lg border border-border/80 bg-background/80 p-1 shadow-inner">
                      <Button
                        type="button"
                        variant={chartViewMode === "form" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 gap-1.5 rounded-md"
                        onClick={() => setChartViewMode("form")}
                      >
                        <FileCheck className="h-4 w-4" />
                        Form
                      </Button>
                      <Button
                        type="button"
                        variant={chartViewMode === "edit" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 gap-1.5 rounded-md"
                        onClick={() => setChartViewMode("edit")}
                      >
                        <FileText className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {chart.formTemplate ? (
                  <div className="p-5">
                    <DynamicFormFiller
                      key={`${chart.id}-${chart.updatedAt}`}
                      schemaJson={chart.formTemplate.schema}
                      initialContent={chart.content}
                      editable={chart.myPermission === "edit"}
                      patientDisplayName={chartPatientDisplayName}
                      onSave={chart.myPermission === "edit" ? handleSave : undefined}
                      saving={saving}
                      onAfterDraftSave={
                        chart.myPermission === "edit"
                          ? () => {
                              toast.success("Draft saved. You can continue editing from the charts list.")
                              router.push("/admin/charts")
                            }
                          : undefined
                      }
                    />
                  </div>
                ) : chartViewMode === "form" ? (
                  <ChartTemplateForm
                    key={`${chart.id}-${chart.updatedAt}`}
                    initialContent={
                      chart.content && chart.content.trim() !== ""
                        ? chart.content
                        : getDefaultChartNotesAfterConsentContentString(chartPatientDisplayName)
                    }
                    patientDisplayName={chartPatientDisplayName}
                    editable={chart.myPermission === "edit"}
                    onSave={chart.myPermission === "edit" ? handleSave : undefined}
                    saving={saving}
                    onAfterDraftSave={
                      chart.myPermission === "edit"
                        ? () => {
                            toast.success("Draft saved. You can continue editing from the charts list.")
                            router.push("/admin/charts")
                          }
                        : undefined
                    }
                  />
                ) : (
                  <ChartEditor
                    key={`${chart.id}-${chart.updatedAt}`}
                    initialContent={
                      chart.content && chart.content.trim() !== ""
                        ? chart.content
                        : getDefaultChartNotesAfterConsentContentString(chartPatientDisplayName)
                    }
                    patientDisplayName={chartPatientDisplayName}
                    editable={chart.myPermission === "edit"}
                    onSave={chart.myPermission === "edit" ? handleSave : undefined}
                    saving={saving}
                    onAfterDraftSave={
                      chart.myPermission === "edit"
                        ? () => {
                            toast.success("Draft saved. You can continue editing from the charts list.")
                            router.push("/admin/charts")
                          }
                        : undefined
                    }
                  />
                )}
                {saving && (
                  <p className="text-sm text-muted-foreground px-5 py-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </p>
                )}
              </CardContent>
            </Card>
            )}

            {/* Who has access */}
            <Card className="rounded-xl border border-border/80 shadow-sm mt-6 overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30 border-b border-border/60">
                <CardTitle className="text-base flex items-center gap-2 font-semibold">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Access
                </CardTitle>
                <CardDescription className="text-muted-foreground">Doctors with access to this chart</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
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
                    <li key={a.adminId} className="flex items-center justify-between gap-2">
                      <span>
                        {a.admin.name || a.admin.email}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {a.permission}
                        </Badge>
                      </span>
                      {chart.myPermission === "edit" && (
                        <div className="flex items-center gap-1">
                          <Select
                            value={a.permission}
                            onValueChange={(v) => updateAccessPermission(a.adminId, v as "view" | "edit")}
                          >
                            <SelectTrigger className="h-8 w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">View</SelectItem>
                              <SelectItem value="edit">Edit</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => revokeAccess(a.adminId)}
                          >
                            Revoke
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                  {(chart.pendingRequests ?? []).map((req) => (
                    <li key={req.id} className="flex items-center justify-between">
                      <span>
                        {req.requestedBy.name || req.requestedBy.email}
                        <Badge variant="outline" className="ml-2 text-xs">
                          Requested {req.permission}
                        </Badge>
                      </span>
                      {chart.myPermission === "edit" && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => respondToRequest(req.id, "deny")}
                          >
                            Deny
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => respondToRequest(req.id, "grant")}
                          >
                            Grant
                          </Button>
                        </div>
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
                  {(!chart.createdBy || chart.accessList.length === 0) && (chart.pendingInvitations?.length ?? 0) === 0 && (chart.pendingRequests?.length ?? 0) === 0 && (
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

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear chart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all chart notes to the default template. The change is saved immediately and shared with everyone who has access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearingChart}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleClearChart()
              }}
              disabled={clearingChart}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearingChart ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                "Clear chart"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the chart and all its notes. Everyone who had access will no longer see it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingChart}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteChart()
              }}
              disabled={deletingChart}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingChart ? (
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
    </div>
  )
}
