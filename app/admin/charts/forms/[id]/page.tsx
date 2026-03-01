"use client"

import { FormBuilder } from "@/components/form-builder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { parseFormSchema } from "@/lib/form-schema"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import type { FormSchema } from "@/lib/form-schema"

export default function EditFormTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchTemplate = useCallback(async () => {
    try {
      const res = await fetch(`/api/form-templates/${id}`, { credentials: "include" })
      const data = await res.json()
      if (data.success) {
        setName(data.data.name)
        setDescription(data.data.description ?? "")
        setSchema(parseFormSchema(data.data.schema) ?? { version: 1, fields: [] })
      } else {
        toast.error(data.error || "Failed to load template")
        router.push("/admin/charts/forms")
      }
    } catch {
      toast.error("Failed to load template")
      router.push("/admin/charts/forms")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) router.push("/login")
      })
      .catch(() => router.push("/login"))
  }, [router])

  useEffect(() => {
    fetchTemplate()
  }, [fetchTemplate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schema || !name.trim()) {
      toast.error("Name is required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/form-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          schema: JSON.stringify(schema),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Form template saved")
        setSchema(parseFormSchema(data.data.schema) ?? schema)
      } else {
        toast.error(data.error || "Failed to save")
      }
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !schema) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/admin/charts/forms">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Form templates
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-6">Edit form template</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Template name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Initial Assessment"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of when to use this form"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Fields</Label>
            <p className="text-sm text-muted-foreground">
              Add sections and questions. Reorder with arrows. Click a field to edit.
            </p>
            <FormBuilder schema={schema} onChange={setSchema} disabled={saving} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
            <Link href="/admin/charts/forms">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
