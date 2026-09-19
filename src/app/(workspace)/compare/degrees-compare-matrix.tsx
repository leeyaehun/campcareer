"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { ShareComparisonButton } from "@/components/compare/share-comparison-button"
import { CompareCell, CompareShell } from "@/components/ui/compare"
import { DataTable, DataTableCell, DataTableHeader, DataTableRow } from "@/components/ui/data-table"
import { trackAnalyticsEvent } from "@/lib/analytics"
import { getIrelandCareerFutureSignal } from "@/lib/career-future-intelligence-model"
import { futureOutlookDirectionLabel } from "@/lib/career-future-intelligence-ui"
import {
  buildIrelandDegreeCompareHref,
  IRELAND_DEGREE_COMPARE_IDS,
  IRELAND_DEGREE_COMPARE_LABELS,
  normalizeIrelandDegreeIds,
  replaceIrelandDegreeAtIndex,
} from "@/lib/degree-match/ireland-degree-comparison"
import {
  degreeMatchBoundaryNote,
  degreeMatchConfidenceLabel,
  degreeMatchQualificationLabel,
  degreeMatchRelationshipTypeLabel,
  degreeMatchStrengthLabel,
} from "@/lib/degree-match/ireland-degree-match-ui"
import type { IrelandCareerDegreeMatch } from "@/lib/degree-match/ireland-model"

type Catalog = readonly IrelandCareerDegreeMatch[]

type DegreeColumn = {
  degreeId: IrelandCareerDegreeMatch["degreeId"]
  degreeLabel: string
  matches: readonly IrelandCareerDegreeMatch[]
  relatedCareers: string
  relationship: string
  strength: string
  confidence: string
  qualification: string
  regulation: string
  futureOutlook: readonly string[]
  futureDemand: readonly string[]
  evidenceChecked: string
}

function degreeCareerSignals(matches: readonly IrelandCareerDegreeMatch[], signal: "outlook" | "demand", locale: "en" | "ko") {
  return matches.map((match) => {
    const derived = getIrelandCareerFutureSignal(match.careerId, signal)
    const direction = derived ? futureOutlookDirectionLabel(derived.direction, locale) : null
    return direction ? `${match.careerLabel}: ${direction}` : `${match.careerLabel}: —`
  })
}

