"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

type Vote = "yes" | "no"
type FeedbackEntityType = "career" | "country" | "program" | "institution" | "compare" | "source" | "methodology" | "data_policy" | "other"

/** Lightweight anonymous page signal; detailed reports remain in the same API. */
export function PageFeedback({
  entityType = "other",
  entityId,
}: {
  entityType?: FeedbackEntityType
  entityId?: string
}) {
  const pathname = usePathname()
  const [vote, setVote] = useState<Vote | null>(null)
  const [failed, setFailed] = useState(false)

  async function submit(nextVote: Vote) {
    if (vote) return
    setFailed(false)
    try {
      const response = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "suggestion",
          description: `Page usefulness: ${nextVote}.`,
          context: { pagePath: pathname, entityType, ...(entityId ? { entityId } : {}) },
        }),
      })
      if (!response.ok) throw new Error("Feedback was not accepted")
      setVote(nextVote)
    } catch {
      setFailed(true)
    }
  }

  return (
    <section className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--cc-border))] px-5 pt-6 text-sm sm:px-6" aria-label="Page feedback">
      <p className="font-medium text-[hsl(var(--cc-ink))]">Was this useful?</p>
      {vote ? (
        <p className="text-[hsl(var(--cc-muted))]" role="status">Thanks for the feedback.</p>
      ) : (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void submit("yes")} className="min-h-10 rounded-cc-control border border-campcareer-border px-3 text-sm font-semibold text-campcareer-ink-secondary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">Yes</button>
          <button type="button" onClick={() => void submit("no")} className="min-h-10 rounded-cc-control border border-campcareer-border px-3 text-sm font-semibold text-campcareer-ink-secondary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">No</button>
        </div>
      )}
      {failed ? <p className="w-full text-xs text-rose-700" role="alert">Feedback could not be sent. Please try again.</p> : null}
    </section>
  )
}
