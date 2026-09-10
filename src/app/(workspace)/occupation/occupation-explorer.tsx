"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BriefcaseBusiness, ChevronDown, Factory, HandHeart, Hammer, HeartPulse, Landmark, Laptop, MousePointerClick, Palette, Plane, ShoppingBag, SlidersHorizontal, Sprout } from "lucide-react"
import { CANONICAL_CAREERS, type CanonicalCareer } from "@/data/career-comparison-catalog"
import { LAUNCH_COUNTRIES } from "@/data/launch-countries"
import { STUDY_CATEGORIES } from "@/data/study-concepts"
import { getOccupationDetail } from "@/lib/workspace/occupation-detail"
import type { CountryOccupationProfile } from "@/lib/workspace/country-occupation-contract"
import { CategorySearch } from "@/components/workspace/category-search"
import { CountryPill } from "@/components/workspace/country-pill"
import { useSelectedCountry } from "@/components/workspace/country-context"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { CountryAwareOccupationDetail } from "./country-aware-occupation-detail"
import { cn } from "@/lib/utils"

const CATEGORY_LABELS = new Map<string, string>(STUDY_CATEGORIES.map((c) => [c.id, c.label]))
const CATEGORY_ACCENT = new Map<string, string>([
  ["trades", "#c2691e"],
  ["health", "#2563eb"],
  ["technology", "#6d4fc4"],
  ["engineering", "#3e7a2e"],
  ["business", "#2563eb"],
  ["education", "#6d4fc4"],
  ["environment", "#3e7a2e"],
  ["design", "#c2691e"],
  ["hospitality", "#c2691e"],
  ["transport", "#6d4fc4"],
])
const CATEGORY_ICON = new Map([
  ["trades", Hammer],
  ["health", HeartPulse],
  ["technology", Laptop],
  ["engineering", Factory],
  ["business", Landmark],
  ["education", HandHeart],
  ["environment", Sprout],
  ["design", Palette],
  ["hospitality", ShoppingBag],
  ["transport", Plane],
])

type CountryProfileStatus = "idle" | "loading" | "ready" | "missing" | "error"

function OccupationDiscovery({ locale, onChoose, onBrowseAll, isCareerIndex }: { locale: string; onChoose: (categoryId: string) => void; onBrowseAll: () => void; isCareerIndex: boolean }) {
  return <section className="mt-6" aria-labelledby="field-discovery-heading"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c2691e]">Start here</p><h2 id="field-discovery-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#1b1b1b] sm:text-2xl">Find a field that fits you</h2></div><p className="hidden max-w-48 text-right text-[12px] leading-5 text-[#77746e] sm:block">Choose a field first, then compare the careers inside it.</p></div><div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">{STUDY_CATEGORIES.map((category) => { const careers = CANONICAL_CAREERS.filter((career) => career.categoryId === category.id); const example = careers[0]; const accent = CATEGORY_ACCENT.get(category.id) ?? "#c2691e"; const Icon = CATEGORY_ICON.get(category.id) ?? BriefcaseBusiness; const label = locale === "ko" ? category.labelKo : category.label; const exampleLabel = example ? (locale === "ko" ? example.labelKo : example.label) : null; return <button key={category.id} type="button" onClick={() => onChoose(category.id)} className="group min-h-36 rounded-2xl border border-[#e7e6e3] bg-white p-3.5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2691e]/35 focus-visible:ring-offset-2 sm:min-h-40 sm:p-4"><span className="grid size-9 place-items-center rounded-xl" style={{ backgroundColor: `${accent}16`, color: accent }}><Icon className="size-[18px]" /></span><span className="mt-4 block text-[13px] font-semibold leading-[1.25] tracking-[-0.015em] text-[#1b1b1b] sm:text-[14px]">{label}</span><span className="mt-2 block text-[10.5px] font-medium text-[#8f8c85]">{careers.length} roles to explore</span>{exampleLabel ? <span className="mt-1 block truncate text-[10.5px] text-[#6f6d68]">e.g. {exampleLabel}</span> : null}</button> })}</div><button type="button" onClick={onBrowseAll} className="mt-4 inline-flex min-h-10 items-center gap-2 text-[12.5px] font-semibold text-[#c2691e] transition hover:text-[#9d4f0d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2691e]/35 focus-visible:ring-offset-2">{isCareerIndex ? "Browse all careers" : "Browse all occupations"} <ChevronDown className="size-4 -rotate-90" /></button></section>
}

