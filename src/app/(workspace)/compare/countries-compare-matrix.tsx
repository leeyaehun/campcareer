"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Plus, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { trackAnalyticsEvent } from "@/lib/analytics"
import {
  COUNTRY_COMPARE_MAX_COUNTRIES,
  addCountrySlot,
  buildCountryCompareHref,
  cancelEmptyCountrySlot,
  completeCountryCodes,
  parseCountryComparisonState,
  removeCountrySlot,
  replaceCountryInSlot,
  slotsFromCountryCodes,
  type CountryCompareSlot,
} from "@/lib/country-comparison"
import {
  COUNTRY_COMPARE_CATALOG,
  getCountryCompareCountry,
  type CountryCompareCode,
} from "@/data/country-comparison/locations"
import { getRegisteredNurseCountryShell } from "@/data/country-comparison/registered-nurse"
import {
  formatCountryComparisonRow,
  REGISTERED_NURSE_MATRIX_ROWS,
  type CountryComparisonRowDefinition,
} from "@/data/country-comparison/registered-nurse-rows"

type CountriesCompareMatrixProps = {
  initialCountries: readonly CountryCompareCode[]
}

type MatrixRow = {
  key: string
  label: string
  section: string
  values: readonly string[]
}

const NOT_AVAILABLE = "—"

export default function CountriesCompareMatrix({ initialCountries }: CountriesCompareMatrixProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlKey = searchParams.toString()
  const writtenUrlKey = useRef<string | null>(null)
  const parsed = useMemo(() => parseCountryComparisonState(searchParams), [searchParams])
  const [slots, setSlots] = useState<CountryCompareSlot[]>(() => slotsFromCountryCodes(initialCountries))

  useEffect(() => {
    if (writtenUrlKey.current === urlKey) {
      writtenUrlKey.current = null
      return
    }
    setSlots(slotsFromCountryCodes(parsed.countries))
  }, [parsed.countries, urlKey])

  const selectedCodes = completeCountryCodes(slots)
  const completeCount = selectedCodes.length
  const hasIncompleteSlot = slots.some((slot) => !slot.countryCode)
  const canAddCountry = completeCount >= 2 && completeCount < COUNTRY_COMPARE_MAX_COUNTRIES && !hasIncompleteSlot
  const rows = useMemo(() => buildMatrixRows(slots), [slots])
  const selectedCountryCodes = slots.flatMap((current) => current.countryCode ? [current.countryCode] : [])
  const completedComparison = useRef<string | null>(null)

  useEffect(() => {
    if (completeCount < 2) return
    const signature = selectedCodes.join(",")
    if (completedComparison.current === signature) return
    completedComparison.current = signature
    trackAnalyticsEvent({
      name: "compare_complete",
      params: { entity_count: completeCount, comparison_category: "country" },
    })
  }, [completeCount, selectedCodes])

  function syncUrl(nextSlots: readonly CountryCompareSlot[]) {
    const href = buildCountryCompareHref(completeCountryCodes(nextSlots))
    writtenUrlKey.current = new URL(href, "https://campcareer.local").searchParams.toString()
    router.replace(href, { scroll: false })
  }

  function commit(nextSlots: CountryCompareSlot[]) {
    setSlots(nextSlots)
    syncUrl(nextSlots)
  }

  function handleCountryChange(index: number, rawCountryCode: string) {
    const country = getCountryCompareCountry(rawCountryCode)
    if (!country) return
    commit(replaceCountryInSlot(slots, index, country.productCode))
  }

  function handleRemove(index: number) {
    commit(removeCountrySlot(slots, index))
  }

  function handleAdd() {
    setSlots(addCountrySlot(slots))
  }

  function handleCancel(index: number) {
    setSlots(cancelEmptyCountrySlot(slots, index))
  }

  return (
    <section className="mt-1" aria-label="Country comparison">
      <div className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-5 shadow-cc-surface sm:p-6">
        <h2 className="text-lg font-bold tracking-[-0.02em] text-campcareer-ink">
          Registered Nurse pathway context
        </h2>
        <p className="mt-1 text-sm leading-6 text-campcareer-ink-secondary">
          Select two countries to compare the reviewed study, visa and outcome context for this career profile.
        </p>
      </div>

      {completeCount < 2 ? (
        <p className="mb-3 mt-4 text-sm font-medium text-campcareer-ink-secondary" role="status">
          {completeCount === 1 ? "Select one more country to compare." : "Select two countries to start comparing."}
        </p>
      ) : null}

      <DesktopCountryMatrix
        rows={rows}
        slots={slots}
        canAddCountry={canAddCountry}
        onAddCountry={handleAdd}
        selectedCountryCodes={selectedCountryCodes}
        onCountryChange={handleCountryChange}
        onRemove={handleRemove}
        onCancel={handleCancel}
      />

      <MobileCountryMatrix
        rows={rows}
        slots={slots}
        canAddCountry={canAddCountry}
        onAddCountry={handleAdd}
        selectedCountryCodes={selectedCountryCodes}
        onCountryChange={handleCountryChange}
        onRemove={handleRemove}
        onCancel={handleCancel}
      />

      {completeCount >= 2 ? (
        <p className="mt-5 text-xs leading-5 text-campcareer-muted">Verified fields only. Missing values are shown as —.</p>
      ) : null}
    </section>
  )
}

