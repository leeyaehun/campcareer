import "server-only"

import { cache } from "react"
import {
  getCareerDegreePaths,
  getCountryDegreeConnections,
} from "@/lib/career-degree/read"
import type {
  CareerDegreePath,
  CountryDegreeConnection,
  DegreeCareerOutcome,
  IrelandInstitutionCareerDegreeEvidence,
  ReviewedEvidenceInstitution,
} from "@/lib/career-degree/contract"
import { normalizeInstitutionSlugSegment } from "@/lib/institutions/institution-search"
import {
  getIrelandInstitutions,
  type IrelandInstitution,
} from "@/lib/institutions/ireland-institutions.server"

const strengthOrder: Record<CareerDegreePath["relationshipStrength"], number> = {
  primary: 0,
  strong: 1,
  supporting: 2,
}

function sourceHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return null
  }
}

function reviewedEvidenceInstitution(
  evidence: { authority: string; url: string },
  institutions: readonly IrelandInstitution[],
): ReviewedEvidenceInstitution | null {
  const evidenceHost = sourceHost(evidence.url)
  if (!evidenceHost) return null

  const institution = institutions.find((candidate) => (
    candidate.name === evidence.authority.trim()
    && sourceHost(candidate.websiteUrl) === evidenceHost
  ))
  if (!institution) return null

  return {
    countryCode: "IE",
    id: institution.id,
    slug: institution.slug,
    name: institution.name,
  }
}

function withEvidenceInstitution(
  path: CareerDegreePath,
  institutions: readonly IrelandInstitution[],
): CareerDegreePath {
  return {
    ...path,
    evidenceInstitution: reviewedEvidenceInstitution(path.evidence, institutions),
  }
}

function withEvidenceInstitutionOutcome(
  career: DegreeCareerOutcome,
  institutions: readonly IrelandInstitution[],
): DegreeCareerOutcome {
  return {
    ...career,
    evidenceInstitution: reviewedEvidenceInstitution(career.evidence, institutions),
  }
}

async function verifiedIrelandInstitutionsForEvidence() {
  try {
    return await getIrelandInstitutions()
  } catch (error) {
    // The Career ↔ Degree relationship remains public when the separate
    // Institution publication source is temporarily unavailable. We simply
    // withhold the internal Institution continuation.
    console.error("Unable to load verified Ireland institutions for Career-Degree evidence", error)
    return [] as readonly IrelandInstitution[]
  }
}

async function loadIrelandCareerDegreePaths(careerId: string): Promise<CareerDegreePath[]> {
  const [paths, institutions] = await Promise.all([
    getCareerDegreePaths("IE", careerId),
    verifiedIrelandInstitutionsForEvidence(),
  ])

  return paths.map((path) => withEvidenceInstitution(path, institutions))
}

async function loadIrelandCountryDegreeInstitutionConnections(): Promise<CountryDegreeConnection[]> {
  const [connections, institutions] = await Promise.all([
    getCountryDegreeConnections("IE"),
    verifiedIrelandInstitutionsForEvidence(),
  ])

  return connections.map((connection) => ({
    ...connection,
    careers: connection.careers.map((career) => withEvidenceInstitutionOutcome(career, institutions)),
  }))
}

async function loadIrelandInstitutionCareerDegreeEvidence(
  institutionSlug: string,
): Promise<IrelandInstitutionCareerDegreeEvidence[]> {
  const slug = normalizeInstitutionSlugSegment(institutionSlug)
  if (!slug) return []

  const connections = await getIrelandCountryDegreeInstitutionConnections()
  return connections
    .flatMap((connection) => connection.careers.flatMap((career) => {
      const institution = career.evidenceInstitution
      return institution?.slug === slug
        ? [{ degree: connection.degree, career, institution }]
        : []
    }))
    .sort((left, right) => (
      strengthOrder[left.career.relationshipStrength] - strengthOrder[right.career.relationshipStrength]
      || left.degree.name.localeCompare(right.degree.name)
      || left.career.careerName.localeCompare(right.career.careerName)
    ))
}

/** P1.4 Career read: reviewed Degree paths with a verified provider-evidence Institution when exact evidence matches. */
export const getIrelandCareerDegreePaths = cache(loadIrelandCareerDegreePaths)

/** P1.4 Country read: reviewed Degree → Career cards with verified provider-evidence Institutions. */
export const getIrelandCountryDegreeInstitutionConnections = cache(loadIrelandCountryDegreeInstitutionConnections)

/** P1.4 Institution read: only reviewed Degree/Career relations supported by this Institution's provider evidence. */
export const getIrelandInstitutionCareerDegreeEvidence = cache(loadIrelandInstitutionCareerDegreeEvidence)
