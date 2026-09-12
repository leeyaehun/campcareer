"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Loader2, Check, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/locale-provider"
import { useTranslations } from "@/lib/i18n/use-translations"
import { subscribeVisaAlerts } from "@/app/degree-risk/actions"
import { track } from "@/lib/analytics"

type Status = "idle" | "submitting" | "done" | "duplicate"

export interface VisaAlertFormProps {
  /** CountryCode | 'all' | null — auto-attached to the subscription. */
  country?: string | null
  /** Major slug or field name | null. */
  field?: string | null
  className?: string
  decisionContext?: Record<string, string>
  heading?: string
  subtitle?: string
  submitLabel?: string
}

export function VisaAlertForm({
  country = null,
  field = null,
  className,
  decisionContext,
  heading,
  subtitle,
  submitLabel,
}: VisaAlertFormProps) {
  const t = useTranslations()
  const va = t.visaAlert
  const locale = useLocale()
  const pathname = usePathname()

  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "submitting") return
    setError(null)
    if (!consent) {
      setError(va.errorConsent)
      return
    }
    if (decisionContext) track("plan_save_requested", { country: country ?? "all", field: field ?? "unknown" })
    setStatus("submitting")
    try {
      const res = await subscribeVisaAlerts({
        email,
        country,
        field,
        locale,
        sourcePath: pathname,
        consent,
        decisionContext,
      })
      if (res.ok) {
        track("visa_alert_submitted", { country: country ?? "all", field: field ?? "unknown", lead_type: decisionContext ? "decision_brief" : "visa_alert" })
        setStatus("done")
      } else if (res.duplicate) {
        setStatus("duplicate")
      } else {
        setStatus("idle")
        setError(res.error === "invalid_email" ? va.errorInvalid : res.error === "consent_required" ? va.errorConsent : va.errorGeneric)
      }
    } catch {
      setStatus("idle")
      setError(va.errorGeneric)
    }
  }

  if (status === "done" || status === "duplicate") {
    const done = status === "done"
    return (
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-2xl border-2 p-5 text-sm",
          done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800",
          className
        )}
        role="status"
      >
        {done ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" />}
        <p>{done ? va.success.replace("{email}", email) : va.duplicate}</p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-2xl border-2 border-slate-200 bg-white p-5 md:p-6", className)}>
      <div className="mb-1 flex items-center gap-2">
        <Bell className="h-4 w-4 text-brand" />
        <h3 className="font-display text-base font-semibold text-slate-900">{heading ?? va.heading}</h3>
      </div>
      <p className="mb-4 text-sm text-slate-500">{subtitle ?? va.subtitle}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={va.placeholder}
          aria-label={va.placeholder}
          className="min-h-[48px] flex-1 rounded-xl border-2 border-slate-200 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:border-brand"
        />
        <Button type="submit" variant="tactile" size="tactile" disabled={status === "submitting"}>
          {status === "submitting" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === "submitting" ? va.submitting : submitLabel ?? va.submit}
        </Button>
      </form>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs text-slate-500">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-brand"
        />
        <span>
          {va.consentBefore}{" "}
          <Link href="/privacy" prefetch={false} className="underline underline-offset-2 hover:text-slate-700">
            {va.privacyLink}
          </Link>
          {va.consentAfter}
        </span>
      </label>

      {error && (
        <p className="mt-3 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
