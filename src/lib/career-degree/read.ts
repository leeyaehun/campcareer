import "server-only"

import { cache } from "react"
import { getCareer } from "@/lib/career-data-foundation/career-catalogue"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type {
  CareerDegreePath,
  CountryDegreeConnection,
  DegreeCareerOutcome,
  DegreeCareerReadModel,
  DegreeConcept,
} from "./contract"

type DegreeRow = {
  id: string
  concept_key: string
  slug: string
  canonical_name: string
  description: string | null
}

type RelationRow = {
  canonical_career_id: string
  degree_id: string
  degree_key: string
  degree_slug: string
  degree_name: string
  degree_description: string | null
  relation_type: CareerDegreePath["relationType"]
  directness: CareerDegreePath["directness"]
  relationship_strength: CareerDegreePath["relationshipStrength"]
  rationale: string
  source_authority: string
  source_title: string
  source_url: string
  reference_period: string
  source_checked_at: string
}

const isCountryCode = (value: string) => /^[A-Z]{2}$/.test(value)

const strengthOrder: Record<CareerDegreePath["relationshipStrength"], number> = {
  primary: 0,
  strong: 1,
  supporting: 2,
}

function toDegreeConcept(row: DegreeRow): DegreeConcept {
  return {
    id: row.id,
    key: row.concept_key,
    slug: row.slug,
    name: row.canonical_name,
    description: row.description,
  }
}

function toEvidence(row: RelationRow) {
  return {
    authority: row.source_authority,
    title: row.source_title,
    url: row.source_url,
    referencePeriod: row.reference_period,
    checkedAt: row.source_checked_at,
  }
}

function toDegreeCareerOutcome(row: RelationRow): DegreeCareerOutcome | null {
  const career = getCareer(row.canonical_career_id)
  if (!career) return null

  return {
    careerId: career.id,
    careerName: career.label,
    careerNameKo: career.labelKo,
    relationType: row.relation_type,
    directness: row.directness,
    relationshipStrength: row.relationship_strength,
    rationale: row.rationale,
    evidence: toEvidence(row),
  }
}

function compareCareerOutcomes(left: DegreeCareerOutcome, right: DegreeCareerOutcome) {
  return strengthOrder[left.relationshipStrength] - strengthOrder[right.relationshipStrength]
    || left.careerName.localeCompare(right.careerName)
}

function relationUnavailable(error: { code?: string } | null) {
  // During a rolling application/database release, retain the existing Career
  // page rather than treating a not-yet-migrated graph as a data failure.
  return error?.code === "42P01" || error?.code === "PGRST205"
}

async function loadRelations(countryCode: string, careerId?: string, degreeConceptId?: string) {
  let query = supabaseAdmin
    .from("career_degree_relation_read_v1")
    .select("canonical_career_id,degree_id,degree_key,degree_slug,degree_name,degree_description,relation_type,directness,relationship_strength,rationale,source_authority,source_title,source_url,reference_period,source_checked_at")
    .eq("country_code", countryCode)

  if (careerId) query = query.eq("canonical_career_id", careerId)
  if (degreeConceptId) query = query.eq("degree_id", degreeConceptId)

  const result = await query
    .order("relationship_strength", { ascending: true })
    .order("canonical_career_id", { ascending: true })

  if (result.error) {
    if (relationUnavailable(result.error)) return [] as RelationRow[]
    throw result.error
  }

  return (result.data ?? []) as RelationRow[]
}

async function loadCareerDegreePaths(countryCode: string, careerId: string): Promise<CareerDegreePath[]> {
  const country = countryCode.trim().toUpperCase()
  const career = careerId.trim()
  if (!isCountryCode(country) || !getCareer(career)) return []

  const relations = await loadRelations(country, career)
  if (relations.length === 0) return []

  return relations
    .map((relation) => ({
      degree: toDegreeConcept({
        id: relation.degree_id,
        concept_key: relation.degree_key,
        slug: relation.degree_slug,
        canonical_name: relation.degree_name,
        description: relation.degree_description,
      }),
      relationType: relation.relation_type,
      directness: relation.directness,
      relationshipStrength: relation.relationship_strength,
      rationale: relation.rationale,
      evidence: toEvidence(relation),
    }))
    .sort((left, right) =>
      strengthOrder[left.relationshipStrength] - strengthOrder[right.relationshipStrength]
      || left.degree.name.localeCompare(right.degree.name),
    )
}

