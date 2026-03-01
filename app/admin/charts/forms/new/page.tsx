"use client"

import { FormBuilder } from "@/components/form-builder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FORM_SCHEMA_VERSION,
  getDefaultInitialAssessmentFormSchema,
  type FormSchema,
} from "@/lib/form-schema"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

const emptySchema: FormSchema = {
  version: FORM_SCHEMA_VERSION,
  fields: [],
}

export default function NewFormTemplatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromDefault = searchParams.get("from") === "default"

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [schema, setSchema] = useState<FormSchema>(emptySchema)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (fromDefault) {
      setSchema(getDefaultInitialAssessmentFormSchema())
      setName("Initial Assessment (copy)")
      setDescription("Copy of the default chart form. Customize as needed.")
    }
  }, [fromDefault])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/form-templates", {
        method: "POST",
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
        toast.success("Form template created")
        router.push(`/admin/charts/forms/${data.data.id}`)
      } else {
        toast.error(data.error || "Failed to create")
      }
    } catch {
      toast.error("Failed to create form template")
    } finally {
      setSaving(false)
    }
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
        <h1 className="text-2xl font-semibold text-foreground mb-6">New form template</h1>

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
              Add sections and questions. Drag to reorder. Click a field to edit label and options.
            </p>
            <FormBuilder schema={schema} onChange={setSchema} disabled={saving} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create form template
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
