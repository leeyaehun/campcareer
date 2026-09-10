"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Plus, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  appendCareer,
  buildCareerCompareHref,
  getCareerCompareOptions,
  getCareerSelectionStatusMessage,
  parseCareerComparisonState,
  removeCareerAtIndex,
  replaceCareerAtIndex,
  type CareerComparisonState,
} from "@/lib/career-comparison"
import {
  AU_CAREER_COMPARE_CITIES,
  CAREER_COMPARE_MAX_CAREERS,
  CAREER_COMPARE_MISSING_VALUE,
  type AustraliaCareerComparison,
  type CareerCompareId,
} from "@/data/career-comparison/australia"
import {
  getCareerComparisonRows,
  type CareerComparisonDisplayValue,
  type CareerComparisonFieldKey,
  type CareerComparisonRow,
} from "@/data/career-comparison/rows"
import { CompareCell, CompareShell } from "@/components/ui/compare"
import { DataTable, DataTableHeader, DataTableRow } from "@/components/ui/data-table"
import { Dialog, DialogCloseButton, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

type CareerDisplaySection = {
  title: string
  rows: readonly CareerComparisonRow[]
}

export default function CareersCompareMatrix() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const comparison = parseCareerComparisonState(searchParams)
  const [thirdOpen, setThirdOpen] = useState(comparison.careerIds.length >= CAREER_COMPARE_MAX_CAREERS)
  const [chooserSlot, setChooserSlot] = useState<number | null>(null)
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (comparison.careerIds.length >= CAREER_COMPARE_MAX_CAREERS) setThirdOpen(true)
    if (comparison.careerIds.length < 2) setThirdOpen(false)
  }, [comparison.careerIds.length])

  const visibleSlotCount = comparison.careerIds.length >= CAREER_COMPARE_MAX_CAREERS || thirdOpen ? CAREER_COMPARE_MAX_CAREERS : 2
  const slots = Array.from({ length: visibleSlotCount }, (_, index) => index)
  const canCompare = comparison.careers.length >= 2
  const showAdd = comparison.careerIds.length === 2 && !thirdOpen
  const sections = buildCareerSections(comparison.careers)

  const updateUrl = (citySlug: string | null, careerIds: readonly CareerCompareId[]) => {
    router.replace(buildCareerCompareHref(citySlug, careerIds), { scroll: false })
  }

  const closeChooser = () => {
    const slot = chooserSlot
    setChooserSlot(null)
    if (slot !== null) window.requestAnimationFrame(() => triggerRefs.current[slot]?.focus())
  }

  const chooseCareer = (slot: number, careerId: CareerCompareId) => {
    const nextIds = slot < comparison.careerIds.length
      ? replaceCareerAtIndex(comparison.careerIds, slot, careerId)
      : appendCareer(comparison.careerIds, careerId)
    updateUrl(comparison.citySlug, nextIds)
    closeChooser()
  }

  const removeCareer = (slot: number) => {
    const nextIds = removeCareerAtIndex(comparison.careerIds, slot)
    if (nextIds.length < CAREER_COMPARE_MAX_CAREERS) setThirdOpen(false)
    updateUrl(comparison.citySlug, nextIds)
  }

  const cancelThirdCareer = () => {
    setThirdOpen(false)
    if (chooserSlot === 2) closeChooser()
  }

  return (
    <CompareShell>
      <div className="mb-3 flex justify-end">
        <CareerLocationControl citySlug={comparison.citySlug} onChange={(citySlug) => updateUrl(citySlug, comparison.careerIds)} />
      </div>

      {!canCompare ? (
        <p className="mb-3 text-sm font-medium text-campcareer-ink-secondary" role="status">{getCareerSelectionStatusMessage(comparison.careers.length)}</p>
      ) : null}

      <DesktopMatrix
        comparison={comparison}
        sections={sections}
        slots={slots}
        chooserSlot={chooserSlot}
        showAdd={showAdd}
        triggerRefs={triggerRefs}
        onOpenChooser={setChooserSlot}
        onRemove={removeCareer}
        onAddThird={() => setThirdOpen(true)}
        onCancelThird={cancelThirdCareer}
      />

      <MobileMatrix
        comparison={comparison}
        sections={sections}
        slots={slots}
        chooserSlot={chooserSlot}
        showAdd={showAdd}
        triggerRefs={triggerRefs}
        onOpenChooser={setChooserSlot}
        onRemove={removeCareer}
        onAddThird={() => setThirdOpen(true)}
        onCancelThird={cancelThirdCareer}
      />

      {chooserSlot !== null ? (
        <CareerChooser
          selectedIds={comparison.careerIds}
          currentId={comparison.careerIds[chooserSlot]}
          onChoose={(careerId) => chooseCareer(chooserSlot, careerId)}
          onClose={closeChooser}
        />
      ) : null}
    </CompareShell>
  )
}

