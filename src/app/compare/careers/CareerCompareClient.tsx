"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"

type CareerOption = {
  code: string
  name: string
}

type CareerDetail = {
  code: string
  name: string
  category: string | null
  median_salary: number | null
  salary_currency: string
  shortage_score: number | null
  employment: number | null
  growth_pct: number | null
  annual_openings: number | null
  on_shortage_list: boolean | null
  confidence: string | null
  source_name: string | null
  regions: { name: string; score: number }[] | null
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
  careerCode,
  careers,
  loading,
  onCountryChange,
  onCareerChange,
  countryLabel,
  careerLabel,
  selectPlaceholder,
  loadingLabel,
  unsupported,
  unsupportedLabel,
}: {
  label: string
  country: string
  careerCode: string
  careers: CareerOption[]
  loading: boolean
  onCountryChange: (v: string) => void
  onCareerChange: (v: string) => void
  countryLabel: string
  careerLabel: string
  selectPlaceholder: string
  loadingLabel: string
  unsupported: boolean
  unsupportedLabel: string
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
          <label className="text-xs font-medium text-slate-500 mb-1 block">{careerLabel}</label>
          <select
            value={careerCode}
            onChange={e => onCareerChange(e.target.value)}
            disabled={loading || unsupported || careers.length === 0}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {unsupported ? (
              <option value="">{unsupportedLabel}</option>
            ) : (
              <>
                <option value="">{loading ? loadingLabel : selectPlaceholder}</option>
                {careers.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </>
            )}
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

export default function CareerCompareClient() {
  const t = useTranslations()
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [countryA, setCountryA] = useState("us")
  const [countryB, setCountryB] = useState("au")
  const [codeA, setCodeA] = useState("15-1252")
  const [codeB, setCodeB] = useState("261313")

  const [careersA, setCareersA] = useState<CareerOption[]>([])
  const [careersB, setCareersB] = useState<CareerOption[]>([])
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)

  const [detailA, setDetailA] = useState<CareerDetail | null>(null)
  const [detailB, setDetailB] = useState<CareerDetail | null>(null)

  const [sticky, setSticky] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? "$"
  const tc = t.compare.careers
  const unsupportedA = countryA === "ca" || countryA === "uk"
  const unsupportedB = countryB === "ca" || countryB === "uk"

  useEffect(() => {
    if (unsupportedA) { setCareersA([]); setDetailA(null); setCodeA(""); return }
    setLoadingA(true)
    fetch(`/api/compare/careers?country=${countryA}`)
      .then(r => r.json()).then(j => setCareersA(j.data ?? [])).finally(() => setLoadingA(false))
  }, [countryA, unsupportedA])

  useEffect(() => {
    if (unsupportedB) { setCareersB([]); setDetailB(null); setCodeB(""); return }
    setLoadingB(true)
    fetch(`/api/compare/careers?country=${countryB}`)
      .then(r => r.json()).then(j => setCareersB(j.data ?? [])).finally(() => setLoadingB(false))
  }, [countryB, unsupportedB])

  useEffect(() => {
    if (!codeA || unsupportedA) { setDetailA(null); return }
    fetch(`/api/compare/careers?country=${countryA}&code=${codeA}`)
      .then(r => r.json()).then(j => setDetailA(j.data ?? null))
  }, [codeA, countryA, unsupportedA])

  useEffect(() => {
    if (!codeB || unsupportedB) { setDetailB(null); return }
    fetch(`/api/compare/careers?country=${countryB}&code=${codeB}`)
      .then(r => r.json()).then(j => setDetailB(j.data ?? null))
  }, [codeB, countryB, unsupportedB])

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
    ...(detailA.category || detailB.category ? [{
      key: "category", label: tc.category,
      valA: detailA.category ?? "—",
      valB: detailB.category ?? "—",
    }] : []),
    { key: "salary", label: tc.salary,
      valA: detailA.median_salary != null ? fmtMoney(detailA.median_salary, countryA, currency, sym) : "—",
      valB: detailB.median_salary != null ? fmtMoney(detailB.median_salary, countryB, currency, sym) : "—" },
    { key: "shortage", label: tc.shortage,
      valA: detailA.shortage_score != null ? `${Math.round(detailA.shortage_score)}/100` : "—",
      valB: detailB.shortage_score != null ? `${Math.round(detailB.shortage_score)}/100` : "—" },
    ...(detailA.employment != null || detailB.employment != null ? [{
      key: "employment", label: tc.employment,
      valA: detailA.employment != null ? detailA.employment.toLocaleString() : "—",
      valB: detailB.employment != null ? detailB.employment.toLocaleString() : "—",
    }] : []),
    ...(detailA.growth_pct != null || detailB.growth_pct != null ? [{
      key: "growth", label: tc.growth,
      valA: detailA.growth_pct != null ? `${detailA.growth_pct}%` : "—",
      valB: detailB.growth_pct != null ? `${detailB.growth_pct}%` : "—",
    }] : []),
    ...(detailA.annual_openings != null || detailB.annual_openings != null ? [{
      key: "openings", label: tc.annualOpenings,
      valA: detailA.annual_openings != null ? detailA.annual_openings.toLocaleString() : "—",
      valB: detailB.annual_openings != null ? detailB.annual_openings.toLocaleString() : "—",
    }] : []),
    { key: "visa", label: tc.visaEligible,
      valA: detailA.on_shortage_list != null ? (detailA.on_shortage_list ? tc.yes : tc.no) : "—",
      valB: detailB.on_shortage_list != null ? (detailB.on_shortage_list ? tc.yes : tc.no) : "—" },
  ] : []

  return (
    <>
      {/* Sticky career-name bar */}
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
              careerCode={codeA}
              careers={careersA}
              loading={loadingA}
              onCountryChange={setCountryA}
              onCareerChange={setCodeA}
              countryLabel={tc.country}
              careerLabel={tc.career}
              selectPlaceholder={tc.selectCareer}
              loadingLabel={tc.loading}
              unsupported={unsupportedA}
              unsupportedLabel={tc.dataNotAvailable}
            />
          </div>
          <div className="w-1/2 sm:w-[280px] min-w-0">
            <SelectorCard
              label="B"
              country={countryB}
              careerCode={codeB}
              careers={careersB}
              loading={loadingB}
              onCountryChange={setCountryB}
              onCareerChange={setCodeB}
              countryLabel={tc.country}
              careerLabel={tc.career}
              selectPlaceholder={tc.selectCareer}
              loadingLabel={tc.loading}
              unsupported={unsupportedB}
              unsupportedLabel={tc.dataNotAvailable}
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
