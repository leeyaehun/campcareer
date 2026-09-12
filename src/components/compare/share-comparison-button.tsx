"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"
import { localizePath, type Locale } from "@/lib/i18n/config"
import { trackAnalyticsEvent } from "@/lib/analytics"

type ShareComparisonButtonProps = {
  href: string
  title: string
  description: string
  entityCount: number
  locale: Locale
}

/**
 * Shares a normalized, public Compare URL. The caller supplies a URL built
 * from validated comparison state so arbitrary query data and private state
 * never become part of a shareable result.
 */
export function ShareComparisonButton({ href, title, description, entityCount, locale }: ShareComparisonButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle")

  async function share() {
    const path = localizePath(href, locale)
    const url = new URL(path, window.location.origin).toString()
    setStatus("idle")

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: description, url })
        trackAnalyticsEvent({ name: "compare_share", params: { entity_count: entityCount, comparison_category: "career", share_method: "native" } })
        return
      } catch (error) {
        // Closing the native share sheet is a normal cancellation and must not
        // be counted as a share or replaced with an unexpected clipboard flow.
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      trackAnalyticsEvent({ name: "compare_share", params: { entity_count: entityCount, comparison_category: "career", share_method: "clipboard" } })
      setStatus("copied")
    } catch {
      setStatus("failed")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => void share()}
        className="inline-flex min-h-10 items-center gap-2 rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3.5 text-sm font-semibold text-campcareer-ink-secondary shadow-cc-surface transition-colors duration-cc-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <Share2 aria-hidden="true" className="size-4" /> {locale === "ko" ? "비교 공유" : "Share comparison"}
      </button>
      {status === "copied" ? <span className="text-xs font-medium text-campcareer-success" role="status">{locale === "ko" ? "링크를 복사했습니다." : "Link copied."}</span> : null}
      {status === "failed" ? <span className="text-xs font-medium text-rose-700" role="status">{locale === "ko" ? "링크를 복사하지 못했습니다." : "Could not copy the link."}</span> : null}
    </div>
  )
}
