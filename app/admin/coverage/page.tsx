"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatPostalCode, formatTravelFee } from "@/utils/postal-code"
import { ArrowLeft, Info, Loader2, MapPin, Plus, Search, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

interface CoveragePincode {
  id: string
  code: string
  label: string | null
  travelFee: number | null
  createdAt: string
}

export default function AdminCoveragePage() {
  const router = useRouter()
  const [pincodes, setPincodes] = useState<CoveragePincode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mode, setMode] = useState<"one" | "many">("one")
  const [singleCode, setSingleCode] = useState("")
  const [areaLabel, setAreaLabel] = useState("")
  const [chargeEnabled, setChargeEnabled] = useState(false)
  const [chargeAmount, setChargeAmount] = useState("")
  const [bulkCodes, setBulkCodes] = useState("")
  const [search, setSearch] = useState("")
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null)
  const [editingFeeValue, setEditingFeeValue] = useState("")
  const [savingFeeId, setSavingFeeId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) router.push("/login")
      })
      .catch(() => router.push("/login"))
  }, [router])

  const fetchPincodes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/pincodes", { credentials: "include" })
      const data = await response.json()
      if (data.success) setPincodes(data.data)
      else toast.error(data.error || "Failed to load pincodes")
    } catch {
      toast.error("Failed to load pincodes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPincodes()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim()
    if (!q) return pincodes
    const compact = q.replace(/\s/g, "")
    return pincodes.filter((p) => {
      const code = p.code.toUpperCase()
      const label = (p.label ?? "").toUpperCase()
      return code.includes(compact) || label.includes(q) || formatPostalCode(p.code).includes(q)
    })
  }, [pincodes, search])

  const parsedCharge = (): number | null => {
    if (!chargeEnabled) return null
    const value = Number.parseFloat(chargeAmount)
    if (!Number.isFinite(value) || value < 0) return null
    return value
  }

  const addCodes = async (raw: string, label?: string) => {
    if (!raw.trim()) {
      toast.error("Type a pincode first, e.g. T2P or T2P 1J9")
      return
    }
    if (chargeEnabled) {
      const fee = Number.parseFloat(chargeAmount)
      if (!Number.isFinite(fee) || fee < 0) {
        toast.error("Enter a valid travel charge, or turn it off for None")
        return
      }
    }
    setSaving(true)
    try {
      const response = await fetch("/api/admin/pincodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          codes: raw,
          label: label?.trim() || undefined,
          travelFee: parsedCharge(),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setPincodes(data.data)
        setSingleCode("")
        setAreaLabel("")
        setBulkCodes("")
        setChargeEnabled(false)
        setChargeAmount("")
        toast.success(
          data.added
            ? `Added ${data.added} pincode${data.added === 1 ? "" : "s"}${data.skipped ? ` (${data.skipped} already listed)` : ""}`
            : "Those pincodes were already listed"
        )
      } else {
        toast.error(data.error || "Failed to add pincodes")
      }
    } catch {
      toast.error("Failed to add pincodes")
    } finally {
      setSaving(false)
    }
  }

  const saveTravelFee = async (id: string, raw: string) => {
    const trimmed = raw.trim()
    const fee = trimmed === "" ? null : Number.parseFloat(trimmed)
    if (fee != null && (!Number.isFinite(fee) || fee < 0)) {
      toast.error("Enter a valid amount, or leave blank for None")
      return
    }
    setSavingFeeId(id)
    try {
      const response = await fetch(`/api/admin/pincodes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ travelFee: fee }),
      })
      const data = await response.json()
      if (data.success) {
        setPincodes((prev) => prev.map((p) => (p.id === id ? { ...p, travelFee: data.data.travelFee } : p)))
        setEditingFeeId(null)
        toast.success("Travel charge updated")
      } else {
        toast.error(data.error || "Failed to update charge")
      }
    } catch {
      toast.error("Failed to update charge")
    } finally {
      setSavingFeeId(null)
    }
  }

  const deleteCode = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/pincodes/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setPincodes((prev) => prev.filter((p) => p.id !== id))
        toast.success("Removed from coverage")
      } else {
        toast.error(data.error || "Failed to remove pincode")
      }
    } catch {
      toast.error("Failed to remove pincode")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Service coverage</h1>
            <p className="text-muted-foreground max-w-xl">
              These pincodes decide what visitors see when they tap <span className="font-medium text-foreground">Check Coverage</span> on the website.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to dashboard
            </Link>
          </Button>
        </div>

        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed space-y-2">
                <p className="font-medium text-foreground">How to add coverage</p>
                <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
                  <li>
                    Prefer a <span className="font-medium text-foreground">3-letter FSA</span> like <span className="font-mono text-foreground">T2P</span> — that covers every code starting with T2P (e.g. T2P 1J9).
                  </li>
                  <li>
                    Use a <span className="font-medium text-foreground">full pincode</span> like <span className="font-mono text-foreground">T2P 1J9</span> only if you want that exact code.
                  </li>
                  <li>Optional: add an area name (Calgary Downtown) so visitors see it on Check Coverage.</li>
                  <li>Travel charge defaults to <span className="font-medium text-foreground">None</span>. Turn it on only if you want a fee for that pincode.</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add pincodes
            </CardTitle>
            <CardDescription>Start with one code, or switch to many if you have a list to paste.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="inline-flex rounded-lg border p-1 bg-muted/40">
              <button
                type="button"
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  mode === "one" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("one")}
              >
                Add one
              </button>
              <button
                type="button"
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  mode === "many" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("many")}
              >
                Add many
              </button>
            </div>

            {mode === "one" ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="single-code">Pincode</Label>
                    <Input
                      id="single-code"
                      className="mt-2 uppercase font-mono"
                      placeholder="T2P or T2P 1J9"
                      value={singleCode}
                      onChange={(e) => setSingleCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addCodes(singleCode, areaLabel)
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="area-label">Area name (optional)</Label>
                    <Input
                      id="area-label"
                      className="mt-2"
                      placeholder="Calgary Downtown"
                      value={areaLabel}
                      onChange={(e) => setAreaLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addCodes(singleCode, areaLabel)
                        }
                      }}
                    />
                  </div>
                </div>
                <ChargeFields
                  enabled={chargeEnabled}
                  amount={chargeAmount}
                  onEnabledChange={setChargeEnabled}
                  onAmountChange={setChargeAmount}
                />
                <Button onClick={() => addCodes(singleCode, areaLabel)} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-codes">Paste pincodes</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">
                    One per line, or separated by commas. Example: T2P, T2N, T4B
                  </p>
                  <Textarea
                    id="bulk-codes"
                    className="uppercase min-h-[120px] font-mono"
                    placeholder={"T2P\nT2N\nT4B"}
                    value={bulkCodes}
                    onChange={(e) => setBulkCodes(e.target.value.toUpperCase())}
                  />
                </div>
                <ChargeFields
                  enabled={chargeEnabled}
                  amount={chargeAmount}
                  onEnabledChange={setChargeEnabled}
                  onAmountChange={setChargeAmount}
                  hint="Applied to every code in this list. Leave off for None."
                />
                <Button onClick={() => addCodes(bulkCodes)} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Your coverage list
                </CardTitle>
                <CardDescription>
                  {search
                    ? `Showing ${filtered.length} of ${pincodes.length}`
                    : `${pincodes.length} pincode${pincodes.length === 1 ? "" : "s"} on file`}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 pr-9 uppercase"
                  placeholder="Search pincode or area…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search ? (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                Loading pincodes...
              </div>
            ) : pincodes.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Nothing listed yet. Add an FSA like <span className="font-mono text-foreground">T2P</span> above.
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-3">
                <p>
                  No results for <span className="font-mono text-foreground">{search}</span>.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                  Clear search and show all {pincodes.length}
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Pincode</th>
                      <th className="px-4 py-3 font-medium">Area</th>
                      <th className="px-4 py-3 font-medium">Travel charge</th>
                      <th className="px-4 py-3 font-medium text-right w-24">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((pincode) => (
                      <tr key={pincode.id} className="border-t">
                        <td className="px-4 py-3 font-mono font-semibold tracking-wide">
                          {formatPostalCode(pincode.code)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {pincode.label && pincode.label !== formatPostalCode(pincode.code)
                            ? pincode.label
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {editingFeeId === pincode.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                className="h-8 w-24"
                                inputMode="decimal"
                                placeholder="None"
                                value={editingFeeValue}
                                onChange={(e) => setEditingFeeValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    saveTravelFee(pincode.id, editingFeeValue)
                                  }
                                  if (e.key === "Escape") setEditingFeeId(null)
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                className="h-8"
                                disabled={savingFeeId === pincode.id}
                                onClick={() => saveTravelFee(pincode.id, editingFeeValue)}
                              >
                                {savingFeeId === pincode.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingFeeId(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="text-left font-medium hover:text-primary"
                              onClick={() => {
                                setEditingFeeId(pincode.id)
                                setEditingFeeValue(
                                  pincode.travelFee != null && pincode.travelFee > 0 ? String(pincode.travelFee) : ""
                                )
                              }}
                            >
                              {formatTravelFee(pincode.travelFee)}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={deletingId === pincode.id}
                            onClick={() => deleteCode(pincode.id)}
                            aria-label={`Remove ${pincode.code}`}
                          >
                            {deletingId === pincode.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChargeFields({
  enabled,
  amount,
  onEnabledChange,
  onAmountChange,
  hint,
}: {
  enabled: boolean
  amount: string
  onEnabledChange: (value: boolean) => void
  onAmountChange: (value: string) => void
  hint?: string
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Travel charge</p>
          <p className="text-xs text-muted-foreground">{hint || "Default is None. Turn on only if this area has a fee."}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onEnabledChange(!enabled)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors",
            enabled ? "bg-primary border-primary" : "bg-muted border-border"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 translate-y-px rounded-full bg-background shadow transition-transform",
              enabled ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>
      {enabled ? (
        <div>
          <Label htmlFor="travel-fee">Amount ($)</Label>
          <Input
            id="travel-fee"
            className="mt-2 max-w-[180px]"
            inputMode="decimal"
            placeholder="25"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
        </div>
      ) : (
        <p className="text-sm font-medium">None</p>
      )}
    </div>
  )
}
