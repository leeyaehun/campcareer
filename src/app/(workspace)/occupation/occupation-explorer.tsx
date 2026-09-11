"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { BriefcaseBusiness, ChevronDown, Factory, HandHeart, Hammer, HeartPulse, Landmark, Laptop, MousePointerClick, Palette, Plane, ShoppingBag, SlidersHorizontal, Sprout } from "lucide-react"
import { CAREER_CATALOGUE, type Career } from "@/lib/career-data-foundation/career-catalogue"
import { LAUNCH_COUNTRIES } from "@/data/launch-countries"
import { STUDY_CATEGORIES } from "@/data/study-concepts"
import { getOccupationDetail } from "@/lib/workspace/occupation-detail"
import type { CountryOccupationProfile } from "@/lib/workspace/country-occupation-contract"
import { CategorySearch } from "@/components/workspace/category-search"
import { CountryPill } from "@/components/workspace/country-pill"
import { useSelectedCountry } from "@/components/workspace/country-context"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { getIndexableCareerRoute } from "@/lib/workspace/occupation-routes"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/status-state"
import { FilterBar, FilterChip } from "@/components/ui/filter-bar"
import { cn } from "@/lib/utils"

const CATEGORY_LABELS = new Map<string, string>(STUDY_CATEGORIES.map((c) => [c.id, c.label]))
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

const CountryAwareOccupationDetail = dynamic(
  () => import("./country-aware-occupation-detail").then((module) => module.CountryAwareOccupationDetail),
  {
    loading: () => (
      <div
        className="min-h-[420px] rounded-cc-large border border-campcareer-border bg-campcareer-surface"
        aria-hidden="true"
      />
    ),
  },
)

function OccupationDiscovery({ locale, onChoose, onBrowseAll, isCareerIndex }: { locale: string; onChoose: (categoryId: string) => void; onBrowseAll: () => void; isCareerIndex: boolean }) {
  return (
    <section className="mt-6" aria-labelledby="field-discovery-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-brand">Start here</p>
          <h2 id="field-discovery-heading" className="mt-2 text-xl font-semibold tracking-[-0.03em] text-campcareer-ink sm:text-2xl">Find a field that fits you</h2>
        </div>
        <p className="hidden max-w-52 text-right text-xs leading-5 text-campcareer-muted sm:block">Choose a field first, then compare the careers inside it.</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STUDY_CATEGORIES.map((category) => {
          const careers = CAREER_CATALOGUE.filter((career) => career.categoryId === category.id)
          const example = careers[0]
          const Icon = CATEGORY_ICON.get(category.id) ?? BriefcaseBusiness
          const label = locale === "ko" ? category.labelKo : category.label
          const exampleLabel = example ? (locale === "ko" ? example.labelKo : example.label) : null

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChoose(category.id)}
              className="group min-h-36 rounded-cc-large border border-campcareer-border bg-campcareer-surface p-4 text-left shadow-cc-surface transition-colors duration-cc-standard hover:border-brand/40 hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:min-h-40"
            >
              <span className="grid size-9 place-items-center rounded-cc-surface bg-brand-tint text-brand"><Icon className="size-[18px]" /></span>
              <span className="mt-4 block text-sm font-semibold leading-5 tracking-[-0.015em] text-campcareer-ink">{label}</span>
              <span className="mt-2 block text-xs font-medium text-campcareer-muted">{careers.length} roles to explore</span>
              {exampleLabel ? <span className="mt-1 block truncate text-xs text-campcareer-ink-secondary">e.g. {exampleLabel}</span> : null}
            </button>
          )
        })}
      </div>
      <button type="button" onClick={onBrowseAll} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-cc-control px-1 text-sm font-semibold text-brand transition-colors duration-cc-fast hover:text-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
        {isCareerIndex ? "Browse all careers" : "Browse all occupations"} <ChevronDown className="size-4 -rotate-90" />
      </button>
    </section>
  )
}

