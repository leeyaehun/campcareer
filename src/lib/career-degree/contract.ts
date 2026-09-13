export type CareerDegreeRelationType = "direct" | "common_pathway" | "related"
export type CareerDegreeDirectness = "direct" | "adjacent"
export type CareerDegreeRelationshipStrength = "primary" | "strong" | "supporting"

export type DegreeConcept = {
  id: string
  key: string
  slug: string
  name: string
  description: string | null
}

export type DegreePathEvidence = {
  authority: string
  title: string
  url: string
  referencePeriod: string
  checkedAt: string
}

/**
 * A verified Ireland Institution whose official provider page is the reviewed
 * evidence for a Career ↔ Degree relationship. It is not a programme listing.
 */
export type ReviewedEvidenceInstitution = {
  countryCode: "IE"
  id: string
  slug: string
  name: string
}

export type CareerDegreePath = {
  degree: DegreeConcept
  relationType: CareerDegreeRelationType
  directness: CareerDegreeDirectness
  relationshipStrength: CareerDegreeRelationshipStrength
  rationale: string
  evidence: DegreePathEvidence
  evidenceInstitution?: ReviewedEvidenceInstitution | null
}

export type DegreeCareerOutcome = {
  careerId: string
  careerName: string
  careerNameKo: string
  relationType: CareerDegreeRelationType
  directness: CareerDegreeDirectness
  relationshipStrength: CareerDegreeRelationshipStrength
  rationale: string
  evidence: DegreePathEvidence
  evidenceInstitution?: ReviewedEvidenceInstitution | null
}

export type DegreeCareerReadModel = {
  countryCode: string
  degree: DegreeConcept
  careers: readonly DegreeCareerOutcome[]
}

/** A country-scoped Degree concept with every reviewed Career connection. */
export type CountryDegreeConnection = {
  degree: DegreeConcept
  careers: readonly DegreeCareerOutcome[]
}

/** A reviewed Ireland Career ↔ Degree relation shown on its evidence Institution. */
export type IrelandInstitutionCareerDegreeEvidence = {
  degree: DegreeConcept
  career: DegreeCareerOutcome
  institution: ReviewedEvidenceInstitution
}
