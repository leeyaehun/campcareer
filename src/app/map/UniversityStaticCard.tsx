// Server component — no "use client".
// Rendered in the HTML before the interactive map so Googlebot sees real content
// without needing to execute JavaScript.

import { ExternalLink, MapPin, GraduationCap, DollarSign, TrendingUp, Home } from "lucide-react"

export type UniversityCardData = {
  name: string
  cityName: string
  locationLabel: string        // e.g. "New South Wales", "Bayern", "Zuid-Holland"
  countryCode: string          // "AU" | "US" | "CA" | "UK" | "DE" | "NL"
  countryLabel: string         // "Australia", "Germany", …
  qsRank?: number | null
  website?: string | null
  tuition?: number | null
  tuitionFree?: boolean        // true = explicitly free (non-BW DE etc.)
  tuitionCurrency?: string     // "€" | "£" | "C$" | "$" | "A$"
  medianEarnings?: number | null
  earningsCurrency?: string
  graduationRate?: number | null
  roiScore?: number | null
  rentMedian?: number | null
  rentCurrency?: string
  topOccupations?: Array<{
    name: string
    salary: number | null
    currency: string
  }>
}

function StatBox({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
        {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

export default function UniversityStaticCard({ d }: { d: UniversityCardData }) {
  const tc = d.tuitionCurrency ?? "€"
  const ec = d.earningsCurrency ?? "€"
  const rc = d.rentCurrency ?? "€"

  const tuitionDisplay = d.tuitionFree
    ? "Tuition-Free"
    : d.tuition != null
      ? `${tc}${d.tuition.toLocaleString()}/yr`
      : null

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {d.qsRank != null && (
              <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                QS #{d.qsRank}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3" />
              {d.cityName}, {d.locationLabel} · {d.countryLabel}
            </span>
          </div>
          <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
            {d.name}
          </h1>
        </div>
        {d.website && (
          <a
            href={d.website}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={`Visit ${d.name} website`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tuitionDisplay != null && (
          <StatBox
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label="Tuition"
            value={tuitionDisplay}
            sub={d.tuitionFree ? "non-EU international" : "international/yr"}
          />
        )}
        {d.medianEarnings != null && (
          <StatBox
            icon={<DollarSign className="h-3.5 w-3.5" />}
            label="Median Earnings"
            value={`${ec}${d.medianEarnings.toLocaleString()}/yr`}
            sub="graduates"
          />
        )}
        {d.roiScore != null && (
          <StatBox
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="ROI Score"
            value={String(d.roiScore)}
            sub="earnings / cost"
          />
        )}
        {d.graduationRate != null && (
          <StatBox
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label="Grad Rate"
            value={`${Math.round(d.graduationRate * 100)}%`}
          />
        )}
        {d.rentMedian != null && (
          <StatBox
            icon={<Home className="h-3.5 w-3.5" />}
            label="City Rent"
            value={`${rc}${d.rentMedian.toLocaleString()}/mo`}
            sub={d.cityName}
          />
        )}
      </div>

      {/* Top occupations in region */}
      {d.topOccupations && d.topOccupations.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-slate-500">
            Top-paying occupations in {d.locationLabel}
          </p>
          <ol className="flex flex-wrap gap-x-4 gap-y-1">
            {d.topOccupations.slice(0, 5).map((occ, i) => (
              <li key={occ.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="text-slate-400">{i + 1}.</span>
                <span className="font-medium">{occ.name}</span>
                {occ.salary != null && (
                  <span className="text-slate-400">
                    {occ.currency}{occ.salary.toLocaleString()}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

    </div>
  )
}
