/**
 * P2.4 Future-outlook filter and card preview for Career discovery (/careers).
 *
 * This module converts the derived P2.2 model into deterministic, shareable
 * filter tokens and concise result-card previews for exactly the six reviewed
 * Ireland careers. It never fabricates scores: filters match categorical and
 * directional model outputs only, and missing evidence is an explicit state,
 * never a negative one.
 */

import {
  getIrelandCareerFutureSignal,
  IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS,
  isIrelandCareerFutureCareerId,
  type CareerFutureDerivedSignal,
} from "@/lib/career-future-intelligence-model"
import {
  futureOutlookDirectionLabel,
  futureOutlookSectionVisible,
  futureOutlookSignalName,
  futureOutlookStatusLabel,
  type FutureOutlookLocale,
} from "@/lib/career-future-intelligence-ui"

export const FUTURE_FILTER_COUNTRY_CODE = "IE"

export type FutureFilterGroupKey = "demand" | "outlook"

export type FutureFilterToken =
  | "demand_positive"
  | "demand_mixed"
  | "demand_limited_evidence"
  | "outlook_positive"
  | "outlook_mixed"
  | "outlook_unavailable"

export const FUTURE_FILTER_TOKENS: readonly FutureFilterToken[] = [
  "demand_positive",
  "demand_mixed",
  "demand_limited_evidence",
  "outlook_positive",
  "outlook_mixed",
  "outlook_unavailable",
]

const FUTURE_FILTER_TOKEN_SET = new Set<string>(FUTURE_FILTER_TOKENS)

export type FutureFilterChip = {
  token: FutureFilterToken
  labelEn: string
  labelKo: string
}

export type FutureFilterGroup = {
  key: FutureFilterGroupKey
  tokens: readonly FutureFilterChip[]
}

export const FUTURE_FILTER_GROUPS: readonly FutureFilterGroup[] = [
  {
    key: "demand",
    tokens: [
      { token: "demand_positive", labelEn: "Positive", labelKo: "긍정" },
      { token: "demand_mixed", labelEn: "Mixed", labelKo: "혼재" },
      { token: "demand_limited_evidence", labelEn: "Limited evidence", labelKo: "제한된 근거" },
    ],
  },
  {
    key: "outlook",
    tokens: [
      { token: "outlook_positive", labelEn: "Positive", labelKo: "긍정" },
      { token: "outlook_mixed", labelEn: "Mixed", labelKo: "혼재" },
      { token: "outlook_unavailable", labelEn: "Unavailable", labelKo: "미확인" },
    ],
  },
]

/**
 * Single `future` query param, deterministic validation. Unknown or malformed
 * values are ignored rather than interpreted, so shared links stay stable.
 */
export function parseFutureFilter(raw: string | null | undefined): FutureFilterToken | null {
  if (typeof raw !== "string") return null
  return FUTURE_FILTER_TOKEN_SET.has(raw) ? (raw as FutureFilterToken) : null
}

export function futureFilterGroupLabel(group: FutureFilterGroupKey, locale: FutureOutlookLocale): string {
  return futureOutlookSignalName(group, locale)
}

export function futureFilterTokenLabel(token: FutureFilterToken, locale: FutureOutlookLocale): string {
  const group = FUTURE_FILTER_GROUPS.find((candidate) => candidate.tokens.some((chip) => chip.token === token))
  const chip = group?.tokens.find((candidate) => candidate.token === token)
  if (chip) return locale === "ko" ? chip.labelKo : chip.labelEn
  return futureOutlookStatusLabel("unavailable", locale)
}

export function futureFilterMatchCount(token: FutureFilterToken): number {
  return IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS.reduce(
    (count, careerId) => count + (futureFilterMatchesCareer(careerId, token) ? 1 : 0),
    0,
  )
}

/**
 * Matches a career against a filter token using only categorical / directional
 * derived model values. Unsupported careers never match any token.
 */
export function futureFilterMatchesCareer(careerId: string, token: FutureFilterToken): boolean {
  if (!isIrelandCareerFutureCareerId(careerId)) return false
  const signalKey = token.startsWith("outlook") ? "outlook" : "demand"
  const signal = getIrelandCareerFutureSignal(careerId, signalKey)
  if (!signal) return false
  switch (token) {
    case "demand_positive":
    case "outlook_positive":
      return signal.status !== "unavailable" && signal.direction === "positive"
    case "demand_mixed":
    case "outlook_mixed":
      return signal.direction === "mixed"
    case "demand_limited_evidence":
      return signal.status === "limited"
    case "outlook_unavailable":
      return signal.status === "unavailable"
  }
}

/** The reviewed Ireland careers hidden by an active filter, used to keep hides explicit. */
export function futureFilterHiddenCareerIds(token: FutureFilterToken): readonly string[] {
  return IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS.filter((careerId) => !futureFilterMatchesCareer(careerId, token))
}

/**
 * Concise card preview: Outlook and Demand direction words only, with AI
 * exposure appended only when it has evidence (currently never for the six).
 */
function previewPart(signal: CareerFutureDerivedSignal | null, locale: FutureOutlookLocale): string | null {
  if (!signal) return null
  return futureOutlookDirectionLabel(signal.direction, locale) ?? futureOutlookStatusLabel(signal.status, locale)
}

export function futurePreviewForCareer(careerId: string, locale: FutureOutlookLocale): string | null {
  if (!futureOutlookSectionVisible(FUTURE_FILTER_COUNTRY_CODE, careerId)) return null
  const outlook = getIrelandCareerFutureSignal(careerId, "outlook")
  const demand = getIrelandCareerFutureSignal(careerId, "demand")
  const aiExposure = getIrelandCareerFutureSignal(careerId, "ai_exposure")
  const parts: string[] = []
  const outlookPart = previewPart(outlook, locale)
  if (outlookPart) parts.push(`${futureOutlookSignalName("outlook", locale)}: ${outlookPart}`)
  const demandPart = previewPart(demand, locale)
  if (demandPart) parts.push(`${futureOutlookSignalName("demand", locale)}: ${demandPart}`)
  const aiExposurePart = aiExposure && aiExposure.status !== "unavailable" ? previewPart(aiExposure, locale) : null
  if (aiExposurePart) parts.push(`${futureOutlookSignalName("ai_exposure", locale)}: ${aiExposurePart}`)
  return parts.length > 0 ? parts.join(" · ") : null
}

/** Fixed note shown while a Future filter is active, so hides never look silent. */
export function futureFilterActiveNote(locale: FutureOutlookLocale): string {
  return locale === "ko"
    ? "향후 전망 필터가 적용 중입니다. 선택한 수요·전망 근거에 해당하는 아일랜드 커리어를 표시합니다."
    : "Future outlook filter active — showing Ireland careers that match the selected Demand or Outlook evidence."
}

export function futureFilterHiddenNote(count: number, locale: FutureOutlookLocale): string | null {
  if (count <= 0) return null
  return locale === "ko"
    ? ` 이 필터에 해당하지 않는 검토 대상 커리어 ${count}개를 숨겼습니다.`
    : ` Hiding ${count} reviewed Ireland career${count === 1 ? "" : "s"} that do not match this filter.`
}