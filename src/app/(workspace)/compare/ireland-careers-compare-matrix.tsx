"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { ShareComparisonButton } from "@/components/compare/share-comparison-button"
import { CompareCell, CompareShell } from "@/components/ui/compare"
import { DataTable, DataTableCell, DataTableHeader, DataTableRow } from "@/components/ui/data-table"
import { trackAnalyticsEvent } from "@/lib/analytics"
import {
  buildIrelandCareerCompareHref,
  IE_CAREER_COMPARE_IDS,
  IE_CAREER_COMPARE_LABELS,
  IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR,
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

  const payProxy = IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR

  return (
    <CompareShell>
      <div className="border-b border-campcareer-border pb-5">
        <p className="text-xs font-semibold tracking-[0.08em] text-brand">Ireland Career MVP</p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-campcareer-ink">
          Compare reviewed Ireland careers
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-campcareer-ink-secondary">
          Choose two reviewed Ireland careers to compare the Demand, Pay and Entry evidence used
          on the six public Ireland Career pages. Pay currently uses the same broad official
          Professional-occupations proxy, so it should not be read as an exact salary difference
          between these careers.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2" aria-label="Choose careers to compare">
        {Array.from({ length: 2 }, (_, index) => {
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
                <option value="">Choose a career</option>
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
          {selected.length === 1
            ? "Select one more Ireland career to compare."
            : "Select two Ireland careers to compare."}
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

          <div className="mt-4 hidden md:block">
            <DataTable label="Ireland career comparison" className="table-fixed">
              <DataTableHeader>
                <DataTableRow>
                  <DataTableCell as="th" className="w-44">Metric</DataTableCell>
                  {selected.map((item) => (
                    <DataTableCell as="th" key={item.id}>{item.label}</DataTableCell>
                  ))}
                </DataTableRow>
              </DataTableHeader>
              <tbody>
                <DesktopRow label="CampCareer Score" values={selected.map((item) => `${item.score.total}/100`)} />
                <DesktopRow label="Demand" values={selected.map((item) => `${item.score.demand}/10`)} />
                <DesktopRow label="Pay" values={selected.map(() => payProxy)} />
                <DesktopRow label="Entry" values={selected.map((item) => `${item.score.entry}/10`)} />
                <DesktopRow label="Evidence confidence" values={selected.map((item) => confidenceLabel(item.confidence))} />
                <DesktopRow label="Official occupation scope" values={selected.map((item) => item.officialTitle ?? "—")} />
                <DesktopRow label="Registration" values={selected.map((item) => registrationLabel(item.registrationRequired))} />
                <DesktopRow
                  label="Key sources"
                  values={selected.map((item) => item.sourceLabels.length ? item.sourceLabels.join(" · ") : "—")}
                  secondary
                />
                <DesktopRow label="Evidence checked" values={selected.map((item) => item.sourceCheckedOn ?? "—")} />
              </tbody>
            </DataTable>
          </div>

          <div className="mt-4 divide-y divide-campcareer-border border-y border-campcareer-border md:hidden">
            {[
              { label: "CampCareer Score", values: selected.map((item) => `${item.score.total}/100`) },
              { label: "Demand", values: selected.map((item) => `${item.score.demand}/10`) },
              { label: "Pay", values: selected.map(() => payProxy) },
              { label: "Entry", values: selected.map((item) => `${item.score.entry}/10`) },
              { label: "Evidence confidence", values: selected.map((item) => confidenceLabel(item.confidence)) },
              { label: "Official occupation scope", values: selected.map((item) => item.officialTitle ?? "—") },
              { label: "Registration", values: selected.map((item) => registrationLabel(item.registrationRequired)) },
              {
                label: "Key sources",
                values: selected.map((item) => item.sourceLabels.length ? item.sourceLabels.join(" · ") : "—"),
                secondary: true,
              },
              { label: "Evidence checked", values: selected.map((item) => item.sourceCheckedOn ?? "—") },
            ].map((row) => (
              <div key={row.label} className="py-4">
                <p className="text-sm font-medium text-campcareer-ink-secondary">{row.label}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {selected.map((item, index) => (
                    <CompareCell key={`${row.label}-${item.id}`} label={item.label}>
                      <p className={`break-words text-sm font-semibold leading-5 text-campcareer-ink ${row.secondary ? "text-xs leading-5 text-campcareer-ink-secondary" : ""}`}>
                        {row.values[index]}
                      </p>
                    </CompareCell>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </CompareShell>
  )
}

function DesktopRow({
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