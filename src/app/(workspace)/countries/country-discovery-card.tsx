import Link from "next/link"
import { ArrowRight, Briefcase, GraduationCap, Landmark } from "lucide-react"
import { countryFlagEmoji as countryFlag } from "@/lib/country-flag"
import { formatPriorityEmploymentCount } from "@/data/country-employment-sectors"
import { Badge } from "@/components/ui/badge"
import type { CountryDiscoverySummary, IndustrySectorBar } from "./countries-page-data"

function IndustrySectorBars({ sectors }: { sectors: readonly IndustrySectorBar[] }) {
  const max = Math.max(...sectors.map((s) => s.value))
  return (
    <div className="space-y-1.5" role="list" aria-label="Major employment sectors">
      {sectors.map((sector) => (
        <div key={sector.label} role="listitem" className="flex items-center gap-2 text-[11px]">
          <span className="w-28 shrink-0 truncate text-campcareer-ink-secondary">{sector.label}</span>
          <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-campcareer-border">
            <div className="absolute inset-y-0 left-0 rounded-full bg-brand/60" style={{ width: `${(sector.value / max) * 100}%` }} />
          </div>
          <span className="hidden w-14 shrink-0 text-right tabular-nums text-campcareer-muted sm:inline">
            {formatPriorityEmploymentCount(sector.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CountryDiscoveryCard({ data }: { data: CountryDiscoverySummary }) {
  const {
    country,
    strongMajorLabels,
    topInstitutions,
    institutionCount,
    workOpportunityHeadline,
    salaryFormatted,
    minimumWageFormatted,
    industrySectors,
  } = data
  const href = `/countries/${country.code.toLowerCase()}`

  return (
    <Link
      href={href}
      prefetch={false}
      className="group flex h-full flex-col rounded-cc-large border border-campcareer-border bg-campcareer-surface p-5 shadow-cc-surface transition-colors duration-cc-fast hover:border-brand/40 hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xl" aria-hidden="true">{countryFlag(country.code)}</span>
          <h2 className="text-base font-semibold tracking-[-0.02em] text-campcareer-ink">{country.name}</h2>
        </div>
        <ArrowRight className="size-4 shrink-0 text-campcareer-muted transition-colors group-hover:text-brand" aria-hidden="true" />
      </div>

      {industrySectors ? (
        <div className="mt-4 rounded-lg border border-campcareer-border/70 bg-campcareer-canvas p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">Major employment sectors</p>
          <div className="mt-2">
            <IndustrySectorBars sectors={industrySectors} />
          </div>
        </div>
      ) : null}

      <ul className="mt-4 space-y-3 border-t border-campcareer-border pt-3 text-xs" aria-label={`${country.name} key facts`}>
        <li className="flex items-start gap-1.5">
          <Landmark className="mt-0.5 size-3.5 shrink-0 text-campcareer-muted" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-semibold text-campcareer-ink-secondary">Earnings &amp; minimum wage</p>
            <p className="mt-0.5 tabular-nums text-campcareer-muted">
              {salaryFormatted !== "—" ? `${salaryFormatted}` : "Earnings not available"}
              {minimumWageFormatted ? ` · ${minimumWageFormatted}` : ""}
            </p>
          </div>
        </li>

        {topInstitutions.length > 0 ? (
          <li className="flex items-start gap-1.5">
            <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-campcareer-muted" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-campcareer-ink-secondary">Notable institutions</p>
              <p className="mt-0.5 text-campcareer-muted">{topInstitutions.join(" · ")}{institutionCount > 2 ? ` +${institutionCount - 2}` : ""}</p>
            </div>
          </li>
        ) : null}

        {workOpportunityHeadline ? (
          <li className="flex items-start gap-1.5">
            <Briefcase className="mt-0.5 size-3.5 shrink-0 text-campcareer-muted" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-campcareer-ink-secondary">Career opportunities</p>
              <p className="mt-0.5 text-campcareer-muted line-clamp-1">{workOpportunityHeadline}</p>
            </div>
          </li>
        ) : null}
      </ul>

      {strongMajorLabels.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-campcareer-border pt-3">
          {strongMajorLabels.slice(0, 3).map((label) => (
            <Badge key={label} variant="neutral" className="text-[11px]">{label}</Badge>
          ))}
          {strongMajorLabels.length > 3 ? (
            <Badge variant="outline" className="text-[11px]">+{strongMajorLabels.length - 3}</Badge>
          ) : null}
        </div>
      ) : null}
    </Link>
  )
}