export default function DegreesCompareMatrix({ catalog }: { catalog: Catalog }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useRouteLocale()
  const selectedIds = normalizeIrelandDegreeIds(searchParams.get("degrees"))

  const catalogByDegree = useMemo(() => {
    const groups = new Map<string, readonly IrelandCareerDegreeMatch[]>()
    for (const match of catalog) {
      const existing = groups.get(match.degreeId) ?? []
      groups.set(match.degreeId, [...existing, match])
    }
    return groups
  }, [catalog])

  const columns: DegreeColumn[] = selectedIds
    .map((degreeId) => ({ degreeId, matches: catalogByDegree.get(degreeId) ?? [] }))
    .map(({ degreeId, matches }) => ({
      degreeId,
      degreeLabel: IRELAND_DEGREE_COMPARE_LABELS[degreeId],
      matches,
      relatedCareers: matches.map((match) => match.careerLabel).join(" · ") || "—",
      relationship: matches.map((match) => degreeMatchRelationshipTypeLabel(match.relationshipType, locale)).join(" · ") || "—",
      strength: matches.map((match) => degreeMatchStrengthLabel(match.relationshipStrength, locale)).join(" · ") || "—",
      confidence: matches.map((match) => degreeMatchConfidenceLabel(match.confidence, locale)).join(" · ") || "—",
      qualification: matches.map((match) => degreeMatchQualificationLabel(match.additionalQualification.state, locale)).join(" · ") || "—",
      regulation: matches.map((match) => match.regulation.summary).join(" · ") || "—",
      futureOutlook: degreeCareerSignals(matches, "outlook", locale),
      futureDemand: degreeCareerSignals(matches, "demand", locale),
      evidenceChecked: [...new Set(matches.map((match) => match.checkedDate))].join(" · ") || "—",
    }))

  const updateSlot = (index: number, value: string) => {
    const next = replaceIrelandDegreeAtIndex(selectedIds, index, value ? value : null)
    router.replace(buildIrelandDegreeCompareHref(next), { scroll: false })
  }

  const canCompare = selectedIds.length >= 2
  const completedComparison = useRef<string | null>(null)

  useEffect(() => {
    if (!canCompare) return
    const signature = selectedIds.join(",")
    if (completedComparison.current === signature) return
    completedComparison.current = signature
    trackAnalyticsEvent({
      name: "compare_complete",
      params: {
        entity_count: selectedIds.length,
        comparison_category: "degree",
      },
    })
  }, [canCompare, selectedIds])

  const boundary = degreeMatchBoundaryNote(locale)
  const futureAttribution =
    locale === "ko"
      ? "비교 테이블의 고용 전망·수요 값은 연결된 커리어에 속하며, 학위 자체의 점수나 임금이 아닙니다."
      : "Outlook and demand values in this table describe the related Career — never a Degree score or Degree-level salary."

  type MobileRow = { label: string; key: keyof DegreeColumn; secondary?: boolean }
  const mobileRows: MobileRow[] = [
    { label: "Related careers", key: "relatedCareers" },
    { label: "Relationship type", key: "relationship" },
    { label: "Relationship strength", key: "strength" },
    { label: "Evidence confidence", key: "confidence" },
    { label: "Additional qualification", key: "qualification" },
    { label: "Regulation / professional requirement", key: "regulation", secondary: true },
    { label: "Career future outlook (related Career)", key: "futureOutlook" },
    { label: "Career demand (related Career)", key: "futureDemand" },
    { label: "Evidence checked", key: "evidenceChecked" },
  ]

  const cellText = (column: DegreeColumn, key: keyof DegreeColumn): string => {
    const value = column[key] as string | readonly string[]
    return typeof value === "string" ? value : value.join(" · ")
  }

  const desktopSignalRows = [
    { label: "Related Career Future outlook", secondary: false, values: columns.map((column) => column.futureOutlook.join(" · ")) },
    { label: "Related Career Demand", secondary: false, values: columns.map((column) => column.futureDemand.join(" · ")) },
  ]

  return (
    <CompareShell>
      <div className="border-b border-campcareer-border pb-5">
        <p className="text-xs font-semibold tracking-[0.08em] text-brand">Ireland Degree Match</p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-campcareer-ink">
          Compare reviewed Ireland degrees
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-campcareer-ink-secondary">
          Choose two of the six reviewed Ireland Degrees to compare their verified Career relationships,
          evidence confidence and professional requirements. This compares canonical Degrees — never
          specific university programmes — and renders no Degree score or ranking.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2" aria-label="Choose degrees to compare">
        {Array.from({ length: 2 }, (_, index) => {
          const current = selectedIds[index] ?? ""
          return (
            <label key={index} className="block">
              <span className="mb-1.5 block text-xs font-semibold text-campcareer-muted">
                Degree {index + 1}
              </span>
              <select
                value={current}
                onChange={(event) => updateSlot(index, event.target.value)}
                className="min-h-11 w-full rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3 text-sm font-semibold text-campcareer-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                aria-label={`Choose degree ${index + 1}`}
              >
                <option value="">Choose a degree</option>
                {IRELAND_DEGREE_COMPARE_IDS.map((degreeId) => (
                  <option
                    key={degreeId}
                    value={degreeId}
                    disabled={selectedIds.some((selectedId, selectedIndex) =>
                      selectedIndex !== index && selectedId === degreeId
                    )}
                  >
                    {IRELAND_DEGREE_COMPARE_LABELS[degreeId]}
                  </option>
                ))}
              </select>
            </label>
          )
        })}
      </div>

      {!canCompare ? (
        <p className="mt-4 text-sm font-medium text-campcareer-ink-secondary" role="status">
          {selectedIds.length === 1
            ? "Select one more Ireland degree to compare."
            : "Select two Ireland degrees to compare."}
        </p>
      ) : (
        <>
          <div className="mt-5 flex justify-end">
            <ShareComparisonButton
              href={buildIrelandDegreeCompareHref(selectedIds)}
              title={`Compare ${columns.map((column) => column.degreeLabel).join(" and ")} in Ireland`}
              description="Compare the reviewed six-cohort Ireland Degrees — Career relationships, evidence confidence and professional requirements — on CampCareer."
              entityCount={columns.length}
              locale={locale}
              comparisonCategory="degree"
            />
          </div>

          <div className="mt-4 hidden md:block">
            <DataTable label="Ireland degree comparison" className="table-fixed">
              <DataTableHeader>
                <DataTableRow>
                  <DataTableCell as="th" className="w-44">Metric</DataTableCell>
                  {columns.map((column) => (
                    <DataTableCell as="th" key={column.degreeId}>{column.degreeLabel}</DataTableCell>
                  ))}
                </DataTableRow>
              </DataTableHeader>
              <tbody>
                <DesktopRow label="Related careers" values={columns.map((column) => column.relatedCareers)} />
                <DesktopRow label="Relationship type" values={columns.map((column) => column.relationship)} />
                <DesktopRow label="Relationship strength" values={columns.map((column) => column.strength)} />
                <DesktopRow label="Evidence confidence" values={columns.map((column) => column.confidence)} />
                <DesktopRow label="Additional qualification" values={columns.map((column) => column.qualification)} />
                <DesktopRow label="Regulation / professional requirement" values={columns.map((column) => column.regulation)} secondary />
                <tr>
                  <td colSpan={columns.length + 1} className="bg-campcareer-canvas px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-campcareer-muted">Career future (related Career, not the Degree)</td>
                </tr>
                {desktopSignalRows.map((row) => (
                  <DesktopRow key={row.label} label={row.label} values={row.values} secondary />
                ))}
                <DesktopRow label="Evidence checked" values={columns.map((column) => column.evidenceChecked)} />
              </tbody>
            </DataTable>
            <p className="mt-3 text-xs leading-5 text-campcareer-muted">{boundary} {futureAttribution}</p>
          </div>

          <div className="mt-4 divide-y divide-campcareer-border border-y border-campcareer-border md:hidden">
            {mobileRows.map((row) => (
              <div key={row.label} className="py-4">
                <p className="text-sm font-medium text-campcareer-ink-secondary">{row.label}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {columns.map((column) => (
                    <CompareCell key={`${row.label}-${column.degreeId}`} label={column.degreeLabel}>
                      <p className={`break-words text-sm font-semibold leading-5 text-campcareer-ink ${row.secondary ? "text-xs leading-5 text-campcareer-ink-secondary" : "text-xs leading-5 text-campcareer-ink-secondary"}`}>
                        {cellText(column, row.key)}
                      </p>
                    </CompareCell>
                  ))}
                </div>
              </div>
            ))}
            <p className="py-3 text-xs leading-5 text-campcareer-muted">{boundary} {futureAttribution}</p>
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