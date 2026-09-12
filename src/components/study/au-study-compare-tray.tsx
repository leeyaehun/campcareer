"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { BarChart3, Check, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { localizePath } from '@/lib/i18n/config'
import { useRouteLocale } from '@/lib/i18n/locale-provider'
import { useRouteTranslations } from '@/lib/i18n/use-translations'

type CompareOption = {
  id: string
  name: string
  state: string | null
  fieldName: string | null
  aqfLevel: number | null
}
type CompareFilters = { field: string; state: string; level: string; category: string }
type CompareContextValue = { selected: CompareOption[]; toggle: (option: CompareOption) => void }

const CompareContext = createContext<CompareContextValue | null>(null)

function buildStudyUrl(filters: CompareFilters, selected: CompareOption[], locale: 'en' | 'ko') {
  const query = new URLSearchParams()
  if (filters.field) query.set('field', filters.field)
  if (filters.category) query.set('category', filters.category)
  if (filters.state !== 'ALL_STATES') query.set('state', filters.state)
  if (filters.level !== 'all') query.set('level', filters.level)
  if (selected.length) query.set('compare', selected.map((item) => item.id).join(','))
  return `${localizePath('/au/study', locale)}${query.size ? `?${query}` : ''}`
}

export function AuStudyCompareTrayProvider({ initialSelected, filters, children }: { initialSelected: CompareOption[]; filters: CompareFilters; children: ReactNode }) {
  const router = useRouter()
  const locale = useRouteLocale()
  const t = useRouteTranslations().australia.study.tray
  const [selected, setSelected] = useState(initialSelected)
  const [notice, setNotice] = useState('')

  const updateSelection = useCallback((next: CompareOption[]) => {
    setSelected(next)
    setNotice('')
    router.replace(buildStudyUrl(filters, next, locale), { scroll: false })
  }, [filters, locale, router])

  const toggle = useCallback((option: CompareOption) => {
    const alreadySelected = selected.some((item) => item.id === option.id)
    if (alreadySelected) return updateSelection(selected.filter((item) => item.id !== option.id))
    if (selected.length >= 3) {
      setNotice(t.maxSelected)
      return
    }
    updateSelection([...selected, option])
  }, [selected, t.maxSelected, updateSelection])

  const compareNow = useCallback(() => {
    if (selected.length < 2) return
    const query = new URLSearchParams()
    selected.forEach((item) => query.append('schools', item.id))
    // The first saved card establishes a transparent shared comparison basis.
    // Every provider on the next screen is then measured against this field
    // and precise AQF level, rather than each provider's unrelated best row.
    const basis = selected[0]
    if (basis?.fieldName) query.set('field', basis.fieldName)
    else if (filters.field) query.set('field', filters.field)
    if (basis?.aqfLevel) query.set('aqf', String(basis.aqfLevel))
    else if (filters.level !== 'all') query.set('level', filters.level)
    router.push(`${localizePath('/au/study/compare', locale)}?${query}`)
  }, [filters.field, filters.level, locale, router, selected])

  return <CompareContext.Provider value={{ selected, toggle }}>
    <div className={selected.length ? 'pb-36 sm:pb-32' : ''}>{children}</div>
    {selected.length > 0 && <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_20px_60px_rgba(15,23,42,.20)] backdrop-blur sm:bottom-5 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-950">{t.title} <span className="font-medium text-slate-500">{selected.length}/3</span></p>{selected[0]?.fieldName && <p className="mt-0.5 text-xs text-slate-500">{format(t.sameSubject, { field: selected[0].fieldName, aqf: selected[0].aqfLevel ? ` · AQF ${selected[0].aqfLevel}` : '' })}</p>}</div>{notice && <p aria-live="polite" className="text-xs font-medium text-amber-700">{notice}</p>}</div><div className="mt-2 flex flex-wrap gap-2">{selected.map((item) => <span key={item.id} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-blue-900"><span className="truncate">{item.name}{item.state ? ` · ${item.state}` : ''}</span><button type="button" onClick={() => toggle(item)} aria-label={format(t.remove, { name: item.name })} className="grid size-5 shrink-0 place-items-center rounded-full text-blue-700 transition hover:bg-blue-100"><X className="size-3.5" /></button></span>)}</div></div>
        <button type="button" onClick={compareNow} disabled={selected.length < 2} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"><BarChart3 className="size-4" />{selected.length < 2 ? t.chooseOneMore : format(t.compareSchools, { count: selected.length })}</button>
      </div>
    </div>}
  </CompareContext.Provider>
}

export function AuStudyCompareToggle({ option }: { option: CompareOption }) {
  const context = useContext(CompareContext)
  const t = useRouteTranslations().australia.study.tray
  if (!context) return null
  const selected = context.selected.some((item) => item.id === option.id)
  return <button type="button" onClick={() => context.toggle(option)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}`}><span className="grid size-4 place-items-center rounded-full border border-current/40">{selected ? <Check className="size-3" /> : <Plus className="size-3" />}</span>{selected ? t.added : t.compare}</button>
}

function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))
}
