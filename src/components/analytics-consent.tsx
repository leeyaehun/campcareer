"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { localizePath } from "@/lib/i18n/config"
import { clearOptionalMeasurementCookies, createOptionalMeasurementSession, getAnalyticsConsent, setAnalyticsConsent } from "@/lib/analytics-consent"

export function AnalyticsConsent() {
  const [visible, setVisible] = useState(true)
  const locale = useRouteLocale()
  const isKo = locale === "ko"

  useEffect(() => {
    setVisible(getAnalyticsConsent() === null)
  }, [])

  async function choose(value: "granted" | "denied") {
    setAnalyticsConsent(value)
    if (value === "granted") await createOptionalMeasurementSession()
    else await clearOptionalMeasurementCookies()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside id="cc-analytics-consent" className="fixed inset-x-3 bottom-3 z-[1100] mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:bottom-5" aria-label={isKo ? "개인정보 선택" : "Privacy choices"}>
      <p className="text-sm font-semibold text-slate-900">{isKo ? "선택적 분석을 허용할까요?" : "Allow optional analytics?"}</p>
      <Link href={`${localizePath("/privacy", locale)}#cookies-and-measurement`} prefetch={false} className="mt-2 inline-flex text-xs font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800">
        {isKo ? "개인정보 상세보기" : "Privacy details"}
      </Link>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => void choose("denied")} className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">{isKo ? "필수 기능만 사용" : "Use essential only"}</button>
        <button type="button" onClick={() => void choose("granted")} className="min-h-10 rounded-lg border border-blue-600 bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700">{isKo ? "측정 허용" : "Allow measurement"}</button>
      </div>
    </aside>
  )
}
