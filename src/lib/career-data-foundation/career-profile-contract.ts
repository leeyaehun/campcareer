import type { CampCareerScore } from "@/lib/campcareer-score"
import type { CareerDataFoundationResult } from "@/lib/career-data-foundation/types"
import type { CareerMarketInsight } from "@/lib/workspace/career-market-contract"
import { getCareer } from "./career-catalogue"

export type CareerReadModelSource =
  | "career_data_foundation"
  | "legacy_country_occupation"
  | "editorial_only"

export type CareerProfile = {
  identity: { countryCode: string | null; careerId: string; categoryId: string; label: string; labelKo: string }
  country: CareerMarketInsight["country"]
  officialOccupation: { taxonomy: string | null; taxonomyVersion: string | null; code: string | null; title: string | null; mappingRelation: string | null; mappingQuality: string | null } | null
  pay: { currency: string | null; annualMedian: number | null; hourlyMedian: number | null }
  demand: CareerMarketInsight["demand"]
  score: CampCareerScore | null
  readiness: { decisionReady: boolean; scoreReady: boolean; publishReady: boolean; reason: string | null }
  entryRequirements: {
    registrationRequired: boolean | null
    registrationAuthority: string | null
    registrationUrl: string | null
    blockers: readonly { type: string; severity: string; reason: string; sourceUrl: string }[]
    visaPathways: CareerMarketInsight["visas"]
  }
  sources: readonly { label: string; authority: string | null; url: string; lastVerifiedOn: string | null }[]
  relatedEntryPoints: readonly { type: string; label: string; provider: string | null; url: string; notes: string | null }[]
  recommendations: CareerMarketInsight["recommendations"]
  dataSource: {
    kind: CareerReadModelSource
    legacyFallback: boolean
    foundationAvailableButNotSelected: boolean
  }
  /** Transitional payload for existing Career Page components. */
  compatibility: CareerMarketInsight
}

export function toCareerProfile(
  insight: CareerMarketInsight,
  foundationCandidate: CareerDataFoundationResult | null = insight.foundation,
): CareerProfile | null {
  const career = getCareer(insight.career.id)
  if (!career) return null

  const foundation = insight.foundation
  const legacyProfile = insight.profile
  const score = legacyProfile?.metric.campCareerScore ?? foundation?.campCareerScore ?? null
  const officialOccupation = foundation
    ? { taxonomy: foundation.mapping.officialTaxonomy, taxonomyVersion: foundation.mapping.officialTaxonomyVersion, code: foundation.mapping.officialCode, title: foundation.mapping.officialTitle, mappingRelation: foundation.mapping.mappingRelation, mappingQuality: foundation.mapping.mappingQuality }
    : legacyProfile
      ? { taxonomy: legacyProfile.officialCodeSystem, taxonomyVersion: legacyProfile.officialCodeVersion, code: legacyProfile.officialUnitGroupCode, title: legacyProfile.officialTitle, mappingRelation: null, mappingQuality: null }
      : null
  const sources = foundation?.sources.map((source) => ({ label: source.title, authority: source.authority, url: source.url, lastVerifiedOn: source.lastVerifiedOn }))
    ?? insight.career.sources.map((source) => ({ label: source.label, authority: null, url: source.url, lastVerifiedOn: null }))
  const relatedEntryPoints = [
    ...(foundation?.entryPoints.map((entryPoint) => ({ type: entryPoint.entryType, label: entryPoint.label, provider: entryPoint.provider, url: entryPoint.url, notes: entryPoint.notes })) ?? []),
    ...(legacyProfile?.links.map((link) => ({ type: link.linkType, label: link.label, provider: link.providerType, url: link.url, notes: link.regionCode })) ?? []),
  ]

  return {
    identity: { countryCode: insight.country?.code ?? null, careerId: career.id, categoryId: career.categoryId, label: career.label, labelKo: career.labelKo },
    country: insight.country,
    officialOccupation,
    pay: {
      currency: legacyProfile?.currency ?? foundation?.currency ?? null,
      annualMedian: legacyProfile?.metric.annualisedMedianSalary ?? foundation?.decisionMetrics.medianAnnualWage ?? null,
      hourlyMedian: legacyProfile?.metric.medianHourlyEarnings ?? foundation?.decisionMetrics.medianHourlyWage ?? null,
    },
    demand: insight.demand,
    score,
    readiness: foundation
      ? { decisionReady: foundation.readiness.decisionReady, scoreReady: foundation.readiness.scoreReady, publishReady: foundation.readiness.publishReady, reason: foundation.readiness.decisionReason }
      : { decisionReady: legacyProfile?.publicationStatus === "decision_ready", scoreReady: score != null, publishReady: legacyProfile?.publicationStatus === "decision_ready", reason: legacyProfile ? null : "No reviewed country-level Career profile is available." },
    entryRequirements: {
      registrationRequired: legacyProfile?.registrationRequired ?? null,
      registrationAuthority: legacyProfile?.registrationAuthority ?? null,
      registrationUrl: legacyProfile?.registrationUrl ?? null,
      blockers: foundation?.blockers.map((blocker) => ({ type: blocker.blockerType, severity: blocker.severity, reason: blocker.reason, sourceUrl: blocker.officialSourceUrl })) ?? [],
      visaPathways: insight.visas,
    },
    sources,
    relatedEntryPoints,
    recommendations: insight.recommendations,
    dataSource: {
      kind: insight.readModelSource,
      legacyFallback: insight.readModelSource === "legacy_country_occupation",
      foundationAvailableButNotSelected: Boolean(foundationCandidate && insight.readModelSource !== "career_data_foundation"),
    },
    compatibility: insight,
  }
}
