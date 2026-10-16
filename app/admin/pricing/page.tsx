"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  SERVICE_STATUSES,
  SERVICE_STATUS_LABELS,
  formatPriceRange,
  pricingConfigSchema,
  type PricingConfig,
  type ServiceStatus,
} from "@/lib/pricing-config"
import { ArrowLeft, DollarSign, Info, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

type SessionDraft = { id: string; label: string; durationMinutes: string; price: string }
type ServiceDraft = { id: PricingConfig["services"][number]["id"]; name: string; status: ServiceStatus; sessions: SessionDraft[] }
type FeeDraft = { id: string; label: string; amount: string }
type PricingDraft = { services: ServiceDraft[]; additionalFees: FeeDraft[] }

function toDraft(config: PricingConfig): PricingDraft {
  return {
    services: config.services.map((service) => ({
      ...service,
      sessions: service.sessions.map((session) => ({
        ...session,
        durationMinutes: String(session.durationMinutes),
        price: String(session.price),
      })),
    })),
    additionalFees: config.additionalFees.map((fee) => ({ ...fee })),
  }
}

function fromDraft(draft: PricingDraft): unknown {
  return {
    services: draft.services.map((service) => ({
      ...service,
      sessions: service.sessions.map((session) => ({
        ...session,
        durationMinutes: Number.parseInt(session.durationMinutes, 10),
        price: Number.parseFloat(session.price),
      })),
    })),
    additionalFees: draft.additionalFees,
  }
}

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

export default function AdminPricingPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<PricingDraft | null>(null)
  const [savedJson, setSavedJson] = useState("")
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [isDefault, setIsDefault] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const me = await fetch("/api/auth/me", { credentials: "include" }).then((res) => res.json())
        if (!me.authenticated) {
          router.push("/login")
          return
        }
        if (me.admin?.role !== "super_admin") {
          if (active) setForbidden(true)
          return
        }
        const res = await fetch("/api/admin/pricing", { credentials: "include" })
        const data = await res.json()
        if (!active) return
        if (!data.success) {
          toast.error(data.error || "Failed to load pricing")
          return
        }
        const nextDraft = toDraft(data.data)
        setDraft(nextDraft)
        setSavedJson(JSON.stringify(nextDraft))
        setUpdatedAt(data.updatedAt)
        setIsDefault(data.isDefault)
      } catch {
        if (active) toast.error("Failed to load pricing")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [router])

  const isDirty = useMemo(() => draft != null && JSON.stringify(draft) !== savedJson, [draft, savedJson])

  useEffect(() => {
    if (!isDirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [isDirty])

  const updateService = (serviceId: ServiceDraft["id"], patch: Partial<ServiceDraft>) =>
    setDraft((prev) =>
      prev && { ...prev, services: prev.services.map((s) => (s.id === serviceId ? { ...s, ...patch } : s)) }
    )

  const updateSession = (serviceId: ServiceDraft["id"], sessionId: string, patch: Partial<SessionDraft>) =>
    setDraft((prev) =>
      prev && {
        ...prev,
        services: prev.services.map((s) =>
          s.id === serviceId
            ? { ...s, sessions: s.sessions.map((session) => (session.id === sessionId ? { ...session, ...patch } : session)) }
            : s
        ),
      }
    )

  const addSession = (serviceId: ServiceDraft["id"]) =>
    setDraft((prev) =>
      prev && {
        ...prev,
        services: prev.services.map((s) =>
          s.id === serviceId
            ? { ...s, sessions: [...s.sessions, { id: newId("session"), label: "", durationMinutes: "60", price: "" }] }
            : s
        ),
      }
    )

  const removeSession = (serviceId: ServiceDraft["id"], sessionId: string) =>
    setDraft((prev) =>
      prev && {
        ...prev,
        services: prev.services.map((s) =>
          s.id === serviceId ? { ...s, sessions: s.sessions.filter((session) => session.id !== sessionId) } : s
        ),
      }
    )

  const updateFee = (feeId: string, patch: Partial<FeeDraft>) =>
    setDraft((prev) =>
      prev && { ...prev, additionalFees: prev.additionalFees.map((f) => (f.id === feeId ? { ...f, ...patch } : f)) }
    )

  const save = async () => {
    if (!draft) return
    const parsed = pricingConfigSchema.safeParse(fromDraft(draft))
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      const field = issue?.path[issue.path.length - 1]
      const message =
        field === "price"
          ? "Every session needs a price (0 or more)"
          : field === "durationMinutes"
            ? "Every session needs a duration between 5 and 480 minutes"
            : issue?.message
      toast.error(message || "Please check the pricing fields")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || "Failed to save pricing")
        return
      }
      const nextDraft = toDraft(data.data)
      setDraft(nextDraft)
      setSavedJson(JSON.stringify(nextDraft))
      setUpdatedAt(data.updatedAt)
      setIsDefault(false)
      toast.success("Pricing saved — the website now shows these prices")
    } catch {
      toast.error("Failed to save pricing")
    } finally {
      setSaving(false)
    }
  }

  const discard = () => {
    if (savedJson) setDraft(JSON.parse(savedJson))
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Super admin only</CardTitle>
            <CardDescription>Ask a super admin to update website pricing.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/admin/charts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to patient charts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl pb-28">
        <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pricing</h1>
            <p className="text-muted-foreground max-w-xl">
              Prices set here appear on the home page, pricing page, services page, and booking form.
            </p>
            {updatedAt && !isDefault ? (
              <p className="text-sm text-muted-foreground mt-2">Last saved {new Date(updatedAt).toLocaleString()}</p>
            ) : null}
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to dashboard
            </Link>
          </Button>
        </div>

        {isDefault && !loading ? (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  These are the starting prices. Nothing has been saved yet — edit anything below and press{" "}
                  <span className="font-medium text-foreground">Save pricing</span> to make it official.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {loading || !draft ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            Loading pricing...
          </div>
        ) : (
          <div className="space-y-6">
            {draft.services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        {service.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Visitors see:{" "}
                        <span className="font-medium text-foreground">
                          {formatPriceRange({
                            ...service,
                            sessions: service.sessions
                              .filter((s) => s.price.trim() !== "" && Number.isFinite(Number(s.price)))
                              .map((s) => ({ ...s, durationMinutes: Number(s.durationMinutes), price: Number(s.price) })),
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="w-full sm:w-60">
                      <Label className="text-xs text-muted-foreground">On the website</Label>
                      <Select
                        value={service.status}
                        onValueChange={(value) => updateService(service.id, { status: value as ServiceStatus })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {SERVICE_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sessions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="hidden sm:grid grid-cols-[1fr_120px_120px_40px] gap-3 text-xs font-medium text-muted-foreground">
                        <span>Session</span>
                        <span>Minutes</span>
                        <span>Price ($)</span>
                        <span />
                      </div>
                      {service.sessions.map((session) => (
                        <div
                          key={session.id}
                          className="grid grid-cols-2 sm:grid-cols-[1fr_120px_120px_40px] gap-3 items-center rounded-lg border sm:border-0 p-3 sm:p-0"
                        >
                          <Input
                            className="col-span-2 sm:col-span-1"
                            aria-label="Session name"
                            placeholder="Follow-Up Session"
                            value={session.label}
                            onChange={(e) => updateSession(service.id, session.id, { label: e.target.value })}
                          />
                          <Input
                            aria-label="Minutes"
                            inputMode="numeric"
                            placeholder="45"
                            value={session.durationMinutes}
                            onChange={(e) =>
                              updateSession(service.id, session.id, { durationMinutes: e.target.value.replace(/[^\d]/g, "") })
                            }
                          />
                          <Input
                            aria-label="Price"
                            inputMode="decimal"
                            placeholder="150"
                            value={session.price}
                            onChange={(e) =>
                              updateSession(service.id, session.id, { price: e.target.value.replace(/[^\d.]/g, "") })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive justify-self-end"
                            onClick={() => removeSession(service.id, session.id)}
                            aria-label={`Remove ${session.label || "session"}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => addSession(service.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add session
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle>Additional fees</CardTitle>
                <CardDescription>
                  Shown as written, e.g. <span className="font-mono">$15–$25</span> or{" "}
                  <span className="font-mono">From $40</span>. Per-pincode travel charges are set on the{" "}
                  <Link href="/admin/coverage" className="text-primary hover:underline">
                    coverage page
                  </Link>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {draft.additionalFees.map((fee) => (
                  <div key={fee.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_160px_40px] gap-3 items-center">
                    <Input
                      className="col-span-2 sm:col-span-1"
                      aria-label="Fee name"
                      placeholder="Documentation/Forms/Reports"
                      value={fee.label}
                      onChange={(e) => updateFee(fee.id, { label: e.target.value })}
                    />
                    <Input
                      aria-label="Fee amount"
                      placeholder="From $40"
                      value={fee.amount}
                      onChange={(e) => updateFee(fee.id, { amount: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setDraft((prev) =>
                          prev && { ...prev, additionalFees: prev.additionalFees.filter((f) => f.id !== fee.id) }
                        )
                      }
                      aria-label={`Remove ${fee.label || "fee"}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDraft((prev) =>
                      prev && { ...prev, additionalFees: [...prev.additionalFees, { id: newId("fee"), label: "", amount: "" }] }
                    )
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add fee
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {draft ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
          <div className="container mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{isDirty ? "You have unsaved changes" : "All changes saved"}</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={discard} disabled={!isDirty || saving}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button onClick={save} disabled={(!isDirty && !isDefault) || saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save pricing
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
