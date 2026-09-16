import type { CampCareerScore } from "@/lib/campcareer-score"

export type OpportunityScoreBreakdown = {
  shortage: number
  vacancyIntensity: number
  employerDiversity: number
  vacancyTrend: number
  entryLevel: number
  salary: number
  growth: number
  visa: number
  entryBurden: number
}

export type CountryOccupationMetric = {
  asOfDate: string
  employmentTotal: number | null
  medianWeeklyEarnings: number | null
  medianHourlyEarnings: number | null
  annualisedMedianSalary: number | null
  allOccupationsMedianWeekly: number | null
  partTimeSharePct: number | null
  femaleSharePct: number | null
  medianAge: number | null
  averageFullTimeHours: number | null
  vacanciesThreeMonthAvg: number | null
  vacancyPeriod: string | null
  vacancyYoyPct: number | null
  employmentGrowth5yPct: number | null
  employmentGrowth10yPct: number | null
  /** Compatibility total used by older surfaces. It now mirrors campCareerScore.total. */
  opportunityScore: number | null
  campCareerScore: CampCareerScore | null
  scoreMethodologyVersion: string
  scoreStatus: "provisional" | "reviewed" | "published"
  /** Internal evidence details. The legacy nine-factor score is not a public CampCareer score. */
  scoreEvidence: Record<string, unknown>
  /** Internal evidence-engine components retained for audit/backward compatibility. */
  score: OpportunityScoreBreakdown
  sourceCheckedAt: string | null
}

export type CountryOccupationSpecialisation = {
  officialCode: string
  officialTitle: string
  legacyCodeSystem: string | null
  legacyCodeVersion: string | null
  legacyCode: string | null
  shortageRating: number | null
  visaEligible: boolean | null
  includedInRollup: boolean
}

export type CountryOccupationRegionMetric = {
  regionCode: string
  asOfDate: string
  shortageRating: number | null
  vacancyCount: number | null
  sourceUrl: string | null
}

export type CountryOccupationLinkType =
  | "job_search"
  | "employer"
  | "entry_program"
  | "graduate_program"
  | "source"

export type CountryOccupationLink = {
  linkType: CountryOccupationLinkType
  label: string
  url: string
  providerType: string | null
  regionCode: string | null
}

export type CountryOccupationResolvedProgram = {
  title: string
  provider: string
  durationYears: number | null
  tuitionFeeAud: number | null
  url: string | null
  canonicalPath: string | null
}

export type CountryOccupationProgramLink = {
  programRef: string
  relationType: "direct" | "graduate_entry" | "progression" | "related"
  program: CountryOccupationResolvedProgram | null
}

export type CountryOccupationProfile = {
  profileKey: string
  countryCode: string
  canonicalCareerId: string
  officialTitle: string
  officialCodeSystem: string
  officialCodeVersion: string
  officialUnitGroupCode: string | null
  currency: string
  registrationRequired: boolean
  registrationAuthority: string | null
  registrationUrl: string | null
  publicationStatus: "review_required" | "profile_ready" | "decision_ready"
  sourceCheckedAt: string | null
  metric: CountryOccupationMetric
  specialisations: CountryOccupationSpecialisation[]
  regions: CountryOccupationRegionMetric[]
  links: CountryOccupationLink[]
  programLinks: CountryOccupationProgramLink[]
}

/** Internal evidence-engine maxima. These are not the public CampCareer Score dimensions. */
export const OPPORTUNITY_SCORE_MAXIMA: OpportunityScoreBreakdown = {
  shortage: 20,
  vacancyIntensity: 15,
  employerDiversity: 5,
  vacancyTrend: 10,
  entryLevel: 15,
  salary: 10,
  growth: 10,
  visa: 10,
  entryBurden: 5,
}
