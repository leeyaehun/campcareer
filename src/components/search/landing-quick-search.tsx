"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BriefcaseBusiness,
  Building2,
  Globe2,
  GraduationCap,
  Loader2,
  Search,
} from "lucide-react"
import type { QuickSearchGroupedResults, QuickSearchResult } from "@/lib/search/quick-search-index"
import { cn } from "@/lib/utils"

const DEBOUNCE_MS = 300

const GROUP_META: Record<keyof Pick<QuickSearchGroupedResults, "countries" | "majors" | "careers" | "institutions">, {
  label: string
  icon: typeof Globe2
}> = {
  countries: { label: "Countries", icon: Globe2 },
  majors: { label: "Study fields", icon: GraduationCap },
  careers: { label: "Careers", icon: BriefcaseBusiness },
  institutions: { label: "Institutions", icon: Building2 },
}

const GROUP_ORDER: (keyof typeof GROUP_META)[] = ["countries", "majors", "careers", "institutions"]

export function LandingQuickSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<QuickSearchGroupedResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeLabel, setActiveLabel] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const normalized = query.trim()
    if (normalized.length < 2) {
      setResults(null)
      setActiveLabel("")
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ q: normalized })
      fetch(`/api/v1/quick-search?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Quick search failed: ${response.status}`)
          return response.json() as Promise<QuickSearchGroupedResults>
        })
        .then((data) => {
          setResults(data)
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return
          setResults(null)
        })
        .finally(() => {
          setLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const flatResults = useMemo(() => {
    if (!results) return []
    return GROUP_ORDER.flatMap((group) =>
      results[group].map((entry) => ({ ...entry, group })),
    )
  }, [results])

  useEffect(() => {
    if (!open || flatResults.length === 0) return
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open, flatResults.length])

  function pick(entry: QuickSearchResult) {
    setOpen(false)
    inputRef.current?.blur()
    router.push(entry.href)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || flatResults.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      const current = flatResults.findIndex((entry) => entry.label === activeLabel)
      const next = (current + 1) % flatResults.length
      setActiveLabel(flatResults[next].label)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      const current = flatResults.findIndex((entry) => entry.label === activeLabel)
      const previous = (current - 1 + flatResults.length) % flatResults.length
      setActiveLabel(flatResults[previous].label)
    } else if (event.key === "Enter") {
      event.preventDefault()
      const active = flatResults.find((entry) => entry.label === activeLabel) ?? flatResults[0]
      if (active) pick(active)
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  const hasResults = flatResults.length > 0

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-campcareer-muted" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            setActiveLabel("")
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search countries, study fields, careers, institutions…"
          aria-label="Quick search CampCareer"
          aria-expanded={open}
          aria-controls="landing-quick-search-suggestions"
          aria-activedescendant={hasResults ? `landing-quick-search-option-${activeLabel}` : undefined}
          className="h-14 w-full appearance-none rounded-2xl border border-campcareer-border bg-white px-4 pl-12 pr-4 text-base text-campcareer-ink shadow-cc-surface outline-none transition placeholder:text-campcareer-muted focus:border-ring focus:ring-2 focus:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {loading && (
          <Loader2 className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-campcareer-muted" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div
          id="landing-quick-search-suggestions"
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-96 overflow-y-auto rounded-2xl border border-campcareer-border bg-white p-2 shadow-xl shadow-black/5"
          onMouseDown={(event) => event.preventDefault()}
        >
          {loading && results == null && (
            <p className="px-3 py-8 text-center text-sm text-campcareer-muted">Searching…</p>
          )}

          {!loading && hasResults && (
            <ul>
              {GROUP_ORDER.flatMap((group) => {
                const entries = results?.[group] ?? []
                if (entries.length === 0) return []
                const meta = GROUP_META[group]
                const Icon = meta.icon
                return [
                  <li
                    key={`${group}-header`}
                    className="flex items-center gap-2 px-3 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted"
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {meta.label}
                  </li>,
                  ...entries.map((entry) => (
                    <li key={`${group}-${entry.id}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={activeLabel === entry.label}
                        id={`landing-quick-search-option-${entry.label}`}
                        onMouseEnter={() => setActiveLabel(entry.label)}
                        onClick={() => pick(entry)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition",
                          activeLabel === entry.label ? "bg-brand-tint" : "hover:bg-campcareer-surface",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-campcareer-ink">
                            {entry.label}
                          </span>
                          {entry.labelKo && (
                            <span className="block truncate text-xs text-campcareer-muted">{entry.labelKo}</span>
                          )}
                        </span>
                        <span className="truncate text-xs text-campcareer-muted">{entry.href}</span>
                      </button>
                    </li>
                  )),
                ]
              })}
            </ul>
          )}

          {!loading && !hasResults && query.trim().length >= 2 && (
            <p className="px-3 py-8 text-center text-sm text-campcareer-muted">
              No results for “{query.trim()}”.
            </p>
          )}
        </div>
      )}
    </div>
  )
}