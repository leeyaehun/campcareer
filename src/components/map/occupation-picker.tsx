"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import { useLocale } from "@/lib/i18n/locale-provider"
import { useTranslations } from "@/lib/i18n/use-translations"

// 맵 툴바용 직업 검색 드롭다운 — 이미 로드된 (주 단위) 직업 목록을 클라이언트에서 즉시 필터.
// API 호출 없이 검색하고, 선택하면 onSelect(anzsco_code) 로 직업 카드를 연다.
export type OccupationOption = {
  anzsco_code: string
  occupation_en: string
  occupation_ko: string | null
  median_salary_aud: number | null
}

export function OccupationPicker({
  occupations,
  onSelect,
  disabled = false,
  placeholder,
}: {
  occupations: OccupationOption[]
  onSelect: (code: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  const t = useTranslations()
  const locale = useLocale()
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return occupations
      .filter(
        (o) =>
          o.occupation_en.toLowerCase().includes(term) ||
          (o.occupation_ko ?? "").toLowerCase().includes(term),
      )
      .slice(0, 10)
  }, [q, occupations])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  function pick(o: OccupationOption) {
    onSelect(o.anzsco_code)
    setQ("")
    setOpen(false)
  }

  if (disabled) {
    return (
      <div className="flex h-10 w-64 cursor-not-allowed items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400">
        {t.map.selectStateFirst}
      </div>
    )
  }

  return (
    <div ref={boxRef} className="relative w-64">
      <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition-colors focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder ?? t.map.selectOccupationPlaceholder}
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>

      {open && q.trim().length > 0 && (
        results.length > 0 ? (
          <ul className="absolute z-[2000] mt-1.5 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">
            {results.map((o) => (
              <li key={o.anzsco_code}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(o)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {locale === "ko" && o.occupation_ko ? o.occupation_ko : o.occupation_en}
                    </span>
                    {locale === "ko" && o.occupation_ko && (
                      <span className="block truncate text-xs text-slate-400">{o.occupation_en}</span>
                    )}
                  </span>
                  {o.median_salary_aud != null && (
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                      A${o.median_salary_aud.toLocaleString()}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="absolute z-[2000] mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-400 shadow-lg">
            {t.map.occupationNoResults}
          </div>
        )
      )}
    </div>
  )
}