function buildCareerSections(careers: readonly AustraliaCareerComparison[]): readonly CareerDisplaySection[] {
  const rows = getCareerComparisonRows(careers)
  const byKey = new Map(rows.map((row) => [row.key, row]))
  const pick = (keys: readonly CareerComparisonFieldKey[]) => keys.flatMap((key) => {
    const row = byKey.get(key)
    return row ? [row] : []
  })

  return [
    {
      title: "Key metrics",
      rows: pick(["studyDuration", "annualTuition", "typicalEarnings", "shortageStatus"]),
    },
    {
      title: "Entry & requirements",
      rows: pick([
        "typicalEducationRoute",
        "typicalEntryQualification",
        "qualificationOutcome",
        "registrationRequirement",
        "registrationAuthority",
      ]),
    },
    {
      title: "Costs",
      rows: pick(["estimatedTotalTuition", "mandatoryStudyCosts"]),
    },
    {
      title: "Outcomes",
      rows: pick(["startingIncome", "incomeBasis", "employmentOutlook", "geographicScope"]),
    },
    {
      title: "Other details",
      rows: pick(["timeToProfessionalEntry", "registrationOrOnboardingTime", "officialSources", "reviewed"]),
    },
  ]
}

type MatrixProps = {
  comparison: CareerComparisonState
  sections: readonly CareerDisplaySection[]
  slots: readonly number[]
  chooserSlot: number | null
  showAdd: boolean
  triggerRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  onOpenChooser: (slot: number) => void
  onRemove: (slot: number) => void
  onAddThird: () => void
  onCancelThird: () => void
}