function matchCareer(career: Career, q: string) {
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
  matches: Career[]
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
  initialBrowseAll = false,
}: {
  basePath?: "/careers" | "/occupation"
  initialQuery: string
  initialOccupation: string
  initialCountry: string
  initialCategory: string
  initialBrowseAll?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useRouteLocale()
  const { selectedCountry, setSelectedCountry } = useSelectedCountry()
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<string>(() => STUDY_CATEGORIES.some((item) => item.id === initialCategory) ? initialCategory : "all")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [showAllOccupations, setShowAllOccupations] = useState(initialBrowseAll)
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
    return CAREER_CATALOGUE.filter((career) => {
      if (category !== "all" && career.categoryId !== category) return false
      return matchCareer(career, query)
    })
  }, [query, category])

  const [selectedId, setSelectedId] = useState<string | undefined>(() =>
    initialSelection(initialOccupation, initialQuery, filtered)
  )

  const selected = selectedId
    ? CAREER_CATALOGUE.find((career) => career.id === selectedId)
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
    const map = new Map<string, Career[]>()
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

  function select(career: Career) {
    const effectiveCountry = selectedCountry?.code || initialCountry
    const canonicalRoute = isCareerIndex && effectiveCountry
      ? getIndexableCareerRoute(effectiveCountry, career.id)
      : null
    if (canonicalRoute) {
      router.push(canonicalRoute.path)
      return
    }

    setSelectedId(career.id)
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) params.set("q", query.trim())
    else params.delete("q")
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
          <p className="hidden text-xs font-semibold tracking-[0.08em] text-brand sm:block">
            Explore
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:mt-1.5 sm:gap-3">
            <h1 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-campcareer-ink sm:text-3xl">
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
        <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className="inline-flex min-h-10 items-center gap-2 rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3 text-sm font-semibold text-campcareer-ink-secondary shadow-cc-surface transition-colors duration-cc-fast hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><SlidersHorizontal className="size-4" /><span>{selectedCategoryLabel}</span><ChevronDown className={cn("size-3.5 transition-transform duration-cc-fast", filtersOpen && "rotate-180")} /></button>
        {filtersOpen ? <div className="absolute left-0 top-12 z-30 w-full rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-3 shadow-cc-raised"><p className="px-1 pb-2 text-xs font-semibold text-campcareer-muted">Filter {isCareerIndex ? "careers" : "occupations"}</p><FilterBar><FilterChip active={category === "all"} onClick={() => chooseCategory("all")}>All</FilterChip>{STUDY_CATEGORIES.map((item) => <FilterChip key={item.id} active={category === item.id} onClick={() => chooseCategory(item.id)}>{item.label}</FilterChip>)}</FilterBar></div> : null}
      </div>

      <FilterBar className="mt-5 hidden lg:flex">
        <FilterChip active={category === "all"} onClick={() => chooseCategory("all")}>All</FilterChip>
        {STUDY_CATEGORIES.map((item) => (
          <FilterChip
            key={item.id}
            onClick={() => chooseCategory(item.id)}
            active={category === item.id}
          >
            {item.label}
          </FilterChip>
        ))}
      </FilterBar>

      {isDiscoveryMode ? <OccupationDiscovery locale={locale} onChoose={chooseCategory} onBrowseAll={() => setShowAllOccupations(true)} isCareerIndex={isCareerIndex} /> : <>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-medium text-campcareer-muted">
          {filtered.length} {isCareerIndex ? "careers" : "occupations"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<BriefcaseBusiness className="size-6" />} title={`No ${isCareerIndex ? "careers" : "occupations"} found`} detail={`No results match “${query}”.`} className="mt-4 min-h-56" />
      ) : (
        <div className="mt-3 grid gap-4 lg:grid-cols-12 lg:items-start">
          {selected ? <section id="occupation-detail-mobile" className="min-w-0 scroll-mt-4 lg:hidden"><CountryAwareOccupationDetail career={selected} detail={selectedDetail} countryCode={selectedCountry?.code} countryName={selectedCountry?.name} countryProfile={countryProfile} countryProfileStatus={countryProfileStatus} /></section> : null}

          <section className="lg:hidden">
            <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-campcareer-ink">{selected ? `Browse ${filtered.length} related roles` : `${filtered.length} ${isCareerIndex ? "careers" : "occupations"}`}</h2><span className="text-xs text-campcareer-muted">Tap to view</span></div>
            <div className="mt-2 space-y-2">{filtered.map((career) => { const detail = getOccupationDetail(career.id); const demand = selectedCountry ? detail?.demand.find((entry) => entry.countryCode === selectedCountry.code) : detail?.demand[0]; const isSelected = career.id === selectedId; const displayLabel = locale === "ko" ? career.labelKo : career.label; return <button key={career.id} type="button" onClick={() => select(career)} className={cn("flex min-h-11 w-full items-center gap-2.5 rounded-cc-surface border bg-campcareer-surface px-3 py-2.5 text-left shadow-cc-surface transition-colors duration-cc-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30", isSelected ? "border-brand bg-brand-tint" : "border-campcareer-border hover:border-brand/40 hover:bg-secondary")}><span className="size-2 shrink-0 rounded-full bg-brand" /><span className={cn("min-w-0 flex-1 truncate text-sm font-semibold", isSelected ? "text-brand" : "text-campcareer-ink")}>{displayLabel}</span>{demand ? <Badge variant="success">{demand.rating.toUpperCase()}</Badge> : null}</button> })}</div>
          </section>

          <aside className="hidden min-w-0 lg:sticky lg:top-20 lg:col-span-4 lg:block lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto lg:pr-1 lg:pb-2">
            <div className="space-y-4">
              {grouped.map(([categoryId, careers]) => (
                <div key={categoryId}>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-xs font-semibold tracking-[0.08em] text-campcareer-muted">
                      {CATEGORY_LABELS.get(categoryId)}
                    </h2>
                    <span className="text-xs font-medium text-campcareer-muted">
                      {careers.length}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {careers.map((career) => {
                      const detail = getOccupationDetail(career.id)
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
                            "flex min-h-11 w-full items-center gap-2.5 rounded-cc-surface border bg-campcareer-surface px-3 py-2.5 text-left shadow-cc-surface transition-colors duration-cc-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                            isSelected
                              ? "border-brand bg-brand-tint"
                              : "border-campcareer-border hover:border-brand/40 hover:bg-secondary"
                          )}
                        >
                          <span
                            className="size-2 shrink-0 rounded-full bg-brand"
                          />
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-sm font-semibold",
                              isSelected ? "text-brand" : "text-campcareer-ink"
                            )}
                          >
                            {displayLabel}
                          </span>
                          {selectedScore != null ? (
                            <Badge variant="primary">{selectedScore}</Badge>
                          ) : demand ? (
                            <Badge variant="success">{demand.rating.toUpperCase()}</Badge>
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
              <EmptyState
                icon={<MousePointerClick className="size-6" />}
                title={`Pick a ${isCareerIndex ? "career" : "occupation"} to see its details`}
                detail="Search or browse the list. Available demand, pay and pathway context will update here."
                className="min-h-[420px]"
              />
            )}
          </section>
        </div>
      )}
      </>}
    </>
  )
}
