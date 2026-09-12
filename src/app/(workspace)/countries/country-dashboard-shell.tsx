import Link from "next/link"
import { ArrowRight, Globe2 } from "lucide-react"
import { getLaunchCountry } from "@/data/launch-countries"
import { getCountryExplorer } from "@/lib/workspace/country-explorer"
import { CountrySearchControl } from "./country-search-control"

export function CountryDashboardShell({
  countryCode,
  initialQuery = "",
  children,
}: {
  countryCode?: string | null
  initialQuery?: string
  children?: React.ReactNode
}) {
  const routeCountry = countryCode ? getLaunchCountry(countryCode) : null
  const explorer = routeCountry ? getCountryExplorer(routeCountry.code) : null
  const cityCount = explorer?.regions.reduce((total, region) => total + region.cities.length, 0) ?? 0

  return (
    <div>
      <section className="relative overflow-hidden bg-[#273444]">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-32 pt-16 sm:px-8 sm:pt-20 lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Countries</p>
          {routeCountry ? (
            <>
              <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[44px]">
                {routeCountry.name}
              </h1>
              <p className="mt-2 text-[14px] font-medium text-white/85">
                {routeCountry.code} · {explorer?.regions.length ?? 0} regions · {cityCount} cities · {routeCountry.currency}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/85">
                Explore career demand, study options and regional context across {routeCountry.name} before comparing your next step.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[44px]">
                Explore countries
              </h1>
              <p className="mt-2 text-[14px] font-medium text-white/85">Pick a destination to open its dashboard</p>
            </>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-8 lg:px-10">
        <div className="-mt-9">
          <CountrySearchControl
            routeCountry={routeCountry ? { code: routeCountry.code, name: routeCountry.name, currency: routeCountry.currency } : null}
            initialQuery={initialQuery}
          />

          {routeCountry ? (
            <Link
              href={`/careers?country=${routeCountry.code}`}
              prefetch={false}
              className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-cc-control px-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              Explore careers in {routeCountry.name} <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>

        {routeCountry ? (
          <div className="mt-8">{children}</div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e7e6e3] bg-white/50 px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#eef4ff]">
              <Globe2 className="size-5 text-[#2563eb]" />
            </span>
            <h2 className="mt-4 text-[16px] font-semibold text-[#1b1b1b]">Pick a country to open its dashboard</h2>
            <p className="mt-1.5 max-w-md text-[13px] leading-5.5 text-[#6f6d68]">
              Search all 20 launch destinations or use a popular country above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
