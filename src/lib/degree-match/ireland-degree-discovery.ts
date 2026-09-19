import {
  IRELAND_DEGREE_MATCH_MODEL,
} from "@/lib/degree-match/ireland-model"
import {
  degreeMatchBoundaryNote,
  degreeMatchCareerOutlook,
  degreeMatchConfidenceLabel,
  degreeMatchDegreeDetailPath,
  degreeMatchQualificationLabel,
  degreeMatchQualificationNote,
  degreeMatchRegulationNote,
  degreeMatchRelationshipTypeLabel,
  degreeMatchStrengthLabel,
  type DegreeMatchLocale,
} from "@/lib/degree-match/ireland-degree-match-ui"
import {
  buildIrelandDegreeCompareHref,
  IRELAND_DEGREE_COMPARE_IDS,
} from "@/lib/degree-match/ireland-degree-comparison"
import type { DegreeMatchRelationshipType } from "@/lib/degree-match/contract"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"

/**
 * P3.4 Ireland Degree discovery view-model.
 *
 * Answers "What can I study in Ireland, and where can it lead?" from the P3.2
 * derived model only. This module is the single serialization boundary for the
 * discovery surface: it converts derived model rows plus the existing bounded
 * UI labels into plain, JSON-safe card data so the Degrees explorer never
 * reinterprets P3.1 raw evidence and never computes a Degree-level score.
 */

export type IrelandDegreeDiscoveryCareer = {
  careerId: string
  careerLabel: string
  careerPath: string
  relationshipType: DegreeMatchRelationshipType
  relationshipTypeLabel: string
  relationshipStrengthLabel: string
  confidenceLabel: string
  interpretation: string
  qualificationNote: string | null
  qualificationLabel: string | null
  regulationNote: string
  regulationSummary: string
  regulatedCareer: boolean
  regulatorName: string | null
  regulatorUrl: string | null
  careerOutlookLabels: readonly string[]
}

export type IrelandDegreeDiscoveryEntry = {
  degreeId: string
  degreeLabel: string
  anchor: string
  educationPath: string
  boundaryNote: string
  careers: readonly IrelandDegreeDiscoveryCareer[]
  compareHref: string
  /** Degree qualifies for the "Regulated / additional qualification" filter. */
  qualificationFilter: boolean
}

export function buildIrelandDegreeDiscovery(locale: DegreeMatchLocale): readonly IrelandDegreeDiscoveryEntry[] {
  const boundary = degreeMatchBoundaryNote(locale)

  return IRELAND_DEGREE_MATCH_MODEL.map((result, index) => {
    const careerMatches = IRELAND_DEGREE_MATCH_MODEL.filter((row) => row.degreeId === result.degreeId)
    const qualificationFilter = careerMatches.some(
      (row) =>
        row.regulation.regulatedCareer ||
        row.additionalQualification.state !== "none_verified",
    )

    const careers: IrelandDegreeDiscoveryCareer[] = careerMatches.map((match) => {
      const qualificationState = match.additionalQualification.state
      return {
        careerId: match.careerId,
        careerLabel: match.careerLabel,
        careerPath: careerCanonicalPath(match.countryCode, match.careerId),
        relationshipType: match.relationshipType,
        relationshipTypeLabel: degreeMatchRelationshipTypeLabel(match.relationshipType, locale),
        relationshipStrengthLabel: degreeMatchStrengthLabel(match.relationshipStrength, locale),
        confidenceLabel: degreeMatchConfidenceLabel(match.confidence, locale),
        interpretation: match.interpretation,
        qualificationNote:
          qualificationState !== "none_verified" ? degreeMatchQualificationNote(locale) : null,
        qualificationLabel:
          qualificationState !== "none_verified"
            ? degreeMatchQualificationLabel(qualificationState, locale)
            : null,
        regulationNote: degreeMatchRegulationNote(locale),
        regulationSummary: match.regulation.summary,
        regulatedCareer: match.regulation.regulatedCareer,
        regulatorName: match.regulation.regulatorName,
        regulatorUrl: match.regulation.regulatorUrl,
        careerOutlookLabels: degreeMatchCareerOutlook(match.careerId, locale),
      }
    })

    const nextDegree = IRELAND_DEGREE_COMPARE_IDS[(index + 1) % IRELAND_DEGREE_COMPARE_IDS.length]
    const compareHref =
      nextDegree && nextDegree !== result.degreeId
        ? buildIrelandDegreeCompareHref([result.degreeId, nextDegree])
        : "/compare?type=degree&country=IE"

    return {
      degreeId: result.degreeId,
      degreeLabel: result.degreeLabel,
      anchor: `degree-${result.degreeId}`,
      educationPath: degreeMatchDegreeDetailPath(result.degreeId) ?? `/countries/ie/education#degree-${result.degreeId}`,
      boundaryNote: boundary,
      careers,
      compareHref,
      qualificationFilter,
    }
  })
}