"use client"

import { useEffect, useState } from "react"
import type { CampCareerScore, CampCareerVerdict } from "@/lib/campcareer-score"
import type { CareerProfile } from "@/lib/career-data-foundation/career-profile-contract"
import type { CareerMarketInsight } from "@/lib/workspace/career-market-contract"
import type { OverviewSearchValues } from "../home/home-overview-config"

type Locale = "en" | "ko"

type EvidenceConfidence = "verified" | "estimated" | "limited_evidence"

const verdictLabel: Record<CampCareerVerdict, string> = {
  excellent: "Excellent",
  strong: "Strong",
  mixed: "Mixed",
  challenging: "Challenging",
  tough: "Tough",
}

const confidenceLabel: Record<EvidenceConfidence, { en: string; ko: string }> = {
  verified: { en: "Verified", ko: "검증됨" },
  estimated: { en: "Estimated", ko: "추정 포함" },
  limited_evidence: { en: "Limited evidence", ko: "근거 제한" },
}

function publicScore(insight: CareerMarketInsight): CampCareerScore | null {
  return insight.profile?.metric.campCareerScore ?? insight.foundation?.campCareerScore ?? null
}

function evidenceConfidence(insight: CareerMarketInsight): EvidenceConfidence {
  if (insight.foundation?.scoreConfidence) return insight.foundation.scoreConfidence
  const status = insight.profile?.metric.scoreStatus
  if (status === "published" || status === "reviewed") return "verified"
  if (status === "provisional") return "estimated"
  return "limited_evidence"
}

function demandCopy(value: number, locale: Locale) {
  if (locale === "ko") {
    if (value >= 8) return "높은 수요"
    if (value >= 6) return "탄탄한 수요"
    if (value >= 4) return "보통 수준의 수요"
    if (value >= 2) return "약한 수요"
    return "낮은 수요"
  }
  if (value >= 8) return "High demand"
  if (value >= 6) return "Solid demand"
  if (value >= 4) return "Moderate demand"
  if (value >= 2) return "Weak demand"
  return "Low demand"
}

function payCopy(value: number, locale: Locale) {
  if (locale === "ko") {
    if (value >= 8) return "좋은 보수"
    if (value >= 6) return "괜찮은 보수"
    if (value >= 4) return "평균적인 보수"
    if (value >= 2) return "낮은 편의 보수"
    return "낮은 보수"
  }
  if (value >= 8) return "Strong pay"
  if (value >= 6) return "Good pay"
  if (value >= 4) return "Average pay"
  if (value >= 2) return "Lower pay"
  return "Weak pay"
}

function entryCopy(value: number, locale: Locale) {
  if (locale === "ko") {
    if (value >= 8) return "쉬운 진입"
    if (value >= 7) return "관리 가능한 진입"
    if (value >= 5) return "다소 어려운 진입"
    if (value >= 3) return "어려운 진입"
    return "매우 어려운 진입"
  }
  if (value >= 8) return "Easier entry"
  if (value >= 7) return "Manageable entry"
  if (value >= 5) return "Harder entry"
  if (value >= 3) return "Difficult entry"
  return "Very difficult entry"
}

function interpretation(score: CampCareerScore, locale: Locale) {
  return `${demandCopy(score.demand, locale)}. ${payCopy(score.pay, locale)}. ${entryCopy(score.entry, locale)}.`
}

function mainReason(score: CampCareerScore, locale: Locale) {
  if (score.demand >= 8 && score.pay >= 7) {
    return locale === "ko"
      ? "강한 노동시장 수요와 높은 상대 보수가 가장 큰 강점입니다."
      : "Strong labour demand and above-average pay are the biggest positive drivers."
  }
  if (score.demand >= score.pay && score.demand >= score.entry) {
    return locale === "ko"
      ? "현지 노동시장 수요가 이 점수를 가장 크게 끌어올립니다."
      : "Local labour demand is the strongest positive driver of this score."
  }
  if (score.pay >= score.entry) {
    return locale === "ko"
      ? "현지 노동시장 대비 보수가 이 점수를 가장 크게 끌어올립니다."
      : "Relative pay is the strongest positive driver of this score."
  }
  return locale === "ko"
    ? "취업 준비 상태에 도달하기 비교적 수월한 점이 이 점수를 뒷받침합니다."
    : "A comparatively manageable route to job-ready status supports this score."
}

function mainBlocker(score: CampCareerScore, locale: Locale) {
  const minimum = Math.min(score.demand, score.pay, score.entry)
  if (minimum >= 8) {
    return locale === "ko"
      ? "공개 점수의 세 항목에서는 뚜렷한 주요 장벽이 없습니다."
      : "There is no major blocker across the three public score dimensions."
  }
  if (score.entry === minimum) {
    return locale === "ko"
      ? "자격, 교육 또는 면허 요건 때문에 실제 진입 부담이 커집니다."
      : "Qualification, training or licensing requirements make entry harder."
  }
  if (score.demand === minimum) {
    return locale === "ko"
      ? "상대적으로 약한 현지 일자리 수요가 가장 큰 제약입니다."
      : "Weaker local job demand is the main constraint on this career."
  }
  return locale === "ko"
    ? "현지 노동시장 대비 상대 보수가 가장 큰 제약입니다."
    : "Relative pay is the main constraint on this career."
}