function matchCareer(career: CanonicalCareer, q: string) {
  const query = q.trim().toLowerCase()
  if (!query) return true
  return (
    career.label.toLowerCase().includes(query) ||
    career.labelKo.toLowerCase().includes(query) ||
    career.aliases.some((alias) => alias.toLowerCase().includes(query)) ||
    career.aliasesKo.some((alias) => alias.toLowerCase().includes(query))
  )
}

function initialSelection(
  initialOccupation: string,
  query: string,
  matches: CanonicalCareer[]
): string | undefined {
  if (initialOccupation && matches.some((c) => c.id === initialOccupation)) return initialOccupation
  if (!query.trim()) return undefined
  const normalizedQuery = query.trim().toLowerCase()
  const exact = matches.find(
    (c) => c.label.toLowerCase() === normalizedQuery || c.labelKo.toLowerCase() === normalizedQuery
  )
  return exact?.id ?? matches[0]?.id
}

export function OccupationExplorer({
  basePath = "/occupation",
  initialQuery,
  initialOccupation,
  initialCountry,
  initialCategory,
}: {
  basePath?: "/careers" | "/occupation"
  initialQuery: string
  initialOccupation: string
  initialCountry: string
  initialCategory: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useRouteLocale()
  const { selectedCountry, setSelectedCountry } = useSelectedCountry()
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<string>(() => STUDY_CATEGORIES.some((item) => item.id === initialCategory) ? initialCategory : "all")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [showAllOccupations, setShowAllOccupations] = useState(false)
  const [countryProfile, setCountryProfile] = useState<CountryOccupationProfile | null>(null)
  const [countryProfileStatus, setCountryProfileStatus] = useState<CountryProfileStatus>("idle")
  const isCareerIndex = basePath === "/careers"

  useEffect(() => {
    if (!initialCountry) return
    const country = LAUNCH_COUNTRIES.find((item) => item.code === initialCountry)
    if (!country) return

    setSelectedCountry({
      code: country.code,
      name: country.name,
      currency: country.currency,
    })
  }, [initialCountry, setSelectedCountry])

  const filtered = useMemo(() => {
    return CANONICAL_CAREERS.filter((career) => {
      if (category !== "all" && career.categoryId !== category) return false
      return matchCareer(career, query)
    })
  }, [query, category])

  const [selectedId, setSelectedId] = useState<string | undefined>(() =>
    initialSelection(initialOccupation, initialQuery, filtered)
  )

  const selected = selectedId
    ? CANONICAL_CAREERS.find((career) => career.id === selectedId)
    : undefined
  const selectedDetail = selected ? getOccupationDetail(selected.id) : undefined

  useEffect(() => {
    if (!selectedId || !selectedCountry?.code) {
      setCountryProfile(null)
      setCountryProfileStatus("idle")
      return
    }

    const controller = new AbortController()
    setCountryProfile(null)
    setCountryProfileStatus("loading")

    const params = new URLSearchParams({
      country: selectedCountry.code,
      career: selectedId,
    })

    fetch(`/api/occupations/profile?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) return { profile: null }
        if (!response.ok) throw new Error(`Occupation profile request failed: ${response.status}`)
        return (await response.json()) as { profile: CountryOccupationProfile | null }
      })
      .then(({ profile }) => {
        setCountryProfile(profile)
        setCountryProfileStatus(profile ? "ready" : "missing")
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        console.error("[occupation] country profile failed", error)
        setCountryProfile(null)
        setCountryProfileStatus("error")
      })

    return () => controller.abort()
  }, [selectedCountry?.code, selectedId])

  useEffect(() => {
    if (!selectedId || window.innerWidth >= 1024) return
    const timeout = window.setTimeout(() => document.getElementById("occupation-detail-mobile")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
    return () => window.clearTimeout(timeout)
  }, [selectedId])

  const grouped = useMemo(() => {
    const map = new Map<string, CanonicalCareer[]>()
    for (const career of filtered) {
      const list = map.get(career.categoryId) ?? []
      list.push(career)
      map.set(career.categoryId, list)
    }
    return [...map.entries()]
  }, [filtered])

  function updateCountry(code: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (code) params.set("country", code)
    else params.delete("country")
    if (selectedId) params.set("occupation", selectedId)
    if (query.trim()) params.set("q", query.trim())
    else params.delete("q")

    const nextQuery = params.toString()
    router.replace(nextQuery ? `${basePath}?${nextQuery}` : basePath, { scroll: false })
  }

  function select(career: CanonicalCareer) {
    setSelectedId(career.id)
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) params.set("q", query.trim())
    else params.delete("q")
    const effectiveCountry = selectedCountry?.code || initialCountry
    if (effectiveCountry) params.set("country", effectiveCountry)
    params.set("occupation", career.id)
    router.replace(`${basePath}?${params.toString()}`, { scroll: false })
  }

  function chooseCategory(categoryId: string) {
    setCategory(categoryId)
    setShowAllOccupations(true)
    setFiltersOpen(false)
  }

  const selectedCategoryLabel = category === "all" ? (isCareerIndex ? "All careers" : "All occupations") : CATEGORY_LABELS.get(category) ?? "Filters"
  const isDiscoveryMode = !showAllOccupations && category === "all" && !query.trim() && !selectedId

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-[#c2691e] sm:block">
            Explore
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:mt-1.5 sm:gap-3">
            <h1 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-[#1b1b1b] sm:text-3xl">
              {isCareerIndex ? (locale === "ko" ? "커리어" : "Careers") : "Occupation"}
            </h1>
            <CountryPill onChange={updateCountry} />
          </div>
        </div>
      </div>

      <div className="mt-4 lg:mt-6 lg:max-w-xl">
        <CategorySearch
          value={query}
          onChange={setQuery}
          placeholder={isCareerIndex ? "Search careers, e.g. Nurse or Electrician…" : "Search occupations, e.g. Nurse or Electrician…"}
        />
      </div>

      <div className="relative mt-3 lg:hidden">
        <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e0dfdb] bg-white px-3 text-[12.5px] font-semibold text-[#4d4c48] transition hover:border-[#c2691e]/50 hover:text-[#c2691e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2691e]/25"><SlidersHorizontal className="size-4" /><span>{selectedCategoryLabel}</span><ChevronDown className={cn("size-3.5 transition-transform", filtersOpen && "rotate-180")} /></button>
        {filtersOpen ? <div className="absolute left-0 top-12 z-30 w-full rounded-2xl border border-[#e7e6e3] bg-white p-3 shadow-xl shadow-slate-900/10"><p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8f8c85]">Filter {isCareerIndex ? "careers" : "occupations"}</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => chooseCategory("all")} className={cn("rounded-lg border px-3 py-2 text-[12px] font-medium transition", category === "all" ? "border-[#c2691e] bg-[#c2691e] text-white" : "border-[#e0dfdb] text-[#6f6d68]")}>All</button>{STUDY_CATEGORIES.map((item) => <button key={item.id} type="button" onClick={() => chooseCategory(item.id)} className={cn("rounded-lg border px-3 py-2 text-[12px] font-medium transition", category === item.id ? "border-[#c2691e] bg-[#c2691e] text-white" : "border-[#e0dfdb] text-[#6f6d68]")}>{item.label}</button>)}</div></div> : null}
      </div>

      <div className="mt-5 hidden flex-wrap gap-2 lg:flex">
        <button
          type="button"
          onClick={() => chooseCategory("all")}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition",
            category === "all"
              ? "border-[#c2691e] bg-[#c2691e] text-white"
              : "border-[#e0dfdb] bg-white text-[#6f6d68] hover:border-[#c2691e]/50 hover:text-[#c2691e]"
          )}
        >
          All
        </button>
        {STUDY_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => chooseCategory(item.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition",
              category === item.id
                ? "border-[#c2691e] bg-[#c2691e] text-white"
                : "border-[#e0dfdb] bg-white text-[#6f6d68] hover:border-[#c2691e]/50 hover:text-[#c2691e]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isDiscoveryMode ? <OccupationDiscovery locale={locale} onChoose={chooseCategory} onBrowseAll={() => setShowAllOccupations(true)} isCareerIndex={isCareerIndex} /> : <>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-[12.5px] font-medium text-[#a3a19b]">
          {filtered.length} {isCareerIndex ? "careers" : "occupations"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-[#e7e6e3] bg-white/50 text-center">
          <BriefcaseBusiness className="size-6 text-[#c4c2bc]" />
          <p className="mt-3 text-[13.5px] font-medium text-[#6f6d68]">
            No {isCareerIndex ? "careers" : "occupations"} match “{query}”.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid gap-4 lg:grid-cols-12 lg:items-start">
          {selected ? <section id="occupation-detail-mobile" className="min-w-0 scroll-mt-4 lg:hidden"><CountryAwareOccupationDetail career={selected} detail={selectedDetail} countryCode={selectedCountry?.code} countryName={selectedCountry?.name} countryProfile={countryProfile} countryProfileStatus={countryProfileStatus} /></section> : null}

          <section className="lg:hidden">
            <div className="flex items-center justify-between"><h2 className="text-[12.5px] font-semibold text-[#1b1b1b]">{selected ? `Browse ${filtered.length} related roles` : `${filtered.length} ${isCareerIndex ? "careers" : "occupations"}`}</h2><span className="text-[11px] text-[#8f8c85]">Tap to view</span></div>
            <div className="mt-2 space-y-1.5">{filtered.map((career) => { const detail = getOccupationDetail(career.id); const demand = selectedCountry ? detail?.demand.find((entry) => entry.countryCode === selectedCountry.code) : detail?.demand[0]; const isSelected = career.id === selectedId; const displayLabel = locale === "ko" ? career.labelKo : career.label; return <button key={career.id} type="button" onClick={() => select(career)} className={cn("flex w-full items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 text-left transition active:scale-[0.99]", isSelected ? "border-[#c2691e]/60 bg-[#fffaf5]" : "border-[#e7e6e3] hover:bg-[#fffaf5]")}><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_ACCENT.get(career.categoryId) ?? "#c2691e" }} /><span className={cn("min-w-0 flex-1 truncate text-[13px] font-medium", isSelected ? "text-[#c2691e]" : "text-[#1b1b1b]")}>{displayLabel}</span>{demand ? <span className="shrink-0 text-[10px] font-bold text-[#3e7a2e]">{demand.rating.toUpperCase()}</span> : null}</button> })}</div>
          </section>

          <aside className="hidden min-w-0 lg:sticky lg:top-20 lg:col-span-4 lg:block lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto lg:pr-1 lg:pb-2">
            <div className="space-y-4">
              {grouped.map(([categoryId, careers]) => (
                <div key={categoryId}>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a3a19b]">
                      {CATEGORY_LABELS.get(categoryId)}
                    </h2>
                    <span className="text-[10.5px] font-medium text-[#c4c2bc]">
                      {careers.length}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {careers.map((career) => {
                      const detail = getOccupationDetail(career.id)
                      const accent = CATEGORY_ACCENT.get(career.categoryId) ?? "#c2691e"
                      const isSelected = career.id === selectedId
                      const displayLabel = locale === "ko" ? career.labelKo : career.label
                      const countryDemand = selectedCountry
                        ? detail?.demand.find(
                            (entry) => entry.countryCode === selectedCountry.code
                          )
                        : undefined
                      const demand = selectedCountry ? countryDemand : detail?.demand[0]
                      const selectedScore =
                        isSelected && countryProfile?.canonicalCareerId === career.id
                          ? countryProfile.metric.opportunityScore
                          : null

                      return (
                        <button
                          key={career.id}
                          type="button"
                          onClick={() => select(career)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 text-left transition",
                            isSelected
                              ? "border-[#c2691e]/60 bg-[#fffaf5] ring-1 ring-[#c2691e]/20"
                              : "border-[#e7e6e3] hover:border-[#dfc4a9] hover:bg-[#fffaf5]"
                          )}
                        >
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-[13.5px] font-medium",
                              isSelected ? "text-[#c2691e]" : "text-[#1b1b1b]"
                            )}
                          >
                            {displayLabel}
                          </span>
                          {selectedScore != null ? (
                            <span className="shrink-0 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-bold text-[#2563eb]">
                              {selectedScore}
                            </span>
                          ) : demand ? (
                            <span className="shrink-0 rounded-full bg-[#edf5ea] px-2 py-0.5 text-[10px] font-bold text-[#3e7a2e]">
                              {demand.rating.toUpperCase()}
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="hidden min-w-0 lg:col-span-8 lg:block">
            {selected ? (
              <CountryAwareOccupationDetail
                career={selected}
                detail={selectedDetail}
                countryCode={selectedCountry?.code}
                countryName={selectedCountry?.name}
                countryProfile={countryProfile}
                countryProfileStatus={countryProfileStatus}
              />
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#e7e6e3] bg-white/50 p-10 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-[#fff4e8] text-[#c2691e]">
                  <MousePointerClick className="size-6" />
                </span>
                <h2 className="mt-5 text-[18px] font-semibold tracking-[-0.01em] text-[#1b1b1b]">
                  Pick an occupation to open its dashboard
                </h2>
                <p className="mt-2 max-w-sm text-[13.5px] leading-6 text-[#6f6d68]">
                  Search or browse the list. Demand ratings, salary ranges and tasks update
                  instantly here without a page reload.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
      </>}
    </>
  )
}
