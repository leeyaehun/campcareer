import Link from "next/link"
import { ArrowRight, Globe2 } from "lucide-react"
import { LAUNCH_COUNTRIES, getLaunchCountry } from "@/data/launch-countries"
import { getCountryExplorer } from "@/lib/workspace/country-explorer"
import { CountrySearchControl, type CountrySearchOption } from "./country-search-control"

const POPULAR_CODES = new Set(["AU", "CA", "US"])
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?w=400&h=250&fit=crop&auto=format"

const heroImage = (url: string, width: number) =>
  url.replace(/\?.*$/, `?w=${width}&h=${Math.round(width * 0.7)}&fit=crop&auto=format&q=65`)

const SEARCH_OPTIONS: CountrySearchOption[] = LAUNCH_COUNTRIES.map((country) => {
  const explorer = getCountryExplorer(country.code)
  const locationTerms = explorer?.regions.flatMap((region) => [region.name, ...region.cities]) ?? []
  return {
    code: country.code,
    name: country.name,
    currency: country.currency,
    image: country.image,
    searchText: [country.name, country.currency, country.code, ...locationTerms].join(" ").toLowerCase(),
    popular: POPULAR_CODES.has(country.code),
  }
})

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
  const heroSource = routeCountry?.image ?? DEFAULT_IMAGE
  const bgImageSrcSet = [640, 800, 1200]
    .map((width) => `${heroImage(heroSource, width)} ${width}w`)
    .join(", ")

  return (
    <div>
      <section className="relative overflow-hidden bg-[#273444]">
        <picture aria-hidden="true">
          <source media="(min-width: 640px)" srcSet={bgImageSrcSet} sizes="100vw" />
          {/* eslint-disable-next-line @next/next/no-img-element -- desktop-only decorative hero source; mobile uses the solid fallback. */}
          <img
            src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
            alt=""
            fetchPriority="high"
            className="absolute inset-0 hidden h-full w-full object-cover object-center sm:block"
          />
        </picture>
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
            options={SEARCH_OPTIONS}
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
