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
      <p className="text-sm font-semibold text-slate-900">{isKo ? "CampCareer 개선에 도움을 주세요" : "Help us improve CampCareer"}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{isKo ? "선택적 제품 측정은 검색·비교·파트너 링크가 제대로 작동하는지 이해하는 데만 사용합니다. 이메일이나 자유 입력 내용은 포함하지 않습니다." : "Optional product measurement helps us understand whether search, comparison, and partner links work. It never includes your email or free-text answers."}</p>
      <Link href={`${localizePath("/privacy", locale)}#cookies-and-measurement`} className="mt-2 inline-flex text-xs font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800">
        {isKo ? "개인정보 처리방침 읽기" : "Read the Privacy Policy"}
      </Link>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => void choose("denied")} className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">{isKo ? "필수 기능만 사용" : "Use essential only"}</button>
        <button type="button" onClick={() => void choose("granted")} className="min-h-10 rounded-lg border border-blue-600 bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700">{isKo ? "측정 허용" : "Allow measurement"}</button>
      </div>
    </aside>
  )
}
