"use client"

import { cn } from "@/lib/utils"
import { consentDocumentClauses } from "@/lib/consent-copy"

export function ConsentDocumentBlock({
  patientDisplayName,
  className,
}: {
  patientDisplayName: string
  className?: string
}) {
  const clauses = consentDocumentClauses(patientDisplayName)

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card/50 p-5 sm:p-6 shadow-sm space-y-1",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">
        Informed consent — please review with the patient
      </p>
      <ul className="list-none space-y-4 text-sm text-foreground/90 leading-relaxed">
        {clauses.map((text, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80"
              aria-hidden
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-5 border-t border-border/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Clinician</p>
      </div>
    </div>
  )
}
