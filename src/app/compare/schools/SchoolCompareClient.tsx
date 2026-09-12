"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"

const HARVARD_ID = "ebef5a65-3759-458c-8086-d4c082a37c1d"
const UNSW_ID = "50c5abe9-4a93-4410-864d-0d191d0f5d69"

type SchoolOption = {
  college_id: string
  college_name: string
  college_state: string
}

type SchoolDetail = {
  college_id: string
  college_name: string
  college_state: string
  city_name: string
  school_type: string
  tuition: number
  median_earnings: number
  roi_score: number
  payback_years: number
  graduation_rate: number | null
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

function fmtPct(value: number | null): string {
  return value != null && value > 0 ? `${(value * 100).toFixed(0)}%` : "—"
}

function SelectorCard({
  label,
  country,
  schoolId,
  schools,
  loading,
  onCountryChange,
  onSchoolChange,
  countryLabel,
  schoolLabel,
  selectPlaceholder,
  loadingLabel,
}: {
  label: string
  country: string
  schoolId: string
  schools: SchoolOption[]
  loading: boolean
  onCountryChange: (v: string) => void
  onSchoolChange: (v: string) => void
  countryLabel: string
  schoolLabel: string
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
          <label className="text-xs font-medium text-slate-500 mb-1 block">{schoolLabel}</label>
          <select
            value={schoolId}
            onChange={e => onSchoolChange(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">{loading ? loadingLabel : selectPlaceholder}</option>
            {schools.map(s => (
              <option key={s.college_id} value={s.college_id}>
                {s.college_name} ({s.college_state})
              </option>
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

export default function SchoolCompareClient() {
  const t = useTranslations()
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [countryA, setCountryA] = useState("us")
  const [countryB, setCountryB] = useState("au")
  const [schoolIdA, setSchoolIdA] = useState(HARVARD_ID)
  const [schoolIdB, setSchoolIdB] = useState(UNSW_ID)

  const [schoolsA, setSchoolsA] = useState<SchoolOption[]>([])
  const [schoolsB, setSchoolsB] = useState<SchoolOption[]>([])
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)

  const [detailA, setDetailA] = useState<SchoolDetail | null>(null)
  const [detailB, setDetailB] = useState<SchoolDetail | null>(null)

  const [sticky, setSticky] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? "$"

  useEffect(() => {
    setLoadingA(true)
    fetch(`/api/compare/schools?country=${countryA}`)
      .then(r => r.json()).then(j => setSchoolsA(j.data ?? [])).finally(() => setLoadingA(false))
  }, [countryA])

  useEffect(() => {
    setLoadingB(true)
    fetch(`/api/compare/schools?country=${countryB}`)
      .then(r => r.json()).then(j => setSchoolsB(j.data ?? [])).finally(() => setLoadingB(false))
  }, [countryB])

  useEffect(() => {
    if (!schoolIdA) { setDetailA(null); return }
    fetch(`/api/compare/schools?country=${countryA}&collegeId=${schoolIdA}`)
      .then(r => r.json()).then(j => { const rows = j.data ?? []; setDetailA(rows[0] ?? null) })
  }, [schoolIdA, countryA])

  useEffect(() => {
    if (!schoolIdB) { setDetailB(null); return }
    fetch(`/api/compare/schools?country=${countryB}&collegeId=${schoolIdB}`)
      .then(r => r.json()).then(j => { const rows = j.data ?? []; setDetailB(rows[0] ?? null) })
  }, [schoolIdB, countryB])

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
    { key: "school_type", label: t.compare.schools.schoolType,
      valA: ({ public: t.compare.schools.typePublic, private_nonprofit: t.compare.schools.typePrivateNonprofit, private_forprofit: t.compare.schools.typeForProfit })[detailA.school_type] ?? detailA.school_type,
      valB: ({ public: t.compare.schools.typePublic, private_nonprofit: t.compare.schools.typePrivateNonprofit, private_forprofit: t.compare.schools.typeForProfit })[detailB.school_type] ?? detailB.school_type },
    { key: "location", label: t.compare.schools.location,
      valA: `${detailA.city_name}, ${detailA.college_state}`,
      valB: `${detailB.city_name}, ${detailB.college_state}` },
    { key: "tuition", label: t.compare.schools.tuition,
      valA: fmtMoney(detailA.tuition, countryA, currency, sym),
      valB: fmtMoney(detailB.tuition, countryB, currency, sym) },
    { key: "median_earnings", label: t.compare.schools.medianEarnings,
      valA: fmtMoney(detailA.median_earnings, countryA, currency, sym),
      valB: fmtMoney(detailB.median_earnings, countryB, currency, sym) },
    { key: "roi_score", label: t.compare.schools.roiScore,
      valA: detailA.roi_score.toFixed(1), valB: detailB.roi_score.toFixed(1) },
    { key: "payback_years", label: t.compare.schools.payback,
      valA: `${detailA.payback_years} yr`, valB: `${detailB.payback_years} yr` },
    { key: "graduation_rate", label: t.compare.schools.graduationRate,
      valA: fmtPct(detailA.graduation_rate), valB: fmtPct(detailB.graduation_rate) },
  ] : []

  return (
    <>
      {/* Sticky school-name bar */}
      <div
        className={`sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 transition-opacity duration-200 ${
          sticky && ready ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center h-12 gap-4">
          <span className="flex-1 text-sm font-semibold text-slate-900 truncate text-center">
            {detailA?.college_name ?? ""}
          </span>
          <span className="text-xs font-medium text-slate-400 shrink-0">{t.compare.schools.vs}</span>
          <span className="flex-1 text-sm font-semibold text-slate-900 truncate text-center">
            {detailB?.college_name ?? ""}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              {t.compare.schools.pageTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t.compare.schools.pageSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-medium text-slate-500">{t.compare.schools.currency}</label>
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
              schoolId={schoolIdA}
              schools={schoolsA}
              loading={loadingA}
              onCountryChange={setCountryA}
              onSchoolChange={setSchoolIdA}
              countryLabel={t.compare.schools.country}
              schoolLabel={t.compare.schools.school}
              selectPlaceholder={t.compare.schools.selectSchool}
              loadingLabel={t.compare.schools.loading}
            />
          </div>
          <div className="w-1/2 sm:w-[280px] min-w-0">
            <SelectorCard
              label="B"
              country={countryB}
              schoolId={schoolIdB}
              schools={schoolsB}
              loading={loadingB}
              onCountryChange={setCountryB}
              onSchoolChange={setSchoolIdB}
              countryLabel={t.compare.schools.country}
              schoolLabel={t.compare.schools.school}
              selectPlaceholder={t.compare.schools.selectSchool}
              loadingLabel={t.compare.schools.loading}
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
            <p className="text-sm text-slate-500">{t.compare.schools.emptyState}</p>
          </div>
        )}
      </div>
    </>
  )
}