function CountryColumnControls({
  index,
  slot,
  selectedCountryCodes,
  onCountryChange,
  onRemove,
  onCancel,
  compact = false,
}: {
  index: number
  slot: CountryCompareSlot
  selectedCountryCodes: readonly CountryCompareCode[]
  onCountryChange: (index: number, countryCode: string) => void
  onRemove: (index: number) => void
  onCancel: (index: number) => void
  compact?: boolean
}) {
  const country = slot.countryCode ? getCountryCompareCountry(slot.countryCode) : null
  const countryName = country?.countryName ?? "Choose country"

  return (
    <div className={`relative min-w-0 ${compact ? "rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-2" : "p-1"}`}>
      <label className="relative block min-w-0 rounded-cc-control border border-campcareer-border bg-campcareer-surface shadow-cc-surface transition-colors duration-cc-fast focus-within:border-brand focus-within:ring-2 focus-within:ring-ring/30">
        <span className="sr-only">Country {index + 1}</span>
        <span aria-hidden="true" className="pointer-events-none flex min-h-11 items-center gap-2 px-3">
          <span className={`truncate text-sm font-semibold ${country ? "text-campcareer-ink" : "text-campcareer-muted"}`}>{countryName}</span>
          {country ? <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">{country.productCode}</span> : null}
          <ChevronDown className="ml-auto size-4 shrink-0 text-campcareer-muted" aria-hidden="true" />
        </span>
        <select
          aria-label={`Country ${index + 1}`}
          value={slot.countryCode ?? ""}
          onChange={(event) => onCountryChange(index, event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          <option value="">Choose country</option>
          {COUNTRY_COMPARE_CATALOG.map((option) => (
            <option key={option.productCode} value={option.productCode} disabled={option.productCode !== slot.countryCode && selectedCountryCodes.includes(option.productCode)}>
              {option.countryName} ({option.productCode})
            </option>
          ))}
        </select>
      </label>

      {slot.countryCode ? (
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${country?.countryName ?? "country"} from comparison`}
          className="absolute right-2 top-2 z-10 inline-flex size-9 items-center justify-center rounded-cc-control text-campcareer-muted transition-colors duration-cc-fast hover:bg-secondary hover:text-campcareer-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : slot.optional ? (
        <button
          type="button"
          onClick={() => onCancel(index)}
          aria-label={`Cancel country ${index + 1}`}
          className="absolute right-2 top-2 z-10 min-h-9 rounded-cc-control px-2 text-xs font-semibold text-campcareer-ink-secondary transition-colors duration-cc-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          Cancel
        </button>
      ) : null}
    </div>
  )
}

type CountrySelectorProps = {
  selectedCountryCodes: readonly CountryCompareCode[]
  onCountryChange: (index: number, countryCode: string) => void
  onRemove: (index: number) => void
  onCancel: (index: number) => void
}

function DesktopCountryMatrix({
  rows,
  slots,
  canAddCountry,
  onAddCountry,
  ...selectorProps
}: {
  rows: readonly MatrixRow[]
  slots: readonly CountryCompareSlot[]
  canAddCountry: boolean
  onAddCountry: () => void
} & CountrySelectorProps) {
  const canCompare = completeCountryCodes(slots).length >= 2

  return (
    <div className="hidden overflow-hidden rounded-cc-large border border-campcareer-border bg-campcareer-surface shadow-cc-surface md:block">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead>
            <tr>
              <th scope="col" className="border-b border-campcareer-border bg-campcareer-surface px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-campcareer-muted xl:w-44">
                <div className="flex items-center justify-between gap-2">
                  <span>Compare</span>
                  {canAddCountry ? (
                    <button type="button" onClick={onAddCountry} aria-label="Add a third country" className="inline-flex size-9 items-center justify-center rounded-cc-control text-brand transition-colors duration-cc-fast hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                      <Plus aria-hidden="true" className="size-4" />
                    </button>
                  ) : null}
                </div>
              </th>
              {slots.map((slot, index) => (
                <th key={`${index}-${slot.countryCode ?? "empty"}`} scope="col" className="border-b border-l border-campcareer-border bg-campcareer-surface px-2 py-2 align-top">
                  <CountryColumnControls index={index} slot={slot} {...selectorProps} />
                </th>
              ))}
            </tr>
          </thead>
          {canCompare ? (
            <tbody>
              {rows.map((row, index) => (
                <MatrixDesktopRow key={row.key} row={row} isSectionStart={index === 0 || rows[index - 1].section !== row.section} />
              ))}
            </tbody>
          ) : null}
        </table>
      </div>
    </div>
  )
}

function MatrixDesktopRow({ row, isSectionStart }: { row: MatrixRow; isSectionStart: boolean }) {
  return (
    <>
      {isSectionStart ? (
        <tr>
          <th colSpan={row.values.length + 1} className="border-b border-campcareer-border bg-campcareer-canvas px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-campcareer-muted">{row.section}</th>
        </tr>
      ) : null}
      <tr>
        <th scope="row" className="border-b border-campcareer-border bg-campcareer-surface px-4 py-4 align-top text-sm font-medium text-campcareer-ink-secondary">{row.label}</th>
        {row.values.map((value, index) => (
          <td key={`${row.key}-${index}`} className="border-b border-l border-campcareer-border px-5 py-4 align-top text-sm font-semibold leading-6 text-campcareer-ink">{value}</td>
        ))}
      </tr>
    </>
  )
}

function MobileCountryMatrix({
  rows,
  slots,
  canAddCountry,
  onAddCountry,
  ...selectorProps
}: {
  rows: readonly MatrixRow[]
  slots: readonly CountryCompareSlot[]
  canAddCountry: boolean
  onAddCountry: () => void
} & CountrySelectorProps) {
  const canCompare = completeCountryCodes(slots).length >= 2

  return (
    <div className="md:hidden" aria-label="Country comparison details">
      <div className="sticky top-14 z-20 -mx-1 border-y border-campcareer-border bg-campcareer-surface/95 px-1 py-2 backdrop-blur-sm" aria-label="Country comparison columns">
        <div className="grid grid-cols-2 gap-2">
          {slots.map((slot, index) => (
            <div key={`${index}-${slot.countryCode ?? "empty"}`} className={index === 2 ? "col-span-2" : ""}>
              <CountryColumnControls index={index} slot={slot} compact {...selectorProps} />
            </div>
          ))}
        </div>
        {canAddCountry ? (
          <button type="button" onClick={onAddCountry} className="mt-2 inline-flex min-h-10 items-center rounded-cc-control px-2 text-sm font-semibold text-brand transition-colors duration-cc-fast hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            <Plus aria-hidden="true" className="mr-1.5 size-4" /> Add country
          </button>
        ) : null}
      </div>

      {canCompare ? (
        <div className="mt-5 space-y-7">
          {Array.from(new Set(rows.map((row) => row.section))).map((section) => (
            <section key={section}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-campcareer-muted">{section}</h3>
              <div className="mt-2 divide-y divide-campcareer-border border-y border-campcareer-border">
                {rows.filter((row) => row.section === section).map((row) => (
                  <div key={row.key} className="py-4">
                    <p className="text-sm font-medium text-campcareer-ink-secondary">{row.label}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {slots.map((slot, index) => {
                        if (!slot.countryCode) return null
                        const country = getCountryCompareCountry(slot.countryCode)
                        return (
                          <div key={`${row.key}-${slot.countryCode}`} className="min-w-0 rounded-cc-surface bg-campcareer-canvas p-3">
                            <p className="truncate text-[11px] font-semibold text-campcareer-muted">{country?.countryName}</p>
                            <p className="mt-1 break-words text-sm font-semibold leading-5 text-campcareer-ink">{row.values[index]}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function sectionForRow(row: CountryComparisonRowDefinition) {
  if ([
    "pathway.studyDuration",
    "studyCost.annualTuition",
    "studyCost.tuitionRange",
    "studyCost.estimatedTotalTuition",
    "studyCost.mandatoryStudyCosts",
    "studyCost.healthInsurance",
    "professionalIncome.startingIncome",
    "timeAndInvestment.totalStudyInvestment",
    "timeAndInvestment.recoveryPeriod",
  ].includes(row.fieldKey)) return "Key metrics"
  if (row.section === "Pathway") return "Entry & requirements"
  if (row.section === "Study cost") return "Costs"
  if (row.section === "Visa and post-study") return "Visa & work"
  if (row.section === "Professional income" || row.section === "Time and investment") return "Outcomes"
  return row.section === "Source" ? "Sources" : "Other details"
}

function countryRows(): CountryComparisonRowDefinition[] {
  return REGISTERED_NURSE_MATRIX_ROWS.filter((row) => row.section !== "Living in selected city")
}

function buildMatrixRows(slots: readonly CountryCompareSlot[]): MatrixRow[] {
  const sectionOrder = ["Key metrics", "Entry & requirements", "Costs", "Visa & work", "Outcomes", "Sources", "Other details"]
  return countryRows().map((row) => ({
    key: row.fieldKey,
    section: sectionForRow(row),
    label: row.label,
    values: slots.map((slot) => {
      if (!slot.countryCode) return NOT_AVAILABLE
      const country = getRegisteredNurseCountryShell(slot.countryCode)
      if (!country) return NOT_AVAILABLE
      const value = formatCountryComparisonRow(row, { country, city: null, cityCost: null })
      return value === "Not available" ? NOT_AVAILABLE : value
    }),
  })).sort((a, b) => sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section))
}