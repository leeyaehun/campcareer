'use client'

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Info } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

export function RoiInfo({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const tr = useTranslations().roiExplorer

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label="How is ROI calculated?"
        onClick={() => setOpen(prev => !prev)}
        className={`text-slate-400 hover:text-slate-600 transition-colors${className ? ` ${className}` : ""}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute z-50 right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl p-4 text-left">
          <p className="text-sm font-semibold text-slate-900 mb-1.5">How ROI score works</p>
          <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
            It shows how much of your full 4-year tuition your yearly take-home pay covers — adjusted for the school&apos;s graduation rate. Higher is better.
          </p>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 mb-2.5">
            <p className="text-[11px] font-mono text-slate-700 leading-relaxed">
              ROI ≈ (yearly take-home × grad rate) ÷ 4-yr tuition × 100
            </p>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-500">
            <li>take-home = median earnings − rent − living costs</li>
            <li>4-yr tuition = net price × 4 years</li>
            <li>grad rate weights in real completion odds</li>
          </ul>
          <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
            So a score of 90 means your adjusted yearly pay ≈ 90% of all four years of tuition — about a year to recover it.
          </p>
          <Link
            href="/methodology"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            {tr.seeMethodology} →
          </Link>
        </div>
      )}
    </div>
  )
}
