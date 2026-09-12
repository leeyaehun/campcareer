"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"

type MajorOption = {
  slug: string
  name: string
}

type MajorDetail = {
  slug: string
  name: string
  country: string
  field_group: string
  overall_risk: string
  employment_rate: number
  median_starting_salary: number
  avg_annual_tuition_intl: number
  payback_years: number
  visa_pathway_score: number | null
  post_study_work_years: number
  market_demand_score: number
  ai_exposure_band: string
  occupation_list_match: boolean
  risk_summary: string
}

const COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "au", label: "Australia" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "ie", label: "Ireland" },
]

type CurrencyCode = "USD" | "EUR" | "GBP" | "AUD" | "CAD"

const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)" },
  { code: "CAD", symbol: "C$", label: "CAD (C$)" },
]

const EXCHANGE_RATES: Record<CurrencyCode, Record<string, number>> = {
  USD: { usd: 1, eur: 0.93, gbp: 0.79, aud: 1.5, cad: 1.36 },
  EUR: { usd: 1.08, eur: 1, gbp: 0.85, aud: 1.62, cad: 1.47 },
  GBP: { usd: 1.27, eur: 1.18, gbp: 1, aud: 1.91, cad: 1.73 },
  AUD: { usd: 0.67, eur: 0.62, gbp: 0.52, aud: 1, cad: 0.91 },
  CAD: { usd: 0.73, eur: 0.68, gbp: 0.58, aud: 1.1, cad: 1 },
}

function countryToCcy(country: string): CurrencyCode {
  return country === "us" ? "USD"
    : country === "au" ? "AUD"
    : country === "ca" ? "CAD"
    : country === "uk" ? "GBP"
    : "EUR"
}

function convertCurrency(value: number, fromCountry: string, target: CurrencyCode): number {
  const from = countryToCcy(fromCountry).toLowerCase()
  const rate = EXCHANGE_RATES[target]?.[from]
  if (!rate || rate === 1) return value
  return Math.round(value / rate)
}

function fmtMoney(value: number, country: string, target: CurrencyCode, symbol: string): string {
  return `${symbol}${convertCurrency(value, country, target).toLocaleString()}`
}

