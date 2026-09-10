"use client"

import {
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  ShieldAlert,
} from "lucide-react"
import type { CanonicalCareer } from "@/data/career-comparison-catalog"
import { STUDY_CATEGORIES } from "@/data/study-concepts"
import {
  DEMAND_RATING_LABELS,
  type OccupationDetail,
} from "@/lib/workspace/occupation-detail"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/status-state"
import { SourceInfo } from "@/components/ui/data-display"

const CATEGORY_LABELS = new Map<string, string>(STUDY_CATEGORIES.map((c) => [c.id, c.label]))
const regionRatingVariant = (rating: string) =>
  rating === "S" ? "success" : rating === "M" ? "caution" : "neutral"

const fmt = (value: number) => new Intl.NumberFormat("en-US").format(value)

function SalaryBar({ low, median, high }: { low: number; median: number; high: number }) {
  const position = ((median - low) / (high - low)) * 100

  return (
    <div className="mt-4">
      <div className="relative h-2.5 rounded-full bg-secondary">
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-campcareer-surface bg-brand shadow-cc-surface"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs font-medium text-campcareer-muted">
        <span>low {fmt(low)}</span>
        <span className="text-brand">median {fmt(median)}</span>
        <span>high {fmt(high)}</span>
      </div>
    </div>
  )
}

export function OccupationDetailPanel({
  career,
  detail,
  countryCode,
  countryName,
}: {
  career: CanonicalCareer
  detail: OccupationDetail | undefined
  countryCode?: string
  countryName?: string
}) {
  const categoryLabel = CATEGORY_LABELS.get(career.categoryId) ?? career.categoryId

  const demand = detail?.demand.filter(
    (entry) => !countryCode || entry.countryCode === countryCode
  )
  const salaries = detail?.salaries.filter(
    (entry) => !countryCode || entry.countryCode === countryCode
  )

  if (!detail) {
    return (
      <EmptyState icon={<BriefcaseBusiness className="size-5" />} title={career.label} detail={`A detailed ${categoryLabel} entry is still being verified. Missing details remain unpublished.`} />
    )
  }

  return (
    <div className="space-y-4">
      <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface sm:p-7">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-semibold text-brand">
              {categoryLabel}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-campcareer-ink-secondary">
              {detail.labelKo}
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] text-campcareer-ink">
            {detail.label}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-campcareer-ink-secondary">{detail.overview.en}</p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {(demand?.length ? demand : detail.demand).map((entry) => (
          <div key={`demand-${entry.countryCode}`} className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-5 shadow-cc-surface">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-campcareer-muted">
                Demand · {entry.countryLabel}
                {countryCode === entry.countryCode && countryName && (
                  <Badge variant="success" className="ml-1.5">{countryName}</Badge>
                )}
              </p>
              <BadgeCheck className="size-4 text-campcareer-success" />
            </div>
            <Badge variant="success" className="mt-2.5">{entry.rating}</Badge>
            <p className="mt-2.5 text-sm leading-6 text-campcareer-ink-secondary">{entry.note}</p>

            {entry.regionRatings && (
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {Object.entries(entry.regionRatings).map(([region, rating]) => (
                  <div
                    key={region}
                    className="flex flex-col items-center gap-0.5 rounded-cc-control border border-campcareer-border bg-campcareer-canvas py-1.5"
                    title={`${region}: ${DEMAND_RATING_LABELS[rating] ?? rating}`}
                  >
                    <span className="text-[10px] font-semibold text-campcareer-muted">{region}</span>
                    <Badge variant={regionRatingVariant(rating)}>{rating}</Badge>
                  </div>
                ))}
              </div>
            )}

            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-10 items-center rounded-cc-control px-1 text-xs font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {entry.sourceLabel} →
            </a>
          </div>
        ))}

        {(salaries?.length ? salaries : detail.salaries).map((entry) => (
          <div key={`salary-${entry.countryCode}`} className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-5 shadow-cc-surface">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-campcareer-muted">
                Salary · {entry.countryLabel}
                {countryCode === entry.countryCode && countryName && (
                  <Badge variant="success" className="ml-1.5">{countryName}</Badge>
                )}
              </p>
              <Banknote className="size-4 text-brand" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.025em] tabular-nums text-campcareer-ink">
              {entry.currency} {fmt(entry.median)}
              <span className="ml-1.5 text-xs font-medium text-campcareer-muted">/ yr median</span>
            </p>
            <SalaryBar low={entry.low} median={entry.median} high={entry.high} />
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-10 items-center rounded-cc-control px-1 text-xs font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {entry.sourceLabel} →
            </a>
          </div>
        ))}
      </div>

      <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface">
        <h2 className="text-base font-semibold tracking-[-0.01em] text-campcareer-ink">What they do</h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {detail.mainTasks.map((task, index) => (
            <div
              key={task}
              className="flex items-center gap-3 rounded-cc-surface border border-campcareer-border bg-campcareer-canvas p-3"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-cc-control bg-brand text-xs font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-5 text-campcareer-ink-secondary">{task}</p>
            </div>
          ))}
        </div>
      </section>

      {detail.registration && (
        <section className="flex items-start gap-3 rounded-cc-large border border-campcareer-caution/25 bg-campcareer-caution/10 p-5">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-campcareer-caution" />
          <p className="text-sm leading-6 text-campcareer-ink-secondary">{detail.registration.en}</p>
        </section>
      )}

      <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface">
        <h2 className="text-base font-semibold tracking-[-0.01em] text-campcareer-ink">Sources</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {detail.sources.map((source) => (
            <li key={source.url}><SourceInfo label={source.label} href={source.url} /></li>
          ))}
        </ul>
      </section>
    </div>
  )
}
