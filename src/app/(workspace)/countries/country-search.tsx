"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { CountryDiscoveryCard } from "./country-discovery-card"
import type { CountryDiscoverySummary } from "./countries-page-data"

export function CountrySearch({ countries }: { countries: readonly CountryDiscoverySummary[] }) {
  const [query, setQuery] = useState("")
  const normalized = query.trim().toLowerCase()

  const results = useMemo(() => {
    if (!normalized) return countries
    return countries.filter(({ country, strongMajorLabels, topInstitutions }) =>
      country.name.toLowerCase().includes(normalized)
      || strongMajorLabels.some((label) => label.toLowerCase().includes(normalized))
      || topInstitutions.some((name) => name.toLowerCase().includes(normalized)),
    )
  }, [countries, normalized])

  return (
    <section className="mt-10" aria-label="Explore countries">
      <div className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-4 shadow-cc-surface sm:p-5" aria-label="Country search">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">Find a country</p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-campcareer-muted" />
          <input
            type="search"
            aria-label="Search countries"
            placeholder="Search countries..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-12 w-full rounded-cc-control border border-campcareer-border bg-campcareer-surface pl-11 pr-12 text-sm text-campcareer-ink shadow-cc-surface outline-none focus:border-brand focus:ring-2 focus:ring-ring/20"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-cc-control p-1 text-campcareer-muted transition-colors hover:bg-campcareer-surface hover:text-campcareer-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-campcareer-border pt-3">
          <p className="text-xs font-semibold text-campcareer-muted">
            {normalized ? `${results.length} of ${countries.length} countries` : `${countries.length} supported countries`}
          </p>
        </div>
      </div>

      {results.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((data) => (
            <li key={data.country.code} className="flex">
              <CountryDiscoveryCard data={data} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-cc-large border border-dashed border-campcareer-border bg-campcareer-surface/50 px-5 py-12 text-center">
          <p className="text-sm font-semibold text-campcareer-ink-secondary">No countries match &quot;{query.trim()}&quot;</p>
          <p className="mt-1 text-xs text-campcareer-muted">Try a country name, career strength or institution.</p>
        </div>
      )}
    </section>
  )
}