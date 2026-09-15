/**
 * P2.3 UI view-model for the Future outlook section.
 *
 * This module converts the derived P2.2 model into bounded, human-readable
 * presentation copy. It never reinterprets or normalizes raw P2.1 evidence:
 * every value rendered comes from the derived signal, and raw evidence is only
 * touched once, inside the model, when provenance metadata is requested.
 */

import {
  CAREER_FUTURE_INTELLIGENCE_SIGNAL_DEFINITIONS,
  type CareerFutureIntelligenceSignalKey,
} from "@/lib/career-future-intelligence-contract"
import {
  isIrelandCareerFutureCareerId,
  type CareerFutureDerivedDirection,
  type CareerFutureDerivedSignal,
  type CareerFutureDerivedStatus,
  type CareerFutureProxyDisclosure,
} from "@/lib/career-future-intelligence-model"

export type FutureOutlookLocale = "en" | "ko"

export const FUTURE_OUTLOOK_COUNTRY_CODE = "IE"

export const FUTURE_OUTLOOK_SIGNAL_ORDER: readonly CareerFutureIntelligenceSignalKey[] = [
  "demand",
  "growth",
  "stability",
  "ai_exposure",
  "skills_change",
  "outlook",
]

const tr = (locale: FutureOutlookLocale, ko: string, en: string) => (locale === "ko" ? ko : en)

export function futureOutlookSectionVisible(countryCode: string, careerId: string): boolean {
  return countryCode === FUTURE_OUTLOOK_COUNTRY_CODE && isIrelandCareerFutureCareerId(careerId)
}

export function futureOutlookSignalName(signal: CareerFutureIntelligenceSignalKey, locale: FutureOutlookLocale): string {
  const names: Record<CareerFutureIntelligenceSignalKey, { en: string; ko: string }> = {
    demand: { en: "Demand", ko: "수요" },
    growth: { en: "Growth", ko: "성장" },
    stability: { en: "Stability", ko: "안정성" },
    ai_exposure: { en: "AI exposure", ko: "AI 노출" },
    skills_change: { en: "Skills change", ko: "스킬 변화" },
    outlook: { en: "Outlook", ko: "전망" },
  }
  return names[signal][locale]
}

function statusLabels(status: CareerFutureDerivedStatus): { en: string; ko: string } {
  switch (status) {
    case "available":
      return { en: "Available", ko: "이용 가능" }
    case "limited":
      return { en: "Limited", ko: "제한적" }
    case "unavailable":
      return { en: "Unavailable", ko: "미확인" }
  }
}

export function futureOutlookStatusLabel(status: CareerFutureDerivedStatus, locale: FutureOutlookLocale): string {
  return statusLabels(status)[locale]
}

function directionLabels(direction: CareerFutureDerivedDirection): { en: string; ko: string } | null {
  switch (direction) {
    case "positive":
      return { en: "Positive", ko: "긍정" }
    case "mixed":
      return { en: "Mixed", ko: "혼재" }
    case "negative":
      return { en: "Negative", ko: "부정" }
    case "neutral":
      return { en: "Neutral", ko: "중립" }
    case "unknown":
      return null
  }
}

export function futureOutlookDirectionLabel(
  direction: CareerFutureDerivedDirection,
  locale: FutureOutlookLocale,
): string | null {
  return directionLabels(direction)?.[locale] ?? null
}

function confidenceLabels(confidence: CareerFutureDerivedSignal["confidence"]): { en: string; ko: string } {
  switch (confidence) {
    case "verified":
      return { en: "Verified evidence", ko: "검증된 근거" }
    case "estimated":
      return { en: "Estimated evidence", ko: "추정 근거" }
    case "limited_evidence":
      return { en: "Limited evidence", ko: "제한된 근거" }
    case "unavailable":
      return { en: "Evidence unavailable", ko: "근거 없음" }
  }
}

export function futureOutlookConfidenceLabel(confidence: CareerFutureDerivedSignal["confidence"], locale: FutureOutlookLocale): string {
  return confidenceLabels(confidence)[locale]
}

