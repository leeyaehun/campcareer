"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { ShareComparisonButton } from "@/components/compare/share-comparison-button"
import { CompareShell } from "@/components/ui/compare"
import { DataTable, DataTableCell, DataTableHeader, DataTableRow } from "@/components/ui/data-table"
import { trackAnalyticsEvent } from "@/lib/analytics"
import {
  buildIrelandCareerCompareHref,
  IE_CAREER_COMPARE_IDS,
  IE_CAREER_COMPARE_LABELS,
  IE_CAREER_COMPARE_MAX_CAREERS,
  normalizeIrelandCareerIds,
  replaceIrelandCareerAtIndex,
  type IrelandCareerCompareItem,
} from "@/lib/ireland-career-comparison"

function confidenceLabel(value: IrelandCareerCompareItem["confidence"]) {
  if (value === "verified") return "Verified"
  if (value === "estimated") return "Estimated"
  return "Limited evidence"
}

function registrationLabel(value: boolean | null) {
  if (value === true) return "Required / regulated"
  if (value === false) return "No universal registration"
  return "Check role requirements"
}

export function IrelandCareersCompareMatrix({
  catalog,
}: {
  catalog: readonly IrelandCareerCompareItem[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useRouteLocale()
  const selectedIds = normalizeIrelandCareerIds(searchParams.get("careers"))
  const catalogById = new Map(catalog.map((item) => [item.id, item]))
  const selected = selectedIds
    .map((id) => catalogById.get(id))
    .filter((item): item is IrelandCareerCompareItem => Boolean(item))

  const updateSlot = (index: number, value: string) => {
    const next = replaceIrelandCareerAtIndex(
      selectedIds,
      index,
      value ? value : null,
    )
    router.replace(buildIrelandCareerCompareHref(next), { scroll: false })
  }

  const canCompare = selected.length >= 2
  const completedComparison = useRef<string | null>(null)

  useEffect(() => {
    if (!canCompare) return
    const signature = selectedIds.join(",")
    if (completedComparison.current === signature) return
    completedComparison.current = signature
    trackAnalyticsEvent({
      name: "compare_complete",
      params: {
        entity_count: selected.length,
        comparison_category: "career",
      },
    })
  }, [canCompare, selected.length, selectedIds])

  return (
    <CompareShell>
      <div className="border-b border-campcareer-border pb-5">
        <p className="text-xs font-semibold tracking-[0.08em] text-brand">Ireland Career MVP</p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-campcareer-ink">
          Compare reviewed Ireland careers
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-campcareer-ink-secondary">
          Compare the same reviewed Demand, Pay and Entry dimensions used on the six public Ireland Career pages.
          Pay currently uses the same broad official Professional-occupations proxy, so it should not be read as an exact salary difference between these careers.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3" aria-label="Choose careers to compare">
        {Array.from({ length: IE_CAREER_COMPARE_MAX_CAREERS }, (_, index) => {
          const current = selectedIds[index] ?? ""
          return (
            <label key={index} className="block">
              <span className="mb-1.5 block text-xs font-semibold text-campcareer-muted">
                Career {index + 1}
              </span>
              <select
                value={current}
                onChange={(event) => updateSlot(index, event.target.value)}
                className="min-h-11 w-full rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3 text-sm font-semibold text-campcareer-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                aria-label={`Choose career ${index + 1}`}
              >
                <option value="">{index < 2 ? "Choose a career" : "Optional third career"}</option>
                {IE_CAREER_COMPARE_IDS.map((careerId) => (
                  <option
                    key={careerId}
                    value={careerId}
                    disabled={selectedIds.some((selectedId, selectedIndex) =>
                      selectedIndex !== index && selectedId === careerId
                    )}
                  >
                    {IE_CAREER_COMPARE_LABELS[careerId]}
                  </option>
                ))}
              </select>
            </label>
          )
        })}
      </div>

      {!canCompare ? (
        <p className="mt-4 text-sm font-medium text-campcareer-ink-secondary" role="status">
          Select at least two Ireland careers to compare.
        </p>
      ) : (
        <>
          <div className="mt-5 flex justify-end">
            <ShareComparisonButton
              href={buildIrelandCareerCompareHref(selectedIds)}
              title={`Compare ${selected.map((item) => item.label).join(" and ")} in Ireland`}
              description="Compare reviewed Ireland career scores, evidence confidence and entry requirements on CampCareer."
              entityCount={selected.length}
              locale={locale}
            />
          </div>

          <div className="mt-4">
            <DataTable label="Ireland career comparison" className="min-w-[48rem] table-fixed">
              <DataTableHeader>
                <DataTableRow>
                  <DataTableCell as="th" className="w-44">Metric</DataTableCell>
                  {selected.map((item) => (
                    <DataTableCell as="th" key={item.id}>{item.label}</DataTableCell>
                  ))}
                </DataTableRow>
              </DataTableHeader>
              <tbody>
                <CompareRow label="CampCareer Score" values={selected.map((item) => `${item.score.total}/100`)} />
                <CompareRow label="Demand" values={selected.map((item) => `${item.score.demand}/10`)} />
                <CompareRow label="Pay" values={selected.map((item) => `${item.score.pay}/10`)} />
                <CompareRow label="Entry" values={selected.map((item) => `${item.score.entry}/10`)} />
                <CompareRow label="Evidence confidence" values={selected.map((item) => confidenceLabel(item.confidence))} />
                <CompareRow label="Official occupation scope" values={selected.map((item) => item.officialTitle ?? "—")} />
                <CompareRow label="Registration" values={selected.map((item) => registrationLabel(item.registrationRequired))} />
                <CompareRow
                  label="Key sources"
                  values={selected.map((item) => item.sourceLabels.length ? item.sourceLabels.join(" · ") : "—")}
                  secondary
                />
                <CompareRow label="Evidence checked" values={selected.map((item) => item.sourceCheckedOn ?? "—")} />
              </tbody>
            </DataTable>
          </div>
        </>
      )}
    </CompareShell>
  )
}

function CompareRow({
  label,
  values,
  secondary = false,
}: {
  label: string
  values: readonly string[]
  secondary?: boolean
}) {
  return (
    <DataTableRow>
      <DataTableCell as="th" className="font-semibold text-campcareer-ink-secondary">
        {label}
      </DataTableCell>
      {values.map((value, index) => (
        <DataTableCell
          key={`${label}-${index}`}
          className={secondary ? "text-xs leading-5 text-campcareer-ink-secondary" : "font-semibold text-campcareer-ink"}
        >
          {value}
        </DataTableCell>
      ))}
    </DataTableRow>
  )
}
