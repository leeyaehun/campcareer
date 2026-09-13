"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronRight, FileBadge2 } from "lucide-react"
import { VISA_KINDS, type VisaEntry } from "@/lib/workspace/visa-catalog"
import { getVisaDetail } from "@/lib/workspace/visa-detail-resolver"
import { visaPublicCanonicalPath } from "@/lib/workspace/visa-routes"
import { getCountryExplorer } from "@/lib/workspace/country-explorer"
import { CategorySearch } from "@/components/workspace/category-search"
import { CountryPill } from "@/components/workspace/country-pill"
import { useSelectedCountry } from "@/components/workspace/country-context"
import { VisaDetailPanel } from "./visa-detail-panel"
import { cn } from "@/lib/utils"

export function VisasExplorer({
  initialQuery,
  initialCountry,
  initialVisaName,
  catalog,
}: {
  initialQuery: string
  initialCountry: string
  initialVisaName?: string
  catalog: readonly VisaEntry[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selectedCountry } = useSelectedCountry()
  const [query, setQuery] = useState(initialQuery)
  const [kind, setKind] = useState<string>("all")
  const [country, setCountry] = useState<string>(initialCountry || "all")
  const [selectedKey, setSelectedKey] = useState<string | null>(() =>
    initialCountry && initialVisaName ? `${initialCountry}:${initialVisaName}` : null
  )

  const countries = useMemo(() => {
    const byCode = new Map<string, string>()
    for (const visa of catalog) {
      if (!byCode.has(visa.countryCode)) byCode.set(visa.countryCode, visa.country)
    }
    return [...byCode.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [catalog])

  useEffect(() => {
    const validUrlCountry = countries.some((item) => item.code === initialCountry)
      ? initialCountry
      : null
    if (validUrlCountry) {
      setCountry(validUrlCountry)
      return
    }
    if (selectedCountry && countries.some((item) => item.code === selectedCountry.code)) {
      setCountry(selectedCountry.code)
    }
  }, [initialCountry, selectedCountry, countries])

  useEffect(() => {
    if (!initialCountry || !initialVisaName) return
    setSelectedKey(`${initialCountry}:${initialVisaName}`)
  }, [initialCountry, initialVisaName])

  function updateCountry(code: string | null) {
    const nextCountry = code ?? "all"
    setCountry(nextCountry)
    setSelectedKey(null)

    const params = new URLSearchParams(searchParams.toString())
    if (nextCountry === "all") params.delete("country")
    else params.set("country", nextCountry)
    const nextQuery = params.toString()
    router.replace(nextQuery ? `/visas?${nextQuery}` : "/visas", { scroll: false })
  }

  function selectVisa(visa: VisaEntry) {
    setSelectedKey(`${visa.countryCode}:${visa.name}`)
    router.replace(visaPublicCanonicalPath(visa.countryCode, visa.name), { scroll: false })
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter((visa) => {
      if (kind !== "all" && visa.kind !== kind) return false
      if (country !== "all" && visa.countryCode !== country) return false
      if (!q) return true
      return (
        visa.name.toLowerCase().includes(q) ||
        visa.country.toLowerCase().includes(q) ||
        visa.note.toLowerCase().includes(q) ||
        visa.kind.toLowerCase().includes(q)
      )
    })
  }, [catalog, query, kind, country])

  const activeVisa = useMemo(() => {
    if (selectedKey) {
      const match = results.find((visa) => `${visa.countryCode}:${visa.name}` === selectedKey)
      if (match) return match
    }
    return results[0] ?? null
  }, [results, selectedKey])

  const activeDetail = activeVisa ? getVisaDetail(activeVisa.countryCode, activeVisa.name) : null
  const activeCities = activeVisa
    ? getCountryExplorer(activeVisa.countryCode)?.regions.flatMap((region) => region.cities)
    : undefined

  return (
    <>
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">Path context</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-[hsl(var(--cc-ink))] sm:text-3xl">Visa / work rights</h1>
          <CountryPill onChange={updateCountry} />
        </div>
        <p className="mt-2 text-sm leading-6 text-[hsl(var(--cc-muted))]">Use visa information to verify whether a career path is workable for you. Visa and work rights stay separate from the public CampCareer Score.</p>
      </header>

      <div className="mt-6 lg:max-w-xl">
        <CategorySearch value={query} onChange={setQuery} placeholder="Search visa or work-rights routes…" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Visa route type">
        <button type="button" onClick={() => setKind("all")} className={cn("rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition", kind === "all" ? "border-brand bg-brand text-white" : "border-[hsl(var(--cc-border))] bg-white text-[hsl(var(--cc-ink-secondary))] hover:border-brand/40 hover:text-brand")}>All</button>
        {VISA_KINDS.map((visaKind) => (
          <button key={visaKind} type="button" onClick={() => setKind(visaKind)} className={cn("rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition", kind === visaKind ? "border-brand bg-brand text-white" : "border-[hsl(var(--cc-border))] bg-white text-[hsl(var(--cc-ink-secondary))] hover:border-brand/40 hover:text-brand")}>
            {visaKind}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-b border-[hsl(var(--cc-border))] pb-3">
        <p className="text-[12.5px] font-medium text-[hsl(var(--cc-muted))]">{results.length} verified routes</p>
      </div>

      {results.length === 0 ? (
        <div className="mt-4 flex h-56 flex-col items-center justify-center rounded-lg border border-dashed border-[hsl(var(--cc-border))] bg-white text-center">
          <FileBadge2 className="size-6 text-[hsl(var(--cc-muted))]" />
          <p className="mt-3 text-[13.5px] font-medium text-[hsl(var(--cc-ink-secondary))]">No verified visa routes match this search.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 lg:grid-cols-5">
          <div className="flex min-w-0 flex-col divide-y divide-[hsl(var(--cc-border))] border-y border-[hsl(var(--cc-border))] lg:col-span-2">
            {results.map((visa) => {
              const key = `${visa.countryCode}:${visa.name}`
              const isActive = activeVisa !== null && key === `${activeVisa.countryCode}:${activeVisa.name}`
              return (
                <button key={key} type="button" onClick={() => selectVisa(visa)} className={cn("group px-2 py-4 text-left transition", isActive ? "bg-[hsl(var(--brand-tint))]" : "hover:bg-[hsl(var(--cc-canvas))]")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug text-[hsl(var(--cc-ink))]">{visa.name}</p>
                      <p className="mt-1 text-xs text-[hsl(var(--cc-muted))]">{visa.country} · {visa.kind}</p>
                    </div>
                    <ChevronRight className={cn("mt-0.5 size-4 shrink-0 transition", isActive ? "text-brand" : "text-[hsl(var(--cc-muted))] group-hover:text-brand")} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[hsl(var(--cc-ink-secondary))]">{visa.note}</p>
                </button>
              )
            })}
          </div>

          <div className="min-w-0 lg:col-span-3">
            {activeVisa && <VisaDetailPanel visa={activeVisa} detail={activeDetail} cities={activeCities} />}
          </div>
        </div>
      )}
    </>
  )
}
