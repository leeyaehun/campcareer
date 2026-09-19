"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { trackAnalyticsEvent } from "@/lib/analytics"
import type { IrelandDegreeDiscoveryEntry } from "@/lib/degree-match/ireland-degree-discovery"
import type { DegreeMatchRelationshipType } from "@/lib/degree-match/contract"

type DegreeFilters = {
  career: string | null
  relationship: DegreeMatchRelationshipType | null
  regulation: boolean
}

function parseFilters(params: URLSearchParams): DegreeFilters {
  return {
    career: params.get("career")?.trim().toLowerCase() || null,
    relationship: params.get("relationship") as DegreeMatchRelationshipType | null,
    regulation: params.get("regulation") === "1",
  }
}

function entryMatches(entry: IrelandDegreeDiscoveryEntry, filters: DegreeFilters) {
  if (filters.career && !entry.careers.some((career) => career.careerId === filters.career)) return false
  if (filters.relationship && !entry.careers.some((career) => career.relationshipType === filters.relationship)) return false
  if (filters.regulation && !entry.qualificationFilter) return false
  return true
}

const RELATIONSHIP_ORDER: readonly DegreeMatchRelationshipType[] = ["direct", "common", "alternative"]

export function IrelandDegreesExplorer({ entries }: { entries: readonly IrelandDegreeDiscoveryEntry[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = parseFilters(searchParams)

  const careerOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const entry of entries) {
      for (const career of entry.careers) {
        if (!seen.has(career.careerId)) seen.set(career.careerId, career.careerLabel)
      }
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }))
  }, [entries])

  const relationshipOptions = useMemo(() => {
    const present = new Set<DegreeMatchRelationshipType>()
    for (const entry of entries) {
      for (const career of entry.careers) present.add(career.relationshipType)
    }
    return RELATIONSHIP_ORDER.filter((type) => present.has(type))
  }, [entries])

  const filtered = useMemo(() => entries.filter((entry) => entryMatches(entry, filters)), [entries, filters])

  const [selectedId, setSelectedId] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    const hash = window.location.hash.replace(/^#/, "")
    return hash.startsWith("degree-") ? hash.slice("degree-".length) : ""
  })

  const activeDegree = filtered.find((entry) => entry.degreeId === selectedId) ?? filtered[0] ?? null
  const inspectorRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!activeDegree) return
    const target = `degree-${activeDegree.degreeId}`
    if (window.location.hash !== `#${target}`) {
      router.replace(`${pathname}?${searchParams.toString()}#${target}`, { scroll: false })
    }
    const inViewport = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= window.innerHeight
    }
    if (inspectorRef.current && !inViewport(inspectorRef.current)) {
      inspectorRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [activeDegree, pathname, router, searchParams])

  function updateFilter(next: Partial<DegreeFilters>) {
    const params = new URLSearchParams(searchParams.toString())
    if (next.career !== undefined) {
      if (next.career) params.set("career", next.career)
      else params.delete("career")
    }
    if (next.relationship !== undefined) {
      if (next.relationship) params.set("relationship", next.relationship)
      else params.delete("relationship")
    }
    if (next.regulation !== undefined) {
      if (next.regulation) params.set("regulation", "1")
      else params.delete("regulation")
    }
    const activeHash = activeDegree ? `#degree-${activeDegree.degreeId}` : ""
    router.replace(`/countries/ie/degrees?${params.toString()}${activeHash}`, { scroll: false })
    trackAnalyticsEvent({
      name: "filter_apply",
      params: { search_location: "careers", entity_filter: Object.keys(next).join(",") },
    })
  }

  const chipClass = (active: boolean) =>
    `inline-flex min-h-9 items-center rounded-full border px-3 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
      active
        ? "border-[#3e7a2e] bg-[#f0f7ee] text-[#356a28]"
        : "border-campcareer-border bg-campcareer-surface text-campcareer-ink-secondary hover:border-brand/40 hover:text-brand"
    }`

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2" role="group" aria-label="Degree filters">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">Career</span>
          <button type="button" className={chipClass(!filters.career)} onClick={() => updateFilter({ career: null })}>All</button>
          {careerOptions.map((career) => (
            <button
              key={career.id}
              type="button"
              className={chipClass(filters.career === career.id)}
              onClick={() => updateFilter({ career: filters.career === career.id ? null : career.id })}
              aria-pressed={filters.career === career.id}
            >
              {career.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">Pathway</span>
          <button type="button" className={chipClass(!filters.relationship)} onClick={() => updateFilter({ relationship: null })}>All</button>
          {relationshipOptions.map((type) => (
            <button
              key={type}
              type="button"
              className={chipClass(filters.relationship === type)}
              onClick={() => updateFilter({ relationship: filters.relationship === type ? null : type })}
              aria-pressed={filters.relationship === type}
            >
              {relationshipTypeChipLabel(type)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={chipClass(filters.regulation)}
          onClick={() => updateFilter({ regulation: !filters.regulation })}
          aria-pressed={filters.regulation}
        >
          Regulated / additional qualification
        </button>
      </div>

      <p className="mt-2 text-[11px] leading-5 text-campcareer-muted" role="status">
        {filtered.length === entries.length
          ? `${entries.length} reviewed Ireland Degrees`
          : `${filtered.length} of ${entries.length} reviewed Ireland Degrees`}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#dcdad4] bg-campcareer-canvas p-6 text-center">
              <p className="text-sm font-medium text-campcareer-ink-secondary">No Degrees match these filters.</p>
              <button
                type="button"
                onClick={() => updateFilter({ career: null, relationship: null, regulation: false })}
                className="mt-2 text-sm font-semibold text-brand hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="min-w-0 grid gap-4 md:grid-cols-2">
              {filtered.map((entry) => (
                <DegreeCard
                  key={entry.degreeId}
                  entry={entry}
                  active={activeDegree?.degreeId === entry.degreeId}
                  onSelect={() => setSelectedId(entry.degreeId)}
                />
              ))}
            </div>
          )}
        </div>

        <aside
          ref={inspectorRef}
          className="scroll-mt-24 rounded-xl border border-campcareer-border bg-campcareer-surface p-5 lg:sticky lg:top-24"
          aria-live="polite"
          aria-label="Selected degree details"
        >
          {activeDegree ? <DegreeInspector entry={activeDegree} /> : (
            <p className="text-sm text-campcareer-muted">Select a degree to inspect its details.</p>
          )}
        </aside>
      </div>

      <p className="mt-4 text-[11px] leading-5 text-campcareer-muted">
        Filtered views keep their context in this page&apos;s query string and are not indexed. The base
        Degrees surface is the only indexable form of this route.
      </p>
    </div>
  )
}

function relationshipTypeChipLabel(type: DegreeMatchRelationshipType) {
  switch (type) {
    case "direct":
      return "Direct"
    case "common":
      return "Common"
    case "alternative":
      return "Alternative"
    default:
      return type
  }
}

function DegreeCard({
  entry,
  active,
  onSelect,
}: {
  entry: IrelandDegreeDiscoveryEntry
  active: boolean
  onSelect: () => void
}) {
  const lead = entry.careers[0]
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`min-w-0 rounded-xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
        active
          ? "border-[#3e7a2e] bg-[#f4faf2] shadow-cc-surface"
          : "border-campcareer-border bg-campcareer-surface hover:border-[#b9cdb2] hover:shadow-sm"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">Degree</p>
      <h3 className="mt-1 text-[16px] font-semibold tracking-[-0.01em] text-campcareer-ink">{entry.degreeLabel}</h3>
      {lead ? (
        <>
          <p className="mt-1.5 text-xs font-semibold text-campcareer-ink-secondary">
            {lead.relationshipTypeLabel} · {lead.relationshipStrengthLabel}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Link
              href={lead.careerPath}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-md border border-campcareer-border bg-campcareer-canvas px-2.5 py-1.5 text-[11px] font-semibold text-brand hover:border-brand/40 hover:underline"
            >
              {lead.careerLabel}
            </Link>
            {lead.careerOutlookLabels.length > 0 ? (
              <span className="text-[11px] font-medium text-campcareer-muted">{lead.careerOutlookLabels.join(" · ")}</span>
            ) : null}
          </div>
        </>
      ) : null}
      {entry.careers.length > 1 ? (
        <p className="mt-3 text-[11px] leading-5 text-campcareer-muted">
          +{entry.careers.length - 1} more connected Career{entry.careers.length > 2 ? "s" : ""}
        </p>
      ) : null}
    </button>
  )
}

function DegreeInspector({ entry }: { entry: IrelandDegreeDiscoveryEntry }) {
  return (
    <div id={`degree-${entry.degreeId}`} className="scroll-mt-24">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">Selected degree</p>
      <h3 className="mt-1 text-lg font-semibold tracking-[-0.015em] text-campcareer-ink">{entry.degreeLabel}</h3>

      <div className="mt-3 space-y-3">
        {entry.careers.map((career) => (
          <article key={career.careerId} className="rounded-lg border border-campcareer-border bg-campcareer-canvas p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={career.careerPath}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
              >
                {career.careerLabel} <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              {career.careerOutlookLabels.length > 0 ? (
                <span className="text-[11px] font-medium text-campcareer-muted">{career.careerOutlookLabels.join(" · ")}</span>
              ) : null}
            </div>
            <p className="mt-2 text-xs font-semibold text-campcareer-ink-secondary">
              {career.relationshipTypeLabel} · {career.relationshipStrengthLabel} · {career.confidenceLabel}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-5 text-campcareer-ink-secondary">{career.interpretation}</p>
            {career.qualificationLabel ? (
              <p className="mt-2.5 text-[12.5px] font-semibold leading-5 text-campcareer-ink">
                {career.qualificationNote}: {career.qualificationLabel}
              </p>
            ) : null}
            {career.regulatedCareer ? (
              <p className="mt-1.5 text-[11.5px] leading-5 text-campcareer-muted">
                {career.regulationNote}: {career.regulationSummary}
                {career.regulatorUrl ? (
                  <>
                    {" "}
                    <a
                      href={career.regulatorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold text-brand hover:underline"
                    >
                      {career.regulatorName} <ExternalLink className="size-2.5" aria-hidden="true" />
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-5 text-campcareer-muted">{entry.boundaryNote}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={entry.compareHref}
          className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-[#3e7a2e] px-3.5 text-[12px] font-semibold text-white hover:bg-[#356a28]"
        >
          Compare degrees <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
        <Link
          href={entry.educationPath}
          className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-campcareer-border bg-campcareer-canvas px-3.5 text-[12px] font-semibold text-campcareer-ink-secondary hover:border-brand/40 hover:text-brand"
        >
          Education &amp; institutions <ExternalLink className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}