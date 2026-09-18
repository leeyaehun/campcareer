import {
  getIrelandCareerDegreeMatches,
  getIrelandDegreeCareerMatches,
  IRELAND_DEGREE_MATCH_MODEL,
  IRELAND_DEGREE_MATCH_MODEL_CAREER_IDS,
  type DegreeMatchDerivedStatus,
  type IrelandCareerDegreeMatch,
} from "@/lib/degree-match/ireland-model"
import type {
  DegreeMatchEvidenceLevel,
  DegreeMatchRelationshipType,
  DegreeMatchStrength,
  DegreeMatchTrainingState,
} from "@/lib/degree-match/contract"
import { getIrelandCareerFutureSignal } from "@/lib/career-future-intelligence-model"
import { futureOutlookDirectionLabel } from "@/lib/career-future-intelligence-ui"

/**
 * P3.3 Ireland Degree Match UI view-model.
 *
 * This module converts the P3.2 derived model into bounded, human-readable
 * presentation contexts. It never reinterprets P3.1 raw evidence and never
 * derives a numeric Match Score. The only cross-pillar read is a lightweight
 * P2 (Future Intelligence) continuation, which stays entirely separate from
 * the Degree Match model.
 */

export type DegreeMatchLocale = "en" | "ko"

export const DEGREE_MATCH_COUNTRY_CODE = "IE"

const tr = (locale: DegreeMatchLocale, ko: string, en: string) => (locale === "ko" ? ko : en)

export function degreeMatchSectionVisible(countryCode: string, careerId: string): boolean {
  return countryCode === DEGREE_MATCH_COUNTRY_CODE && getIrelandCareerDegreeMatches(careerId).length > 0
}

export function degreeMatchEducationDegrees(): readonly IrelandCareerDegreeMatch[] {
  return IRELAND_DEGREE_MATCH_MODEL
}

function relationshipTypeLabels(relationshipType: DegreeMatchRelationshipType): { en: string; ko: string } {
  switch (relationshipType) {
    case "direct":
      return { en: "Direct pathway", ko: "직접 경로" }
    case "common":
      return { en: "Common pathway", ko: "일반적인 경로" }
    case "alternative":
      return { en: "Alternative pathway", ko: "대안 경로" }
    case "optional":
      return { en: "Optional pathway", ko: "선택 경로" }
    case "insufficient_alone":
      return { en: "Relevant pathway — additional requirements apply", ko: "관련 경로 — 추가 요건 적용" }
  }
}

export function degreeMatchRelationshipTypeLabel(
  relationshipType: DegreeMatchRelationshipType,
  locale: DegreeMatchLocale,
): string {
  return relationshipTypeLabels(relationshipType)[locale]
}

function strengthLabels(strength: DegreeMatchStrength): { en: string; ko: string } {
  switch (strength) {
    case "strong":
      return { en: "Strong relationship", ko: "강한 관계" }
    case "moderate":
      return { en: "Moderate relationship", ko: "중간 관계" }
    case "contextual":
      return { en: "Contextual relationship", ko: "맥락적 관계" }
    case "unavailable":
      return { en: "Unavailable", ko: "미확인" }
  }
}

export function degreeMatchStrengthLabel(strength: DegreeMatchStrength, locale: DegreeMatchLocale): string {
  return strengthLabels(strength)[locale]
}

