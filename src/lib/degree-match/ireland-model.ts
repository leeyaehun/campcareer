import {
  IRELAND_DEGREE_MATCH_ALIASES,
  IRELAND_DEGREE_MATCH_CAREER_IDS,
  IRELAND_DEGREE_MATCH_DEGREE_IDS,
  IRELAND_DEGREE_MATCH_RELATIONS,
} from "@/lib/degree-match/ireland-evidence"
import type {
  DegreeMatchEvidence,
  DegreeMatchEvidenceKind,
  DegreeMatchEvidenceLevel,
  DegreeMatchGeographyScope,
  DegreeMatchRelationshipType,
  DegreeMatchStrength,
  DegreeMatchTrainingState,
  DegreeMatchRelation,
} from "@/lib/degree-match/contract"
import { IE_CAREER_COMPARE_LABELS } from "@/lib/ireland-career-comparison"

/**
 * P3.2 Ireland Degree Match derived model.
 *
 * Transforms the P3.1 verified evidence layer into stable product-ready
 * Career ↔ Degree outputs. The model is explainable and categorical: it
 * defines no numeric Degree Match score, no ranking, and no percentage.
 * Every derived value traces to a P3.1 relation record, and the same
 * relationship truth feeds both Career → Degree and Degree → Career.
 */

export type DegreeMatchDerivedStatus = "available" | "limited" | "unavailable"
export type DegreeMatchEvidenceDirectness = "direct" | "proxy" | "mixed"

export type DegreeMatchDerivedEvidenceReference = {
  id: string
  title: string
  publisher: string
  url: string
  kind: DegreeMatchEvidenceKind
  directness: "direct" | "proxy"
  geography: { scope: DegreeMatchGeographyScope; countryCode: string | null; label: string }
  referencePeriod: string
  checkedDate: string
  limitations: string | null
}

export type DegreeMatchDerivedAdditionalQualification = {
  state: DegreeMatchTrainingState
  additionalTrainingRequired: boolean | null
  details: string
  professionalEligibilitySeparate: true
}

export type DegreeMatchDerivedRegulation = {
  regulatedCareer: boolean
  regulatorName: string | null
  regulatorUrl: string | null
  accreditationRequired: boolean | null
  registrationRequired: boolean | null
  jurisdiction: string | null
  /** Product-ready summary. Degree Match never equals permission to practise. */
  summary: string
}

/** One finished Career ↔ Degree interpretation ready for P3.3 presentation. */
export type IrelandCareerDegreeMatch = {
  countryCode: "IE"
  careerId: string
  careerLabel: string
  degreeId: string
  degreeLabel: string
  relationshipType: DegreeMatchRelationshipType
  relationshipStrength: DegreeMatchStrength
  confidence: DegreeMatchEvidenceLevel
  status: DegreeMatchDerivedStatus
  geography: { scope: DegreeMatchGeographyScope; countryCode: string | null; label: string }
  interpretation: string
  rationale: string
  additionalQualification: DegreeMatchDerivedAdditionalQualification
  regulation: DegreeMatchDerivedRegulation
  evidenceDirectness: DegreeMatchEvidenceDirectness
  evidenceReferences: readonly DegreeMatchDerivedEvidenceReference[]
  missingEvidenceReasons: readonly string[]
  checkedDate: string
}

export const DEGREE_MATCH_RELATIONSHIP_INTERPRETATIONS: Record<DegreeMatchRelationshipType, string> = {
  direct: "A direct academic pathway into this career.",
  common: "A commonly relevant academic pathway.",
  alternative: "Can support entry with additional specialization or experience.",
  optional: "Relevant, but a degree is not necessarily required.",
  insufficient_alone: "Relevant study, but additional professional requirements apply.",
}

export function deriveDegreeMatchStatus(
  evidenceLevel: DegreeMatchEvidenceLevel,
): DegreeMatchDerivedStatus {
  switch (evidenceLevel) {
    case "verified":
      return "available"
    case "estimated":
    case "limited_evidence":
      return "limited"
    case "unavailable":
      return "unavailable"
  }
}

function evidenceDirectness(items: readonly DegreeMatchEvidence[]): DegreeMatchEvidenceDirectness {
  const direct = items.some((item) => item.directness === "direct")
  const proxy = items.some((item) => item.directness === "proxy")
  if (direct && proxy) return "mixed"
  return direct ? "direct" : "proxy"
}

