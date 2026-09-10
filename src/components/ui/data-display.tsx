import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type MetricProps = {
  label: string
  value: ReactNode
  detail?: ReactNode
  className?: string
}

function Metric({ label, value, detail, className }: MetricProps) {
  return (
    <dl className={cn("min-w-0", className)}>
      <dt className="text-xs font-semibold text-campcareer-muted">{label}</dt>
      <dd className="mt-1 break-words text-xl font-bold tracking-[-0.03em] tabular-nums text-campcareer-ink">{value}</dd>
      {detail ? <dd className="mt-1 text-xs leading-5 text-campcareer-ink-secondary">{detail}</dd> : null}
    </dl>
  )
}

type ScoreProps = {
  total: number
  verdict: string
  dimensions: readonly { label: string; value: number }[]
  scoreLabel?: string
  outOfLabel?: string
  className?: string
}

function Score({ total, verdict, dimensions, scoreLabel = "CampCareer Score", outOfLabel = "out of 100", className }: ScoreProps) {
  return (
    <div className={cn("min-w-0", className)} aria-label={`${scoreLabel} ${total} ${outOfLabel}, ${verdict}`}>
      <p className="text-sm font-semibold text-brand">{scoreLabel}</p>
      <div className="mt-2 flex items-end gap-4">
        <p className="text-6xl font-bold leading-none tracking-[-0.07em] tabular-nums text-campcareer-ink sm:text-7xl">{total}</p>
        <div className="pb-1.5">
          <p className="text-xl font-bold tracking-[-0.025em] text-campcareer-ink">{verdict}</p>
          <p className="mt-0.5 text-xs font-medium text-campcareer-muted">{outOfLabel}</p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-3 divide-x divide-campcareer-border border-y border-campcareer-border">
        {dimensions.map((dimension) => (
          <div key={dimension.label} className="min-w-0 px-3 py-4 first:pl-0 last:pr-0 sm:px-5 sm:py-5 sm:first:pl-0 sm:last:pr-0">
            <dt className="text-xs font-semibold text-campcareer-muted sm:text-sm">{dimension.label}</dt>
            <dd className="mt-1 text-3xl font-bold tracking-[-0.045em] tabular-nums text-campcareer-ink sm:text-4xl">{dimension.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

type StatProps = {
  label: string
  value: ReactNode
  helper?: ReactNode
  className?: string
}

function Stat({ label, value, helper, className }: StatProps) {
  return (
    <dl className={cn("rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-4 shadow-cc-surface", className)}>
      <dt className="text-xs font-semibold text-campcareer-muted">{label}</dt>
      <dd className="mt-1 text-lg font-bold tracking-[-0.02em] tabular-nums text-campcareer-ink">{value}</dd>
      {helper ? <dd className="mt-1 text-xs leading-5 text-campcareer-ink-secondary">{helper}</dd> : null}
    </dl>
  )
}

type TrendDirection = "up" | "down" | "steady" | "unknown"

function trendLabel(direction: TrendDirection) {
  return { up: "Increasing", down: "Decreasing", steady: "Stable", unknown: "Unavailable" }[direction]
}

const TREND_TONES = {
  up: "success",
  down: "caution",
  steady: "neutral",
  unknown: "outline",
} as const

function trendTone(direction: TrendDirection) {
  return TREND_TONES[direction]
}

function Trend({ direction, label = trendLabel(direction) }: { direction: TrendDirection; label?: string }) {
  return <Badge variant={trendTone(direction)}>{label}</Badge>
}

function SourceInfo({ label, detail, href, className }: { label: string; detail?: string; href?: string; className?: string }) {
  const content = (
    <>
      <span className="block text-xs font-semibold text-campcareer-ink">{label}</span>
      {detail ? <span className="mt-0.5 block text-xs leading-5 text-campcareer-muted">{detail}</span> : null}
    </>
  )

  if (!href) return <div className={cn("rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3 py-2", className)}>{content}</div>

  return (
    <a href={href} target="_blank" rel="noreferrer" className={cn("block rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3 py-2 transition-colors duration-cc-fast hover:border-brand/40 hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30", className)}>
      {content}
    </a>
  )
}

function EntityBadge({ children, className }: { children: ReactNode; className?: string }) {
  return <Badge variant="neutral" className={className}>{children}</Badge>
}

export { EntityBadge, Metric, Score, SourceInfo, Stat, Trend, trendLabel, trendTone }
export type { TrendDirection }
