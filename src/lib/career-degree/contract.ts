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

export type CareerDegreePath = {
  degree: DegreeConcept
  relationType: CareerDegreeRelationType
  directness: CareerDegreeDirectness
  relationshipStrength: CareerDegreeRelationshipStrength
  rationale: string
  evidence: DegreePathEvidence
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
}

export type DegreeCareerReadModel = {
  countryCode: string
  degree: DegreeConcept
  careers: readonly DegreeCareerOutcome[]
}
