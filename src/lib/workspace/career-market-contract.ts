import type { CampCareerScore } from "@/lib/campcareer-score"
import type { CareerDegreePath } from "@/lib/career-degree/contract"
import type { CareerDataFoundationResult } from "@/lib/career-data-foundation/types"
import type { CountryOccupationMetric, CountryOccupationProfile, OpportunityScoreBreakdown } from "./country-occupation-contract"

export type CareerMarketDemand = {
  countryCode: string
  countryName: string
  rating: string | null
  note: string
  sourceLabel: string | null
  sourceUrl: string | null
}

export type CareerMarketRecommendation = {
  countryCode: string
  countryName: string
  officialTitle: string | null
  /** Compatibility total; mirrors campCareerScore.total when the public score is ready. */
  opportunityScore: number | null
  campCareerScore: CampCareerScore | null
  scoreStatus: "provisional" | "reviewed" | "published" | "foundation_ready" | null
  registrationRequired: boolean | null
  publicationStatus: "review_required" | "profile_ready" | "decision_ready" | null
  demand: CareerMarketDemand | null
}

export type CareerMarketMetric = Omit<CountryOccupationMetric, "opportunityScore" | "scoreStatus" | "score"> & {
  opportunityScore: number | null
  scoreStatus: CountryOccupationMetric["scoreStatus"] | "foundation_ready" | "not_ready"
  score: { [Key in keyof OpportunityScoreBreakdown]: number | null }
}

export type CareerMarketProfile = Omit<CountryOccupationProfile, "metric"> & {
  metric: CareerMarketMetric
}

export type CareerVisaPathway = {
  name: string
  kind: "Study" | "Work" | "Working holiday" | "Skilled" | "Family" | "Temporary"
  note: string
  authority: string
  sourceUrl: string
  sourceTitle: string
  lastVerifiedOn: string
}

export type CareerMarketInsight = {
  career: {
    id: string
    label: string
    labelKo: string
    overview: { ko: string; en: string } | null
    registration: { ko: string; en: string } | null
    mainTasks: string[]
    sources: { label: string; url: string }[]
  }
  country: { code: string; name: string } | null
  profile: CareerMarketProfile | null
  foundation: CareerDataFoundationResult | null
  readModelSource: "career_data_foundation" | "legacy_country_occupation" | "editorial_only"
  demand: CareerMarketDemand | null
  recommendations: CareerMarketRecommendation[]
  visas: CareerVisaPathway[]
  /** Source-backed degree directions. These are not a Programme publication claim. */
  degreePaths: CareerDegreePath[]
}
