import Link from "next/link"
import { ArrowRight, Briefcase, GraduationCap, Landmark } from "lucide-react"
import { countryFlagEmoji as countryFlag } from "@/lib/country-flag"
import { Badge } from "@/components/ui/badge"
import type { CountryDiscoverySummary } from "./countries-page-data"

export function CountryDiscoveryCard({ data }: { data: CountryDiscoverySummary }) {
  const { country, introduction, strongMajorLabels, topInstitutions, institutionCount, workOpportunityHeadline, salaryFormatted, minimumWageFormatted } = data
  const href = `/countries/${country.code.toLowerCase()}`

  return (
    <Link
      href={href}
      prefetch={false}
      className="group block rounded-cc-large border border-campcareer-border bg-campcareer-surface p-5 shadow-cc-surface transition-colors duration-cc-fast hover:border-brand/40 hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">{countryFlag(country.code)}</span>
            <h2 className="text-base font-semibold tracking-[-0.02em] text-campcareer-ink">{country.name}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-campcareer-ink-secondary line-clamp-3">{introduction}</p>
        </div>
        <ArrowRight className="mt-1 size-4 shrink-0 text-campcareer-muted transition-colors group-hover:text-brand" aria-hidden="true" />
      </div>

      {strongMajorLabels.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {strongMajorLabels.slice(0, 4).map((label) => (
            <Badge key={label} variant="neutral" className="text-[11px]">{label}</Badge>
          ))}
          {strongMajorLabels.length > 4 ? (
            <Badge variant="outline" className="text-[11px]">+{strongMajorLabels.length - 4}</Badge>
          ) : null}
        </div>
      ) : null}

      <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-campcareer-border pt-3 text-xs sm:grid-cols-2">
        {salaryFormatted !== "—" ? (
          <div className="flex items-start gap-1.5">
            <Landmark className="mt-0.5 size-3.5 shrink-0 text-campcareer-muted" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="font-semibold text-campcareer-ink-secondary">Annual earnings</dt>
              <dd className="mt-0.5 tabular-nums text-campcareer-muted">{salaryFormatted}</dd>
            </div>
          </div>
        ) : null}

        {minimumWageFormatted ? (
          <div className="flex items-start gap-1.5">
            <Landmark className="mt-0.5 size-3.5 shrink-0 text-campcareer-muted" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="font-semibold text-campcareer-ink-secondary">Minimum wage</dt>
              <dd className="mt-0.5 tabular-nums text-campcareer-muted">{minimumWageFormatted}</dd>
            </div>
          </div>
        ) : null}

        {topInstitutions.length > 0 ? (
          <div className="flex items-start gap-1.5">
            <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-campcareer-muted" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="font-semibold text-campcareer-ink-secondary">Notable institutions</dt>
              <dd className="mt-0.5 text-campcareer-muted">{topInstitutions.join(" · ")}{institutionCount > 3 ? ` +${institutionCount - 3}` : ""}</dd>
            </div>
          </div>
        ) : null}

        {workOpportunityHeadline ? (
          <div className="flex items-start gap-1.5">
            <Briefcase className="mt-0.5 size-3.5 shrink-0 text-campcareer-muted" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="font-semibold text-campcareer-ink-secondary">Career opportunities</dt>
              <dd className="mt-0.5 text-campcareer-muted line-clamp-1">{workOpportunityHeadline}</dd>
            </div>
          </div>
        ) : null}
      </dl>
    </Link>
  )
}