function regulationSummary(relation: DegreeMatchRelation): string {
  const regulation = relation.regulation
  const qualification = relation.qualification
  if (regulation.regulatedCareer) {
    const regulator = regulation.regulatorName ?? "the regulator"
    return `${regulator} registration and an approved qualification are required to practise in Ireland; a Degree Match does not grant permission to practise.`
  }
  if (qualification.state === "accredited_programme_required") {
    return "Not statutorily registered in Ireland; professional recognition follows programme-specific accreditation (verified per programme), and the Degree alone does not confer professional status."
  }
  if (qualification.additionalTrainingRequired === true) {
    return "Not regulated; no verified mandatory Degree, and additional technical skills, professional development or experience commonly apply before full entry."
  }
  return "Not regulated; no verified legal or statutory entry requirement makes the Degree mandatory."
}

function deriveDegreeMatch(relation: DegreeMatchRelation): IrelandCareerDegreeMatch {
  return {
    countryCode: "IE",
    careerId: relation.careerId,
    careerLabel: IE_CAREER_COMPARE_LABELS[relation.careerId as keyof typeof IE_CAREER_COMPARE_LABELS] ?? relation.careerId,
    degreeId: relation.degree.id,
    degreeLabel: relation.degree.canonicalName,
    relationshipType: relation.relationshipType,
    relationshipStrength: relation.strength,
    confidence: relation.evidenceLevel,
    status: deriveDegreeMatchStatus(relation.evidenceLevel),
    geography: relation.geography,
    interpretation: DEGREE_MATCH_RELATIONSHIP_INTERPRETATIONS[relation.relationshipType],
    rationale: relation.rationale,
    additionalQualification: {
      state: relation.qualification.state,
      additionalTrainingRequired: relation.qualification.additionalTrainingRequired,
      details: relation.qualification.details,
      professionalEligibilitySeparate: relation.qualification.professionalEligibilitySeparate,
    },
    regulation: {
      regulatedCareer: relation.regulation.regulatedCareer,
      regulatorName: relation.regulation.regulatorName ?? null,
      regulatorUrl: relation.regulation.regulatorUrl ?? null,
      accreditationRequired: relation.regulation.accreditationRequired,
      registrationRequired: relation.regulation.registrationRequired,
      jurisdiction: relation.regulation.jurisdiction,
      summary: regulationSummary(relation),
    },
    evidenceDirectness: evidenceDirectness(relation.evidence),
    evidenceReferences: relation.evidence.map((item) => ({
      id: item.id,
      title: item.title,
      publisher: item.publisher,
      url: item.url,
      kind: item.kind,
      directness: item.directness,
      geography: item.geography,
      referencePeriod: item.referencePeriod,
      checkedDate: item.checkedDate,
      limitations: item.limitations ?? null,
    })),
    missingEvidenceReasons: (relation.missingEvidence ?? []).map((item) => item.reason),
    checkedDate: relation.checkedDate,
  }
}

const careersById = new Map<string, IrelandCareerDegreeMatch>(
  IRELAND_DEGREE_MATCH_CAREER_IDS.map((careerId) => {
    const relation = IRELAND_DEGREE_MATCH_RELATIONS.find((row) => row.careerId === careerId)
    if (!relation) throw new Error(`Missing P3.1 relation for ${careerId}`)
    return [careerId, deriveDegreeMatch(relation)] as const
  }),
)

/** Deterministic model results for the six reviewed Ireland relations. */
export const IRELAND_DEGREE_MATCH_MODEL: readonly IrelandCareerDegreeMatch[] =
  IRELAND_DEGREE_MATCH_CAREER_IDS.map((careerId) => careersById.get(careerId)!)

export const IRELAND_DEGREE_MATCH_MODEL_CAREER_IDS = IRELAND_DEGREE_MATCH_CAREER_IDS
export const IRELAND_DEGREE_MATCH_MODEL_DEGREE_IDS = IRELAND_DEGREE_MATCH_DEGREE_IDS

/** "What can I study for this Career?" — shares the single P3.1 relationship truth. */
export function getIrelandCareerDegreeMatches(careerId: string): readonly IrelandCareerDegreeMatch[] {
  const result = careersById.get(careerId)
  return result ? [result] : []
}

/** "What Careers can this Degree lead toward?" — same underlying relationship records. */
export function getIrelandDegreeCareerMatches(degreeId: string): readonly IrelandCareerDegreeMatch[] {
  return IRELAND_DEGREE_MATCH_MODEL.filter((result) => result.degreeId === degreeId)
}

/**
 * Resolves a source label to a degree ONLY through an explicit P3.1 mapping.
 * Unverified labels never become canonical Degrees, per the P3.0 normalization
 * boundary (canonicalEquivalent is always false).
 */
export function getVerifiedIrelandDegreeAlias(sourceLabel: string): string | null {
  const mapping = IRELAND_DEGREE_MATCH_ALIASES.find((alias) => alias.sourceLabel === sourceLabel)
  return mapping ? mapping.canonicalDegreeId : null
}

export { IRELAND_DEGREE_MATCH_ALIASES }