function SelectorCard({
  label,
  country,
  majorSlug,
  majors,
  loading,
  onCountryChange,
  onMajorChange,
  countryLabel,
  majorLabel,
  selectPlaceholder,
  loadingLabel,
}: {
  label: string
  country: string
  majorSlug: string
  majors: MajorOption[]
  loading: boolean
  onCountryChange: (v: string) => void
  onMajorChange: (v: string) => void
  countryLabel: string
  majorLabel: string
  selectPlaceholder: string
  loadingLabel: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            {label}
          </span>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">{countryLabel}</label>
          <select
            value={country}
            onChange={e => onCountryChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {COUNTRIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">{majorLabel}</label>
          <select
            value={majorSlug}
            onChange={e => onMajorChange(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">{loading ? loadingLabel : selectPlaceholder}</option>
            {majors.map(m => (
              <option key={m.slug} value={m.slug}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

type SectionDef = {
  key: string
  label: string
  valA: string
  valB: string
}

const FIELD_GROUP_MAP: Record<string, string> = {
  tech: 'fieldTech',
  health: 'fieldHealth',
  engineering: 'fieldEngineering',
  business: 'fieldBusiness',
  design: 'fieldDesign',
  social: 'fieldSocial',
  creative: 'fieldCreative',
}

export default function MajorCompareClient() {
  const t = useTranslations()
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [countryA, setCountryA] = useState("us")
  const [countryB, setCountryB] = useState("uk")
  const [slugA, setSlugA] = useState("computer-science")
  const [slugB, setSlugB] = useState("computer-science")

  const [majorsA, setMajorsA] = useState<MajorOption[]>([])
  const [majorsB, setMajorsB] = useState<MajorOption[]>([])
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)

  const [detailA, setDetailA] = useState<MajorDetail | null>(null)
  const [detailB, setDetailB] = useState<MajorDetail | null>(null)

  const [sticky, setSticky] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? "$"
  const tc = t.compare.majors

  useEffect(() => {
    setLoadingA(true)
    fetch(`/api/compare/majors?country=${countryA}`)
      .then(r => r.json()).then(j => setMajorsA(j.data ?? [])).finally(() => setLoadingA(false))
  }, [countryA])

  useEffect(() => {
    setLoadingB(true)
    fetch(`/api/compare/majors?country=${countryB}`)
      .then(r => r.json()).then(j => setMajorsB(j.data ?? [])).finally(() => setLoadingB(false))
  }, [countryB])

  useEffect(() => {
    if (!slugA) { setDetailA(null); return }
    fetch(`/api/compare/majors?country=${countryA}&slug=${slugA}`)
      .then(r => r.json()).then(j => setDetailA(j.data ?? null))
  }, [slugA, countryA])

  useEffect(() => {
    if (!slugB) { setDetailB(null); return }
    fetch(`/api/compare/majors?country=${countryB}&slug=${slugB}`)
      .then(r => r.json()).then(j => setDetailB(j.data ?? null))
  }, [slugB, countryB])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const ready = detailA && detailB

  const sections: SectionDef[] = ready ? [
    { key: "field_group", label: tc.fieldGroup,
      valA: tc[FIELD_GROUP_MAP[detailA.field_group] as keyof typeof tc] as string ?? detailA.field_group,
      valB: tc[FIELD_GROUP_MAP[detailB.field_group] as keyof typeof tc] as string ?? detailB.field_group },
    { key: "overall_risk", label: tc.overallRisk,
      valA: tc[detailA.overall_risk as keyof typeof tc] as string ?? detailA.overall_risk,
      valB: tc[detailB.overall_risk as keyof typeof tc] as string ?? detailB.overall_risk },
    { key: "employment_rate", label: tc.employmentRate,
      valA: `${detailA.employment_rate}%`,
      valB: `${detailB.employment_rate}%` },
    { key: "starting_salary", label: tc.startingSalary,
      valA: fmtMoney(detailA.median_starting_salary, countryA, currency, sym),
      valB: fmtMoney(detailB.median_starting_salary, countryB, currency, sym) },
    { key: "tuition", label: tc.tuition,
      valA: fmtMoney(detailA.avg_annual_tuition_intl, countryA, currency, sym),
      valB: fmtMoney(detailB.avg_annual_tuition_intl, countryB, currency, sym) },
    { key: "payback_years", label: tc.payback,
      valA: `${detailA.payback_years} ${tc.year}`, valB: `${detailB.payback_years} ${tc.year}` },
    { key: "visa_score", label: tc.visaPathwayScore,
      valA: detailA.visa_pathway_score != null ? `${detailA.visa_pathway_score}/100` : "—",
      valB: detailB.visa_pathway_score != null ? `${detailB.visa_pathway_score}/100` : "—" },
    { key: "post_study_work", label: tc.postStudyWork,
      valA: `${detailA.post_study_work_years} ${tc.year}`, valB: `${detailB.post_study_work_years} ${tc.year}` },
    { key: "market_demand", label: tc.marketDemand,
      valA: `${detailA.market_demand_score}/100`, valB: `${detailB.market_demand_score}/100` },
    { key: "ai_exposure", label: tc.aiExposure,
      valA: tc[detailA.ai_exposure_band as keyof typeof tc] as string ?? detailA.ai_exposure_band,
      valB: tc[detailB.ai_exposure_band as keyof typeof tc] as string ?? detailB.ai_exposure_band },
    { key: "occupation_list", label: tc.occupationListMatch,
      valA: detailA.occupation_list_match ? tc.yes : tc.no,
      valB: detailB.occupation_list_match ? tc.yes : tc.no },
  ] : []

  return (
    <>
      {/* Sticky major-name bar */}
      <div
        className={`sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 transition-opacity duration-200 ${
          sticky && ready ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center h-12 gap-4">
          <span className="flex-1 text-sm font-semibold text-slate-900 truncate text-center">
            {detailA?.name ?? ""}
          </span>
          <span className="text-xs font-medium text-slate-400 shrink-0">{tc.vs}</span>
          <span className="flex-1 text-sm font-semibold text-slate-900 truncate text-center">
            {detailB?.name ?? ""}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              {tc.pageTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {tc.pageSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-medium text-slate-500">{tc.currency}</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as CurrencyCode)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-row gap-2 sm:gap-4 justify-center mb-6 sm:mb-10">
          <div className="w-1/2 sm:w-[280px] min-w-0">
            <SelectorCard
              label="A"
              country={countryA}
              majorSlug={slugA}
              majors={majorsA}
              loading={loadingA}
              onCountryChange={setCountryA}
              onMajorChange={setSlugA}
              countryLabel={tc.country}
              majorLabel={tc.major}
              selectPlaceholder={tc.selectMajor}
              loadingLabel={tc.loading}
            />
          </div>
          <div className="w-1/2 sm:w-[280px] min-w-0">
            <SelectorCard
              label="B"
              country={countryB}
              majorSlug={slugB}
              majors={majorsB}
              loading={loadingB}
              onCountryChange={setCountryB}
              onMajorChange={setSlugB}
              countryLabel={tc.country}
              majorLabel={tc.major}
              selectPlaceholder={tc.selectMajor}
              loadingLabel={tc.loading}
            />
          </div>
        </div>

        {/* Sentinel for sticky detection */}
        <div ref={sentinelRef} className="h-px" />

        {ready ? (
          <div className="max-w-4xl mx-auto">
            {sections.map((sec, i) => (
              <div key={sec.key} className={i > 0 ? "pt-8 sm:pt-12" : ""}>
                <h2 className="text-left text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  {sec.label}
                </h2>
                <hr className="mt-2 sm:mt-3 mb-5 sm:mb-6 border-t-2 border-slate-300" />
                <div className="flex gap-4 sm:gap-8">
                  <div className="flex-1 text-left">
                    <div className="text-lg sm:text-2xl font-semibold text-slate-900">
                      {sec.valA}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-lg sm:text-2xl font-semibold text-slate-900">
                      {sec.valB}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
            <p className="text-sm text-slate-500">{tc.emptyState}</p>
          </div>
        )}
      </div>
    </>
  )
}
