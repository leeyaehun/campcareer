/**
 * P3.0 Degree Match contract.
 *
 * This module defines the evidence-backed relationship between a canonical
 * Degree / field of study and a canonical Career. It deliberately contains
 * no ranking, percentage, or numeric match score and no Programme identity.
 */

export const DEGREE_MATCH_RELATIONSHIP_TYPES = [
  "direct",
  "common",
  "alternative",
  "optional",
  "insufficient_alone",
] as const
export type DegreeMatchRelationshipType = (typeof DEGREE_MATCH_RELATIONSHIP_TYPES)[number]

export const DEGREE_MATCH_STRENGTHS = ["strong", "moderate", "contextual", "unavailable"] as const
export type DegreeMatchStrength = (typeof DEGREE_MATCH_STRENGTHS)[number]

export const DEGREE_MATCH_EVIDENCE_LEVELS = ["verified", "estimated", "limited_evidence", "unavailable"] as const
export type DegreeMatchEvidenceLevel = (typeof DEGREE_MATCH_EVIDENCE_LEVELS)[number]

export const DEGREE_MATCH_EVIDENCE_KINDS = [
  "official_regulator",
  "official_government",
  "official_qualification_authority",
  "official_institution",
  "official_career_guidance",
  "other_authoritative_education",
] as const
export type DegreeMatchEvidenceKind = (typeof DEGREE_MATCH_EVIDENCE_KINDS)[number]

export const DEGREE_MATCH_TRAINING_STATES = [
  "none_verified",
  "professional_registration_required",
  "accredited_programme_required",
  "postgraduate_conversion_required",
  "professional_exam_required",
  "supervised_practice_required",
  "additional_certification_or_training_commonly_required",
  "multiple_requirements",
  "unavailable",
] as const
export type DegreeMatchTrainingState = (typeof DEGREE_MATCH_TRAINING_STATES)[number]

export const DEGREE_MATCH_GEOGRAPHY_SCOPES = ["global_academic", "country_pathway", "country_professional_requirement"] as const
export type DegreeMatchGeographyScope = (typeof DEGREE_MATCH_GEOGRAPHY_SCOPES)[number]

export const DEGREE_MATCH_ALIAS_RELATIONSHIPS = ["alias", "synonym", "broader", "narrower", "related"] as const
export type DegreeMatchAliasRelationship = (typeof DEGREE_MATCH_ALIAS_RELATIONSHIPS)[number]

export type DegreeMatchCanonicalDegree = {
  kind: "degree"
  id: string
  slug: string
  canonicalName: string
  description?: string | null
}

export type DegreeMatchProgrammeReference = {
  /** Programme evidence can support a Degree relation, but is never its identity. */
  kind: "programme_reference"
  programmeId: string
  institutionId?: string | null
}

export type DegreeMatchEvidence = {
  id: string
  title: string
  publisher: string
  url: string
  kind: DegreeMatchEvidenceKind
  level: Exclude<DegreeMatchEvidenceLevel, "unavailable">
  directness: "direct" | "proxy"
  geography: { scope: DegreeMatchGeographyScope; countryCode: string | null; label: string }
  referencePeriod: string
  checkedDate: string
  limitations?: string | null
}

export type DegreeMatchMissingEvidence = {
  id: string
  level: "unavailable"
  reason: string
  geography: { scope: DegreeMatchGeographyScope; countryCode: string | null; label: string }
  checkedDate: string
}

export type DegreeMatchQualification = {
  state: DegreeMatchTrainingState
  additionalTrainingRequired: boolean | null
  details: string
  /** Legal/professional eligibility is intentionally distinct from the degree relation. */
  professionalEligibilitySeparate: true
}

export type DegreeMatchRegulation = {
  regulatedCareer: boolean
  regulatorName?: string | null
  regulatorUrl?: string | null
  accreditationRequired: boolean | null
  registrationRequired: boolean | null
  jurisdiction: string | null
}

export type DegreeMatchRelation = {
  id: string
  countryCode: string
  careerId: string
  degree: DegreeMatchCanonicalDegree
  relationshipType: DegreeMatchRelationshipType
  strength: DegreeMatchStrength
  evidenceLevel: DegreeMatchEvidenceLevel
  geography: { scope: DegreeMatchGeographyScope; countryCode: string | null; label: string }
  rationale: string
  qualification: DegreeMatchQualification
  regulation: DegreeMatchRegulation
  evidence: readonly DegreeMatchEvidence[]
  missingEvidence?: readonly DegreeMatchMissingEvidence[]
  programmeEvidence?: readonly DegreeMatchProgrammeReference[]
  checkedDate: string
}

export type DegreeMatchAliasMapping = {
  sourceLabel: string
  canonicalDegreeId: string
  relationship: DegreeMatchAliasRelationship
  mappingConfidence: "high" | "medium" | "low" | "unavailable"
  evidenceRequired: boolean
  /** False by default: a label mapping never silently creates equivalence. */
  canonicalEquivalent: false
  rationale: string
}

export type CareerDegreeMatchesQuery = { countryCode: string; careerId: string }
export type DegreeCareerMatchesQuery = { countryCode: string; degreeId: string }

export const DEGREE_MATCH_P2_SIGNAL_KEYS = [
  "demand", "growth", "stability", "ai_exposure", "skills_change", "outlook",
] as const

export function validateDegreeMatchRelation(relation: DegreeMatchRelation): string[] {
  const errors: string[] = []
  if (!/^[A-Z]{2}$/.test(relation.countryCode)) errors.push("countryCode must be an ISO alpha-2 code")
  if (!relation.careerId.trim()) errors.push("careerId is required")
  if (!relation.degree.id.trim() || !relation.degree.slug.trim()) errors.push("canonical Degree identity is required")
  if (!relation.rationale.trim()) errors.push("rationale is required")
  if (relation.evidenceLevel === "unavailable" && relation.evidence.length > 0) errors.push("unavailable evidence cannot include evidence observations")
  if (relation.evidenceLevel !== "unavailable" && relation.evidence.length === 0) errors.push("available evidence requires at least one observation")
  if (relation.geography.countryCode !== null && relation.geography.countryCode !== relation.countryCode) errors.push("geography countryCode must match relation countryCode")
  if (relation.qualification.professionalEligibilitySeparate !== true) errors.push("professional eligibility must remain separate")
  return errors
}