async function loadCountryDegreeConnections(countryCode: string): Promise<CountryDegreeConnection[]> {
  const country = countryCode.trim().toUpperCase()
  if (!isCountryCode(country)) return []

  // One read from the reviewed relation view keeps country Degree cards and
  // their Career links consistent without querying once per Degree.
  const relations = await loadRelations(country)
  const connectionsByDegree = new Map<string, {
    degree: DegreeConcept
    careers: DegreeCareerOutcome[]
  }>()

  for (const relation of relations) {
    const career = toDegreeCareerOutcome(relation)
    if (!career) continue

    const degree = toDegreeConcept({
      id: relation.degree_id,
      concept_key: relation.degree_key,
      slug: relation.degree_slug,
      canonical_name: relation.degree_name,
      description: relation.degree_description,
    })
    const connection = connectionsByDegree.get(degree.id)
    if (connection) {
      connection.careers.push(career)
    } else {
      connectionsByDegree.set(degree.id, { degree, careers: [career] })
    }
  }

  return Array.from(connectionsByDegree.values())
    .map((connection) => ({
      degree: connection.degree,
      careers: connection.careers.sort(compareCareerOutcomes),
    }))
    .sort((left, right) => {
      const leftStrength = left.careers[0]?.relationshipStrength ?? "supporting"
      const rightStrength = right.careers[0]?.relationshipStrength ?? "supporting"
      return strengthOrder[leftStrength] - strengthOrder[rightStrength]
        || left.degree.name.localeCompare(right.degree.name)
    })
}

async function loadDegreeCareerReadModel(
  countryCode: string,
  degreeSlug: string,
): Promise<DegreeCareerReadModel | null> {
  const country = countryCode.trim().toUpperCase()
  const slug = degreeSlug.trim().toLowerCase()
  if (!isCountryCode(country) || !slug) return null

  const relationsResult = await supabaseAdmin
    .from("career_degree_relation_read_v1")
    .select("canonical_career_id,degree_id,degree_key,degree_slug,degree_name,degree_description,relation_type,directness,relationship_strength,rationale,source_authority,source_title,source_url,reference_period,source_checked_at")
    .eq("country_code", country)
    .eq("degree_slug", slug)
    .order("relationship_strength", { ascending: true })
    .order("canonical_career_id", { ascending: true })

  if (relationsResult.error) {
    if (relationUnavailable(relationsResult.error)) return null
    throw relationsResult.error
  }

  const relations = (relationsResult.data ?? []) as RelationRow[]
  const firstRelation = relations[0]
  if (!firstRelation) return null
  const degree = toDegreeConcept({
    id: firstRelation.degree_id,
    concept_key: firstRelation.degree_key,
    slug: firstRelation.degree_slug,
    canonical_name: firstRelation.degree_name,
    description: firstRelation.degree_description,
  })
  const careers = relations
    .flatMap((relation) => {
      const career = toDegreeCareerOutcome(relation)
      return career ? [career] : []
    })
    .sort(compareCareerOutcomes)

  return { countryCode: country, degree, careers }
}

/** Public-server read for the Career Page's evidence-backed study-path section. */
export const getCareerDegreePaths = cache(loadCareerDegreePaths)

/** Bidirectional Degree read model. A dedicated `/degrees` route is intentionally not created. */
export const getDegreeCareerReadModel = cache(loadDegreeCareerReadModel)

/** Country Hub read: reviewed Degree concepts grouped with their Career links. */
export const getCountryDegreeConnections = cache(loadCountryDegreeConnections)