function confidenceLabels(confidence: DegreeMatchEvidenceLevel): { en: string; ko: string } {
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

export function degreeMatchConfidenceLabel(confidence: DegreeMatchEvidenceLevel, locale: DegreeMatchLocale): string {
  return confidenceLabels(confidence)[locale]
}

function statusLabels(status: DegreeMatchDerivedStatus): { en: string; ko: string } {
  switch (status) {
    case "available":
      return { en: "Available", ko: "이용 가능" }
    case "limited":
      return { en: "Limited", ko: "제한적" }
    case "unavailable":
      return { en: "Unavailable", ko: "미확인" }
  }
}

export function degreeMatchStatusLabel(status: DegreeMatchDerivedStatus, locale: DegreeMatchLocale): string {
  return statusLabels(status)[locale]
}

function qualificationLabels(state: DegreeMatchTrainingState): { en: string; ko: string } {
  switch (state) {
    case "professional_registration_required":
      return { en: "Professional registration required in Ireland", ko: "아일랜드에서 전문 자격 등록 필요" }
    case "accredited_programme_required":
      return { en: "Accredited programme required for professional recognition", ko: "전문 인정을 위한 인증 과정(M) 필요" }
    case "postgraduate_conversion_required":
      return { en: "Postgraduate conversion study commonly required", ko: "대학원 전환 과정이 보통 필요" }
    case "professional_exam_required":
      return { en: "Professional examination required", ko: "전문 시험 필요" }
    case "supervised_practice_required":
      return { en: "Supervised practice required", ko: "수련·감독 실무 필요" }
    case "additional_certification_or_training_commonly_required":
      return { en: "Additional certification or training commonly required", ko: "추가 자격·훈련이 보통 요구됨" }
    case "multiple_requirements":
      return { en: "Multiple professional requirements apply", ko: "여러 전문 요건 적용" }
    case "none_verified":
      return { en: "No verified mandatory qualification", ko: "검증된 필수 자격 없음" }
    case "unavailable":
      return { en: "Qualification evidence unavailable", ko: "자격 근거 없음" }
  }
}

export function degreeMatchQualificationLabel(state: DegreeMatchTrainingState, locale: DegreeMatchLocale): string {
  return qualificationLabels(state)[locale]
}

export function degreeMatchSectionCopy(locale: DegreeMatchLocale): { eyebrow: string; title: string; description: string } {
  return {
    eyebrow: tr(locale, "학위 매치", "Degree match"),
    title: tr(
      locale,
      "이 커리어를 위해 무엇을 공부해야 할까요?",
      "What should I study for this career?",
    ),
    description: tr(
      locale,
      "검토된 아일랜드 학위 관계를 범주형으로 보여줍니다. 숫자 점수나 순위가 아니라 학위 경로의 종류와 근거 수준을 확인하세요.",
      "Reviewed Ireland Degree relationships shown categorically — the kind of pathway and the strength of the evidence, never a numeric match score or ranking.",
    ),
  }
}

export function degreeMatchReverseSectionCopy(locale: DegreeMatchLocale): { eyebrow: string; title: string; description: string } {
  return {
    eyebrow: tr(locale, "학위 → 커리어", "Degree → Career"),
    title: tr(locale, "이 학위는 어떤 커리어로 이어질까요?", "What Careers can this Degree lead toward?"),
    description: tr(
      locale,
      "각 학위는 검토된 아일랜드 관련 커리어로 이어집니다. 커리어 링크는 정식 커리어 페이지로 이동합니다.",
      "Each Degree leads toward reviewed Ireland Careers. Career links open the canonical Career Page.",
    ),
  }
}

export function degreeMatchBoundaryNote(locale: DegreeMatchLocale): string {
  return tr(
    locale,
    "이 학위는 특정 대학 프로그램을 의미하지 않으며 현지 등록, 근무 자격 또는 취업을 보장하지 않습니다.",
    "This Degree is a field of study, not a specific university programme, and it does not guarantee registration, work eligibility or employment.",
  )
}

export function degreeMatchQualificationNote(locale: DegreeMatchLocale): string {
  return tr(
    locale,
    "자격 요건",
    "Qualification requirement",
  )
}

export function degreeMatchRegulationNote(locale: DegreeMatchLocale): string {
  return tr(locale, "규제 메모", "Regulation note")
}

/**
 * Lightweight P2 continuation for a Degree → Career card. Reads the P2 derived
 * model only and returns "Future outlook / Demand" labels when available, so
 * the Degree Match card never carries its own P2 interpretation.
 */
export function degreeMatchCareerOutlook(careerId: string, locale: DegreeMatchLocale): readonly string[] {
  const outlook = getIrelandCareerFutureSignal(careerId, "outlook")
  const demand = getIrelandCareerFutureSignal(careerId, "demand")
  const parts: string[] = []
  if (outlook) {
    const label = futureOutlookDirectionLabel(outlook.direction, locale)
    if (label) parts.push(tr(locale, `전망: ${label}`, `Outlook: ${label}`))
  }
  if (demand) {
    const label = futureOutlookDirectionLabel(demand.direction, locale)
    if (label) parts.push(tr(locale, `수요: ${label}`, `Demand: ${label}`))
  }
  return parts
}

export function degreeMatchDegreeDetailPath(degreeId: string): string | null {
  if (!getIrelandDegreeCareerMatches(degreeId).length) return null
  return `/countries/ie/education#degree-${degreeId}`
}

export { IRELAND_DEGREE_MATCH_MODEL_CAREER_IDS, getIrelandDegreeCareerMatches }