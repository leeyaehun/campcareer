"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { BadgeCheck, Globe2, Search } from "lucide-react"
import { useSelectedCountry } from "@/components/workspace/country-context"
import { cn } from "@/lib/utils"

export type CountrySearchOption = {
  code: string
  name: string
  currency: string
  image: string
  searchText: string
  popular: boolean
}

export function CountrySearchControl({
  routeCountry,
  initialQuery,
  options,
}: {
  routeCountry: { code: string; name: string; currency: string } | null
  initialQuery: string
  options: CountrySearchOption[]
}) {
  const router = useRouter()
  const { selectedCountry, setSelectedCountry, hydrated } = useSelectedCountry()
  const rememberedCountry = selectedCountry
    ? options.find((country) => country.code === selectedCountry.code) ?? null
    : null
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
  ])

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return options.filter((country) => !normalized || country.searchText.includes(normalized))
  }, [options, query])

  const popular = options.filter((country) => country.popular)

  function pickCountry(country: CountrySearchOption) {
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
    <>
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
                        activeIndex === index ? "bg-[#eef4ff]" : "hover:bg-[#fafaf8]",
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
                              activeIndex === index ? "text-[#2563eb]" : "text-[#1b1b1b]",
                            )}
                          >
                            {country.name}
                          </span>
                          {routeCode === country.code && (
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
              routeCode === country.code
                ? "border-[#2563eb] bg-[#eef4ff] text-[#2563eb]"
                : "border-[#e0dfdb] bg-white text-[#4d4c48] hover:border-[#2563eb] hover:text-[#2563eb]",
            )}
          >
            <Globe2 className="size-3" /> {country.name}
          </button>
        ))}
      </div>
    </>
  )
}
