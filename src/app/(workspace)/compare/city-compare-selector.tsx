"use client"

import { ArrowLeftRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { buildCityCompareCanonicalHref } from "@/lib/compare-routes"

export type CityCompareOption = {
  slug: string
  name: string
  regionName: string
}

type CityCompareSelectorProps = {
  options: readonly CityCompareOption[]
  leftSlug: string
  rightSlug: string
  countryCode?: string
}

export function CityCompareSelector({
  options,
  leftSlug,
  rightSlug,
  countryCode = "AU",
}: CityCompareSelectorProps) {
  const router = useRouter()

  function navigate(left: string, right: string) {
    if (!left || !right || left === right) return
    router.replace(
      buildCityCompareCanonicalHref({
        country: countryCode,
        left,
        right,
      }),
      { scroll: false },
    )
  }

  return (
    <div className="grid gap-3 rounded-cc-large border border-campcareer-border bg-campcareer-surface p-4 shadow-cc-surface sm:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] sm:items-end sm:p-5">
      <label className="block min-w-0">
        <span className="mb-1.5 block text-xs font-semibold text-campcareer-muted">
          First city
        </span>
        <span className="relative block min-w-0">
          <select
            value={leftSlug}
            onChange={(event) => navigate(event.target.value, rightSlug)}
            className="h-11 w-full min-w-0 rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3 text-sm font-semibold text-campcareer-ink shadow-cc-surface focus:border-brand focus:ring-4 focus:ring-ring/30"
            aria-label="First city to compare"
          >
            {options.map((city) => (
              <option key={city.slug} value={city.slug} disabled={city.slug === rightSlug}>
                {city.name} · {city.regionName}
              </option>
            ))}
          </select>
        </span>
      </label>

      <button
        type="button"
        onClick={() => navigate(rightSlug, leftSlug)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3 text-brand shadow-cc-surface transition-colors duration-cc-fast hover:bg-brand-tint focus:outline-none focus:ring-4 focus:ring-ring/30 sm:grid sm:w-11 sm:place-items-center sm:px-0"
        aria-label="Swap compared cities"
        title="Swap cities"
      >
        <ArrowLeftRight className="size-4" />
        <span className="text-sm font-semibold sm:hidden">Swap cities</span>
      </button>

      <label className="block min-w-0">
        <span className="mb-1.5 block text-xs font-semibold text-campcareer-muted">
          Second city
        </span>
        <span className="relative block min-w-0">
          <select
            value={rightSlug}
            onChange={(event) => navigate(leftSlug, event.target.value)}
            className="h-11 w-full min-w-0 rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3 text-sm font-semibold text-campcareer-ink shadow-cc-surface focus:border-brand focus:ring-4 focus:ring-ring/30"
            aria-label="Second city to compare"
          >
            {options.map((city) => (
              <option key={city.slug} value={city.slug} disabled={city.slug === leftSlug}>
                {city.name} · {city.regionName}
              </option>
            ))}
          </select>
        </span>
      </label>
    </div>
  )
}