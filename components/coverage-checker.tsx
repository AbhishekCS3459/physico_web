"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatTravelFee } from "@/utils/postal-code"
import { ArrowRight, Loader2, MapPin } from "lucide-react"
import { useState } from "react"

type CoverageInfo = {
  covered: boolean | null
  message: string
  code?: string | null
  area?: string | null
  travelFee?: number | null
}

export function CoverageChecker({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const [postalCode, setPostalCode] = useState("")
  const [result, setResult] = useState<CoverageInfo | null>(null)
  const [checking, setChecking] = useState(false)

  const checkCoverage = async () => {
    const value = postalCode.trim()
    if (value.replace(/[^A-Za-z0-9]/g, "").length < 3) {
      setResult({
        covered: null,
        message: "Enter at least 3 characters (e.g. T2P or T2P 1J9).",
      })
      return
    }

    setChecking(true)
    setResult(null)
    try {
      const response = await fetch(`/api/coverage?code=${encodeURIComponent(value)}`)
      const data = await response.json()
      if (data.success) {
        setResult({
          covered: Boolean(data.covered),
          message: data.message,
          code: data.code,
          area: data.area,
          travelFee: data.travelFee,
        })
      } else {
        setResult({ covered: null, message: data.error || "Unable to check coverage. Please try again." })
      }
    } catch {
      setResult({ covered: null, message: "Unable to check coverage. Please try again." })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className={cn("flex gap-2", compact ? "flex-col" : "flex-col sm:flex-row")}>
        <Input
          placeholder="Enter postal code (e.g., T2P 1J9)"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              checkCoverage()
            }
          }}
          className="uppercase"
          disabled={checking}
        />
        <Button
          onClick={checkCoverage}
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn("bg-transparent border-primary/20 hover:bg-primary/5", compact && "w-full")}
          disabled={checking}
        >
          {checking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              Check Coverage
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
      {result && (
        <div
          className={cn(
            "rounded-lg text-sm p-3 space-y-2",
            result.covered === true && "bg-primary/10 text-foreground border border-primary/20",
            result.covered === false && "bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100 border border-amber-200/70",
            result.covered === null && "bg-muted text-muted-foreground"
          )}
        >
          <p className={cn("font-medium", result.covered === true && "text-primary", result.covered === false && "text-amber-800 dark:text-amber-200")}>
            {result.message}
          </p>
          {result.covered && (
            <div className="grid gap-1 text-sm">
              {result.area ? (
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    <span className="text-muted-foreground">Area:</span> {result.area}
                  </span>
                </p>
              ) : null}
              <p>
                <span className="text-muted-foreground">Travel charge:</span>{" "}
                <span className="font-semibold">{formatTravelFee(result.travelFee)}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
