"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, BadgeCheck, Globe2, Search } from "lucide-react"
import { LAUNCH_COUNTRIES, getLaunchCountry } from "@/data/launch-countries"
import { useSelectedCountry } from "@/components/workspace/country-context"
import { getCountryExplorer } from "@/lib/workspace/country-explorer"
import { cn } from "@/lib/utils"

const POPULAR_CODES = ["AU", "CA", "US"] as const
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1570191913384-7b4ff11716e7?w=400&h=250&fit=crop&auto=format"

const heroImage = (url: string) => url.replace(/\?.*$/, "?w=1600&h=700&fit=crop&auto=format")

export function CountryDashboardShell({
  countryCode,
  initialQuery = "",
  children,
}: {
  countryCode?: string | null
  initialQuery?: string
  children?: ReactNode
}) {
  const router = useRouter()
  const { selectedCountry, setSelectedCountry, hydrated } = useSelectedCountry()
  const routeCountry = countryCode ? getLaunchCountry(countryCode) : null
  const rememberedCountry = selectedCountry ? getLaunchCountry(selectedCountry.code) : null
  const routeCode = routeCountry?.code
  const routeName = routeCountry?.name
  const routeCurrency = routeCountry?.currency
  const rememberedCode = rememberedCountry?.code
  const rememberedName = rememberedCountry?.name
  const [query, setQuery] = useState(routeName ?? initialQuery)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!hydrated) return

    if (routeCode && routeName && routeCurrency) {
      setSelectedCountry({
        code: routeCode,
        name: routeName,
        currency: routeCurrency,
      })
      setQuery(routeName)
      return
    }

    if (initialQuery) {
      setQuery(initialQuery)
      return
    }

    if (rememberedCode && rememberedName) {
      setQuery(rememberedName)
      router.replace(`/countries/${rememberedCode.toLowerCase()}`)
      return
    }

    setQuery("")
  }, [
    hydrated,
    initialQuery,
    rememberedCode,
    rememberedName,
    routeCode,
    routeCurrency,
    routeName,
    router,
    setSelectedCountry,
  ])

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return LAUNCH_COUNTRIES.filter((country) => {
      if (!normalized) return true
      if (country.name.toLowerCase().includes(normalized)) return true
      if (country.currency.toLowerCase().includes(normalized)) return true
      if (country.code.toLowerCase().includes(normalized)) return true

      const explorer = getCountryExplorer(country.code)
      return explorer?.regions.some(
        (region) =>
          region.name.toLowerCase().includes(normalized) ||
          region.cities.some((city) => city.toLowerCase().includes(normalized))
      )
    })
  }, [query])

  const explorer = routeCountry ? getCountryExplorer(routeCountry.code) : null
  const cityCount = explorer?.regions.reduce((total, region) => total + region.cities.length, 0) ?? 0
  const bgImage = heroImage(routeCountry?.image ?? DEFAULT_IMAGE)
  const popular = LAUNCH_COUNTRIES.filter((country) =>
    (POPULAR_CODES as readonly string[]).includes(country.code)
  )

  function pickCountry(country: (typeof LAUNCH_COUNTRIES)[number]) {
    setSelectedCountry({ code: country.code, name: country.name, currency: country.currency })
    setQuery(country.name)
    setOpen(false)
    router.push(`/countries/${country.code.toLowerCase()}`)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (event.key === "Escape") setOpen(false)
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % results.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === "Enter") {
      event.preventDefault()
      pickCountry(results[activeIndex])
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div>
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- LCP hero intentionally uses the direct source so fetch priority is not mediated by an optimizer request. */}
        <img
          aria-hidden="true"
          src={bgImage}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-32 pt-16 sm:px-8 sm:pt-20 lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            Countries
          </p>
          {routeCountry ? (
            <>
              <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[44px]">
                {routeCountry.name}
              </h1>
              <p className="mt-2 text-[14px] font-medium text-white/85">
                {routeCountry.code} · {explorer?.regions.length ?? 0} regions · {cityCount} cities ·{" "}
                {routeCountry.currency}
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[44px]">
                Explore countries
              </h1>
              <p className="mt-2 text-[14px] font-medium text-white/85">
                Pick a destination to open its dashboard
              </p>
            </>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-8 lg:px-10">
        <div className="-mt-9">
          <div className="rounded-2xl border border-[#e7e6e3] bg-white p-2 shadow-xl shadow-black/10">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-[#9c9a94]" />
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                value={query}
                onFocus={() => setOpen(true)}
                onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setOpen(true)
                  setActiveIndex(0)
                }}
                onKeyDown={onKeyDown}
                placeholder="Search by country, currency, region or city…"
                aria-label="Search countries"
                aria-expanded={open}
                aria-controls="country-shell-suggestions"
                aria-activedescendant={open ? `country-shell-option-${activeIndex}` : undefined}
                className="h-12 w-full appearance-none rounded-xl border border-transparent bg-[#fafaf8] pr-12 pl-11 text-[15px] text-[#1b1b1b] outline-none transition placeholder:text-[#a3a19b] focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 [&::-webkit-search-cancel-button]:hidden"
              />

              {open && results.length > 0 && (
                <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-[#e7e6e3] bg-white shadow-xl shadow-black/5">
                  <p className="border-b border-[#f0efec] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a3a19b]">
                    {results.length} {results.length === 1 ? "destination" : "destinations"}
                  </p>
                  <ul id="country-shell-suggestions" role="listbox" className="max-h-72 overflow-y-auto">
                    {results.map((country, index) => (
                      <li key={country.code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeIndex === index}
                          id={`country-shell-option-${index}`}
                          onMouseDown={(event) => {
                            event.preventDefault()
                            pickCountry(country)
                          }}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left transition",
                            activeIndex === index ? "bg-[#eef4ff]" : "hover:bg-[#fafaf8]"
                          )}
                        >
                          <img
                            src={country.image}
                            alt=""
                            width={40}
                            height={28}
                            className="size-8 shrink-0 rounded-md object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "truncate text-[13.5px] font-medium",
                                  activeIndex === index ? "text-[#2563eb]" : "text-[#1b1b1b]"
                                )}
                              >
                                {country.name}
                              </span>
                              {routeCountry?.code === country.code && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#edf5ea] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#3e7a2e]">
                                  <BadgeCheck className="size-2.5" /> Active
                                </span>
                              )}
                            </span>
                            <span className="block text-[11.5px] text-[#a3a19b]">{country.currency}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
            <span className="text-[12px] font-medium text-[#6f6d68]">Popular:</span>
            {popular.map((country) => (
              <button
                key={country.code}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault()
                  pickCountry(country)
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition",
                  routeCountry?.code === country.code
                    ? "border-[#2563eb] bg-[#eef4ff] text-[#2563eb]"
                    : "border-[#e0dfdb] bg-white text-[#4d4c48] hover:border-[#2563eb] hover:text-[#2563eb]"
                )}
              >
                <Globe2 className="size-3" /> {country.name}
              </button>
            ))}
          </div>

          {routeCountry ? (
            <Link
              href={`/careers?country=${routeCountry.code}`}
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
            <h2 className="mt-4 text-[16px] font-semibold text-[#1b1b1b]">
              Pick a country to open its dashboard
            </h2>
            <p className="mt-1.5 max-w-md text-[13px] leading-5.5 text-[#6f6d68]">
              Search all 20 launch destinations or use a popular country above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
