"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ArrowLeft, FileText, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { NotificationsBell } from "@/components/notifications-bell"
import { ThemeToggle } from "@/components/theme-toggle"

interface FormTemplateItem {
  id: string
  name: string
  description: string | null
  schema: string
  createdAt: string
  updatedAt: string
  createdBy: { id: string; email: string; name: string | null } | null
}

export default function FormTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<FormTemplateItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) router.push("/login")
      })
      .catch(() => router.push("/login"))
  }, [router])

  useEffect(() => {
    fetch("/api/form-templates", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTemplates(data.data)
        else toast.error(data.error || "Failed to load form templates")
      })
      .catch(() => toast.error("Failed to load form templates"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/charts">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Charts
              </Button>
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="font-semibold text-foreground">Form templates</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationsBell />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Create custom forms (like Google Forms) and use them for chart notes. The default template matches the current chart. Build sections, short/long text, checkboxes, radio, and dropdowns. Data is saved per chart.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/charts/forms/new">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                New (empty)
              </Button>
            </Link>
            <Link href="/admin/charts/forms/new?from=default">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New from default chart
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/60 mb-3" />
              <p className="font-medium text-foreground">No form templates yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Create a form template to customize chart fields. You can add sections, text questions, checkboxes, and more.
              </p>
              <Link href="/admin/charts/forms/new">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Create form template
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <Card key={t.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">
                        <Link
                          href={`/admin/charts/forms/${t.id}`}
                          className="hover:underline focus:underline"
                        >
                          {t.name}
                        </Link>
                      </CardTitle>
                      {t.description && (
                        <CardDescription className="mt-1 line-clamp-2">{t.description}</CardDescription>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Updated {format(new Date(t.updatedAt), "MMM d, yyyy")}
                        {t.createdBy && ` · ${t.createdBy.name || t.createdBy.email}`}
                      </p>
                    </div>
                    <Link href={`/admin/charts/forms/${t.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