/**
 * Unavailable signals are shown, not hidden, with a neutral state.
 * Available/limited signals use their derived value instead.
 */
export function futureOutlookUnavailableTitle(status: CareerFutureDerivedStatus, locale: FutureOutlookLocale): string | null {
  if (status !== "unavailable") return null
  return tr(locale, "검증된 근거가 충분하지 않습니다", "Not enough verified evidence")
}

export function futureOutlookSectionCopy(locale: FutureOutlookLocale): { eyebrow: string; title: string; description: string } {
  return {
    eyebrow: tr(locale, "향후 전망", "Future outlook"),
    title: tr(locale, "향후 전망", "Future outlook"),
    description: tr(
      locale,
      "수요, 성장, 안정성, AI 노출, 스킬 변화, 전망의 여섯 신호를 확인할 수 있는 제한된 근거 기반 요약입니다. 점수가 아니라 맥락이며, 전망 중인 근거는 잠정적입니다.",
      "A bounded, evidence-based summary of six signals — Demand, Growth, Stability, AI exposure, Skills change and Outlook — for this career in Ireland. It is context, not a score, and future-looking evidence is provisional.",
    ),
  }
}

export function futureOutlookCardCopy(locale: FutureOutlookLocale) {
  return {
    whyThisSignal: tr(locale, "이 신호가 무엇인가요?", "Why this signal?"),
    whyThisSignalDetails: tr(locale, "신호의 정의, 경계와 근거 출처를 확인할 수 있습니다.", "The signal definition, its boundaries and the supporting sources."),
    sources: tr(locale, "출처", "Sources"),
    confidence: tr(locale, "근거 수준", "Confidence"),
    referencePeriod: tr(locale, "기준 기간", "Reference period"),
    geography: tr(locale, "지역", "Geography"),
    open: tr(locale, "자세히", "Details"),
  }
}

/**
 * The AI exposure boundary is fixed copy, never derived from raw values.
 * It says degree of task exposure, never disappearance or automation odds.
 */
export function futureOutlookAiExposureBoundary(locale: FutureOutlookLocale): string {
  return tr(
    locale,
    "AI 노출은 이 직업의 직무가 AI 변화에 얼마나 노출되는지를 측정하는 지표입니다. 일자리 소멸이나 자동화 확률, 해고 예측을 의미하지 않습니다.",
    "AI exposure measures the degree to which this occupation's tasks may be exposed to AI-driven change. It is not a probability of job loss, automation or layoffs.",
  )
}

export function futureOutlookSignalMeaning(signal: CareerFutureIntelligenceSignalKey): string {
  return CAREER_FUTURE_INTELLIGENCE_SIGNAL_DEFINITIONS[signal].meaning
}

export function futureOutlookSignalDoesNotMean(signal: CareerFutureIntelligenceSignalKey): readonly string[] {
  return CAREER_FUTURE_INTELLIGENCE_SIGNAL_DEFINITIONS[signal].doesNotMean
}

export function futureOutlookSignalUserFacingBoundary(signal: CareerFutureIntelligenceSignalKey): string {
  return CAREER_FUTURE_INTELLIGENCE_SIGNAL_DEFINITIONS[signal].userFacingBoundary
}

export function futureOutlookPeriodAndGeography(signal: CareerFutureDerivedSignal): string | null {
  const parts = [signal.referencePeriod?.label, signal.geography?.label].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : null
}

/** Presentation label for a proxy boundary so the caveat is never hidden. */
export function futureOutlookProxyNote(proxyDisclosure: CareerFutureProxyDisclosure, locale: FutureOutlookLocale): string | null {
  switch (proxyDisclosure) {
    case "proxy":
      return tr(locale, "근접 직업 그룹 대체 근거", "Nearby occupation-group proxy evidence")
    case "broader_proxy":
      return tr(locale, "더 넓은 직업 그룹 대체 근거", "Broader occupation-group proxy evidence")
    default:
      return null
  }
}