function CareerLocationControl({ citySlug, onChange }: { citySlug: string | null; onChange: (citySlug: string | null) => void }) {
  return (
    <label className="relative inline-flex min-h-10 items-center rounded-cc-control border border-campcareer-border bg-campcareer-surface shadow-cc-surface transition-colors duration-cc-fast focus-within:border-brand focus-within:ring-2 focus-within:ring-ring/30">
      <span className="sr-only">Career comparison location</span>
      <span aria-hidden="true" className="pointer-events-none flex items-center gap-2 px-3 text-sm font-semibold text-campcareer-ink">
        {citySlug ? AU_CAREER_COMPARE_CITIES.find((city) => city.citySlug === citySlug)?.cityName ?? "National" : "National"}
        <ChevronDown className="size-4 text-campcareer-muted" />
      </span>
      <select
        aria-label="Choose a city for career comparison"
        value={citySlug ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        <option value="">National</option>
        {AU_CAREER_COMPARE_CITIES.map((city) => <option key={city.citySlug} value={city.citySlug}>{city.cityName}</option>)}
      </select>
    </label>
  )
}

function DesktopMatrix({ comparison, sections, slots, chooserSlot, showAdd, triggerRefs, onOpenChooser, onRemove, onAddThird, onCancelThird }: MatrixProps) {
  return (
    <div className="hidden md:block">
      <DataTable label="Career comparison" className="min-w-[42rem] table-fixed">
        <DataTableHeader>
          <DataTableRow>
            <th scope="col" className="sticky top-14 z-20 w-36 border-b border-campcareer-border bg-campcareer-surface/95 px-4 py-3 backdrop-blur-sm xl:w-44">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-[0.08em] text-campcareer-muted">Compare</span>
                {showAdd ? <AddCareerButton onClick={onAddThird} /> : null}
              </div>
            </th>
            {slots.map((slot) => (
              <CareerColumnHeader
                key={slot}
                slot={slot}
                career={comparison.careers[slot] ?? null}
                chooserOpen={chooserSlot === slot}
                triggerRef={(element) => { triggerRefs.current[slot] = element }}
                onOpen={onOpenChooser}
                onRemove={onRemove}
                onCancel={slot === 2 && !comparison.careers[slot] ? onCancelThird : undefined}
              />
            ))}
          </DataTableRow>
        </DataTableHeader>
        {comparison.careers.length >= 2 ? (
          <tbody>
            {sections.map((section) => (
              <CareerSectionRows key={section.title} section={section} slots={slots} careers={comparison.careers} />
            ))}
          </tbody>
        ) : null}
      </DataTable>
    </div>
  )
}

function CareerSectionRows({ section, slots, careers }: { section: CareerDisplaySection; slots: readonly number[]; careers: readonly AustraliaCareerComparison[] }) {
  return (
    <>
      <tr>
        <th colSpan={slots.length + 1} className="border-b border-campcareer-border bg-campcareer-canvas px-4 py-2.5 text-left text-xs font-semibold tracking-[0.08em] text-campcareer-muted">{section.title}</th>
      </tr>
      {section.rows.map((row) => (
        <tr key={row.key}>
          <th scope="row" className="border-b border-campcareer-border bg-campcareer-surface px-4 py-4 align-top text-sm font-medium text-campcareer-ink-secondary">{row.label}</th>
          {slots.map((slot) => (
            <td key={slot} className="border-b border-l border-campcareer-border px-5 py-4 align-top">
              {careers[slot] ? <CareerValue value={row.values[slot] ?? { primary: CAREER_COMPARE_MISSING_VALUE }} /> : null}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function MobileMatrix({ comparison, sections, slots, chooserSlot, showAdd, triggerRefs, onOpenChooser, onRemove, onAddThird, onCancelThird }: MatrixProps) {
  return (
    <div className="md:hidden">
      <div className="sticky top-14 z-20 -mx-1 border-y border-campcareer-border bg-campcareer-surface/95 px-1 py-2 backdrop-blur-sm" aria-label="Career comparison columns">
        <div className="grid grid-cols-2 gap-2">
          {slots.map((slot) => (
            <CareerMobileHeader
              key={slot}
              slot={slot}
              career={comparison.careers[slot] ?? null}
              chooserOpen={chooserSlot === slot}
              triggerRef={(element) => { triggerRefs.current[slot] = element }}
              onOpen={onOpenChooser}
              onRemove={onRemove}
              onCancel={slot === 2 && !comparison.careers[slot] ? onCancelThird : undefined}
              className={slot === 2 ? "col-span-2" : ""}
            />
          ))}
        </div>
        {showAdd ? (
          <button type="button" onClick={onAddThird} className="mt-2 inline-flex min-h-10 items-center rounded-cc-control px-2 text-sm font-semibold text-brand transition-colors duration-cc-fast hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            <Plus aria-hidden="true" className="mr-1.5 size-4" /> Add career
          </button>
        ) : null}
      </div>

      {comparison.careers.length >= 2 ? (
        <div className="mt-5 space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="text-xs font-semibold tracking-[0.08em] text-campcareer-muted">{section.title}</h3>
              <div className="mt-2 divide-y divide-campcareer-border border-y border-campcareer-border">
                {section.rows.map((row) => (
                  <div key={row.key} className="py-4">
                    <p className="text-sm font-medium text-campcareer-ink-secondary">{row.label}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {comparison.careers.map((career, index) => (
                        <CompareCell key={`${row.key}-${career.id}`} label={career.label}>
                          <CareerValue value={row.values[index] ?? { primary: CAREER_COMPARE_MISSING_VALUE }} />
                        </CompareCell>
                      ))}
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

function CareerColumnHeader({ slot, career, chooserOpen, triggerRef, onOpen, onRemove, onCancel }: { slot: number; career: AustraliaCareerComparison | null; chooserOpen: boolean; triggerRef: (element: HTMLButtonElement | null) => void; onOpen: (slot: number) => void; onRemove: (slot: number) => void; onCancel?: () => void }) {
  return (
    <th scope="col" className="sticky top-14 z-20 border-b border-l border-campcareer-border bg-campcareer-surface/95 px-2 py-2 align-top backdrop-blur-sm">
      <div className="relative">
        <CareerTrigger slot={slot} career={career} chooserOpen={chooserOpen} triggerRef={triggerRef} onOpen={onOpen} />
        {career ? <RemoveCareerButton career={career} onClick={() => onRemove(slot)} /> : null}
        {onCancel ? <CancelCareerButton onClick={onCancel} /> : null}
      </div>
    </th>
  )
}

function CareerMobileHeader({ slot, career, chooserOpen, triggerRef, onOpen, onRemove, onCancel, className }: { slot: number; career: AustraliaCareerComparison | null; chooserOpen: boolean; triggerRef: (element: HTMLButtonElement | null) => void; onOpen: (slot: number) => void; onRemove: (slot: number) => void; onCancel?: () => void; className?: string }) {
  return (
    <div className={`relative min-w-0 rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-1 shadow-cc-surface ${className ?? ""}`}>
      <CareerTrigger slot={slot} career={career} chooserOpen={chooserOpen} triggerRef={triggerRef} onOpen={onOpen} />
      {career ? <RemoveCareerButton career={career} onClick={() => onRemove(slot)} /> : null}
      {onCancel ? <CancelCareerButton onClick={onCancel} /> : null}
    </div>
  )
}

function CareerTrigger({ slot, career, chooserOpen, triggerRef, onOpen }: { slot: number; career: AustraliaCareerComparison | null; chooserOpen: boolean; triggerRef: (element: HTMLButtonElement | null) => void; onOpen: (slot: number) => void }) {
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={chooserOpen}
      aria-label={career ? `Change career from ${career.label}` : `Select career ${slot + 1}`}
      onClick={() => onOpen(slot)}
      className="relative min-h-16 w-full rounded-cc-control px-3 py-2.5 pr-10 text-left transition-colors duration-cc-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <span className="block pr-5 text-xs font-semibold tracking-[0.08em] text-campcareer-muted">Career {slot + 1}</span>
      <span className="mt-1 block break-words pr-5 text-sm font-semibold leading-5 text-campcareer-ink">{career ? career.label : "Choose a career"}</span>
      <ChevronDown aria-hidden="true" className="absolute right-3 top-5 size-4 text-campcareer-muted" />
    </button>
  )
}

function RemoveCareerButton({ career, onClick }: { career: AustraliaCareerComparison; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={`Remove ${career.label} from comparison`} className="absolute right-1 top-1 z-10 inline-flex size-9 items-center justify-center rounded-cc-control text-campcareer-muted transition-colors duration-cc-fast hover:bg-secondary hover:text-campcareer-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
      <X aria-hidden="true" className="size-4" />
    </button>
  )
}

function CancelCareerButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Cancel empty career column" className="absolute right-1 top-1 z-10 min-h-9 rounded-cc-control px-2 text-xs font-semibold text-campcareer-ink-secondary transition-colors duration-cc-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
      Cancel
    </button>
  )
}

function AddCareerButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Add a third career" className="inline-flex size-9 items-center justify-center rounded-cc-control text-brand transition-colors duration-cc-fast hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
      <Plus aria-hidden="true" className="size-4" />
    </button>
  )
}

function CareerValue({ value }: { value: CareerComparisonDisplayValue }) {
  const missing = value.primary === CAREER_COMPARE_MISSING_VALUE
  return (
    <div className="min-w-0">
      <p className={`break-words text-sm font-semibold leading-6 ${missing ? "text-campcareer-muted" : "text-campcareer-ink"}`}>{missing ? "—" : value.primary}</p>
      {value.secondary ? <p className="mt-0.5 break-words text-xs leading-5 text-campcareer-ink-secondary">{value.secondary}</p> : null}
    </div>
  )
}

function CareerChooser({ selectedIds, currentId, onChoose, onClose }: { selectedIds: readonly CareerCompareId[]; currentId?: CareerCompareId; onChoose: (careerId: CareerCompareId) => void; onClose: () => void }) {
  const options = getCareerCompareOptions(selectedIds, currentId)

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <DialogTitle id="career-chooser-heading" className="text-base font-semibold text-campcareer-ink">Choose a career</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-campcareer-ink-secondary">Choose a career for this comparison column.</DialogDescription>
          </div>
          <DialogCloseButton className="shrink-0" />
        </div>
        <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {options.map((option) => (
            <button key={option.id} type="button" disabled={option.disabled} onClick={() => onChoose(option.id)} className="flex min-h-11 w-full items-center justify-between rounded-cc-surface border border-campcareer-border px-3 text-left text-sm font-semibold text-campcareer-ink shadow-cc-surface transition-colors duration-cc-fast hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              <span>{option.label}</span>
              {option.disabled ? <span className="ml-3 shrink-0 text-xs font-medium text-campcareer-muted">Selected</span> : null}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