export function CampCareerScoreHero({
  query,
  locale,
  initialInsight = null,
}: {
  query: OverviewSearchValues
  locale: Locale
  initialInsight?: CareerMarketInsight | null
}) {
  const [insight, setInsight] = useState<CareerMarketInsight | null>(initialInsight)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (initialInsight) {
      setInsight(initialInsight)
      setFailed(false)
      return
    }

    const controller = new AbortController()
    setInsight(null)
    setFailed(false)
    fetch(`/api/home/career-insight?country=${encodeURIComponent(query.country)}&career=${encodeURIComponent(query.occupation)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Career score request failed")
        return response.json() as Promise<CareerProfile>
      })
      .then((profile) => setInsight(profile.compatibility))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setFailed(true)
      })
    return () => controller.abort()
  }, [initialInsight, query.country, query.occupation])

  if (failed) return null

  if (!insight) {
    return (
      <section className="mt-6 animate-pulse rounded-xl border border-campcareer-border bg-campcareer-surface px-5 py-6 sm:px-8 sm:py-8">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="mt-3 h-10 w-56 rounded bg-slate-200" />
        <div className="mt-8 border-t border-campcareer-border pt-6">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="mt-3 h-16 w-40 rounded bg-slate-200" />
          <div className="mt-6 h-16 rounded bg-slate-100" />
        </div>
      </section>
    )
  }

  if (!insight.country) return null

  const score = publicScore(insight)
  const careerName = locale === "ko" ? insight.career.labelKo : insight.career.label
  const confidence = evidenceConfidence(insight)

  if (!score) {
    return (
      <section className="mt-6 rounded-xl border border-campcareer-border bg-campcareer-surface px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="career-heading">
        <header>
          <h1 id="career-heading" className="text-3xl font-bold tracking-[-0.045em] text-campcareer-ink sm:text-4xl">{careerName}</h1>
          <p className="mt-1 text-sm font-medium text-campcareer-muted">{insight.country.name}</p>
        </header>
        <div className="mt-8 border-t border-campcareer-border pt-6">
          <p className="text-sm font-semibold text-brand">CampCareer Score</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-campcareer-ink">{locale === "ko" ? "점수 준비 중" : "Score not ready yet"}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-campcareer-ink-secondary">{locale === "ko" ? "이 직업을 신뢰할 수 있게 평가하기 위한 Demand, Pay, Entry 근거가 아직 충분하지 않습니다." : "We don’t have enough evidence to score this career reliably yet."}</p>
          <p className="mt-5 border-t border-campcareer-border pt-4 text-xs font-medium text-campcareer-muted">{locale === "ko" ? "근거 신뢰도" : "Evidence confidence"}: {confidenceLabel[confidence][locale]}</p>
        </div>
      </section>
    )
  }

  const dimensions = [
    { label: "Demand", value: score.demand },
    { label: "Pay", value: score.pay },
    { label: "Entry", value: score.entry },
  ]

  return (
    <section className="mt-6 rounded-xl border border-campcareer-border bg-campcareer-surface px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="career-heading">
      <header>
        <h1 id="career-heading" className="text-3xl font-bold tracking-[-0.045em] text-campcareer-ink sm:text-4xl">{careerName}</h1>
        <p className="mt-1 text-sm font-medium text-campcareer-muted">{insight.country.name}</p>
      </header>

      <div className="mt-8 border-t border-campcareer-border pt-6">
        <p className="text-sm font-semibold text-brand">CampCareer Score</p>
        <div className="mt-2 flex items-end gap-4">
          <p className="text-[64px] font-bold leading-none tracking-[-0.07em] text-campcareer-ink tabular-nums sm:text-[76px]" aria-label={`${score.total} out of 100`}>{score.total}</p>
          <div className="pb-1.5 sm:pb-2">
            <p className="text-xl font-bold tracking-[-0.025em] text-campcareer-ink">{verdictLabel[score.verdict]}</p>
            <p className="mt-0.5 text-xs font-medium text-campcareer-muted">{locale === "ko" ? "100점 만점" : "out of 100"}</p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-campcareer-ink-secondary sm:text-lg">{interpretation(score, locale)}</p>
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-campcareer-border border-y border-campcareer-border">
        {dimensions.map((dimension) => (
          <div key={dimension.label} className="min-w-0 px-3 py-4 first:pl-0 last:pr-0 sm:px-5 sm:py-5 sm:first:pl-0 sm:last:pr-0">
            <p className="text-xs font-semibold text-campcareer-muted sm:text-sm">{dimension.label}</p>
            <p className="mt-1 text-3xl font-bold tracking-[-0.045em] text-campcareer-ink tabular-nums sm:text-4xl">{dimension.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-8">
        <div>
          <p className="text-xs font-semibold text-campcareer-muted">{locale === "ko" ? "주요 강점" : "Main reason"}</p>
          <p className="mt-2 text-sm leading-6 text-campcareer-ink-secondary">{mainReason(score, locale)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-campcareer-muted">{locale === "ko" ? "주요 장벽" : "Main blocker"}</p>
          <p className="mt-2 text-sm leading-6 text-campcareer-ink-secondary">{mainBlocker(score, locale)}</p>
        </div>
      </div>

      <p className="mt-6 border-t border-campcareer-border pt-4 text-xs font-medium text-campcareer-muted">{locale === "ko" ? "근거 신뢰도" : "Evidence confidence"}: {confidenceLabel[confidence][locale]}</p>
    </section>
  )
}
