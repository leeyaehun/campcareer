import "server-only"

import { CANONICAL_CAREER_BY_ID } from "@/data/career-comparison-catalog"
import { LAUNCH_COUNTRIES } from "@/data/launch-countries"
import { CAMPCAREER_SCORE_VERSION, campCareerScoreFromLegacyBreakdown } from "@/lib/campcareer-score"
import { getCareerDegreePaths } from "@/lib/career-degree/read"
import { getCareerDataFoundation, getFoundationCountriesForCareer } from "@/lib/career-data-foundation/read"
import { isFoundationRankable } from "@/lib/career-data-foundation/opportunity-score"
import type { CareerDataFoundationResult } from "@/lib/career-data-foundation/types"
import { supabase } from "@/lib/supabase"
import {
  hasStrictFoundationPublicScoreEvidence,
  isCareerScoreReady,
} from "./career-coverage"
import { getCountryOccupationProfile } from "./country-occupation-read"
import { readRawCareerData } from "./raw-career-data"
import type {
  CareerMarketDemand,
  CareerMarketInsight,
  CareerMarketProfile,
  CareerMarketRecommendation,
  CareerVisaPathway,
} from "./career-market-contract"
import { OCCUPATION_DETAILS } from "./occupation-detail"

const countryName = (countryCode: string) =>
  LAUNCH_COUNTRIES.find((country) => country.code === countryCode)?.name ?? countryCode

const toDemand = (careerId: string, countryCode: string): CareerMarketDemand | null => {
  const demand = OCCUPATION_DETAILS.find((detail) => detail.id === careerId)?.demand
    .find((item) => item.countryCode === countryCode)
  if (!demand) return null
  return {
    countryCode,
    countryName: demand.countryLabel,
    rating: demand.rating,
    note: demand.note,
    sourceLabel: demand.sourceLabel,
    sourceUrl: demand.sourceUrl,
  }
}

const toFoundationDemand = (foundation: CareerDataFoundationResult): CareerMarketDemand => {
  const openings = foundation.decisionMetrics.projectedAnnualOpenings
  const growth = foundation.decisionMetrics.projectedGrowthPct
  const source = foundation.sources.find((item) => item.sourceKey === "us-bls-ep-2024-2034")
  const signal = [
    openings == null ? null : `Projection: ${new Intl.NumberFormat("en-US").format(openings)} openings/year`,
    growth == null ? null : `${growth}% growth`,
  ].filter(Boolean).join(" · ")
  return {
    countryCode: foundation.countryCode,
    countryName: countryName(foundation.countryCode),
    rating: signal || null,
    note: "Annual openings and employment growth are market signals, not a personal employment assessment or visa outcome.",
    sourceLabel: source?.title ?? null,
    sourceUrl: source?.url ?? null,
  }
}

const toFoundationVisas = (foundation: CareerDataFoundationResult): CareerVisaPathway[] => {
  const visaBlocker = foundation.blockers.find((item) => item.blockerType === "visa")
  const sources = new Map(foundation.sources.map((source) => [source.sourceKey, source]))
  return foundation.entryPoints
    .filter((entryPoint) => entryPoint.entryType === "visa")
    .map((entryPoint) => {
      const source = sources.get(entryPoint.sourceKey)
      const h2b = /h-2b/i.test(entryPoint.label)
      return {
        name: entryPoint.label,
        kind: h2b ? "Temporary" as const : "Work" as const,
        note: `${entryPoint.applicabilityScope} ${visaBlocker?.reason ?? entryPoint.notes ?? "Eligibility is case-specific."}`,
        authority: entryPoint.provider,
        sourceUrl: entryPoint.url,
        sourceTitle: source?.title ?? entryPoint.label,
        lastVerifiedOn: entryPoint.lastVerifiedOn,
      }
    })
}

const foundationCareerContext = (foundation: CareerDataFoundationResult) => {
  const metrics = foundation.decisionMetrics
  const employment = metrics.employmentTotal == null
    ? "verified employment data"
    : `${new Intl.NumberFormat("en-US").format(metrics.employmentTotal)} jobs in the published employment base`
  const openings = metrics.projectedAnnualOpenings == null
    ? "projected openings data"
    : `${new Intl.NumberFormat("en-US").format(metrics.projectedAnnualOpenings)} projected annual openings`
  const growth = metrics.projectedGrowthPct == null
    ? "the published outlook"
    : `${metrics.projectedGrowthPct}% projected employment growth`
  const blockerSummary = foundation.blockers
    .filter((item) => item.blockerType === "licensing" || item.blockerType === "registration" || item.blockerType === "safety_training")
    .map((item) => item.reason)
    .join(" ")

  return {
    overview: {
      en: `For ${foundation.mapping.officialTitle}, the foundation records ${employment}, ${openings}, and ${growth}. These are market observations and projections, not a personal employment or immigration assessment.`,
      ko: `${foundation.mapping.officialTitle}에 대해 공식 데이터 기반 고용 규모, 연평균 채용 전망, 성장 전망을 제공합니다. 이는 시장 데이터이며 개인의 취업 가능성이나 비자 승인 여부를 판단하는 결과가 아닙니다.`,
    },
    registration: {
      en: blockerSummary || "Licensing, registration and safety requirements must be checked for the intended jurisdiction, employer and role.",
      ko: blockerSummary || "면허·등록·안전교육 요건은 실제 근무 지역과 고용주, 직무 기준으로 확인해야 합니다.",
    },
    sources: foundation.sources.map((source) => ({ label: source.title, url: source.url })),
  }
}

const foundationHasPublicScore = (foundation: CareerDataFoundationResult) =>
  Boolean(
    isCareerScoreReady(foundation.countryCode, foundation.careerId)
    && foundation.readiness.decisionReady
    && foundation.readiness.scoreReady
    && foundation.readiness.publishReady
    && foundation.campCareerScore
    && hasStrictFoundationPublicScoreEvidence(foundation.scoreComponents),
  )

const toFoundationCompatibilityProfile = (foundation: CareerDataFoundationResult): CareerMarketProfile => {
  const entryLinks: CareerMarketProfile["links"] = foundation.entryPoints
    .filter((entryPoint) => ["job_search", "employer", "apprenticeship", "training"].includes(entryPoint.entryType))
    .map((entryPoint) => ({
      linkType: entryPoint.entryType === "job_search"
        ? "job_search" as const
        : entryPoint.entryType === "employer"
          ? "employer" as const
          : "entry_program" as const,
      label: entryPoint.label,
      url: entryPoint.url,
      providerType: entryPoint.provider,
      regionCode: null,
    }))

  return {
    profileKey: foundation.profileKey,
    countryCode: foundation.countryCode,
    canonicalCareerId: foundation.careerId,
    officialTitle: foundation.mapping.officialTitle,
    officialCodeSystem: foundation.mapping.officialTaxonomy,
    officialCodeVersion: foundation.mapping.officialTaxonomyVersion,
    officialUnitGroupCode: foundation.mapping.officialCode,
    currency: foundation.currency,
    registrationRequired: foundation.blockers.some((item) => item.blockerType === "licensing" || item.blockerType === "registration"),
    registrationAuthority: null,
    registrationUrl: null,
    publicationStatus: "decision_ready",
    sourceCheckedAt: foundation.sourceCheckedOn,
    metric: {
      asOfDate: foundation.sourceCheckedOn,
      employmentTotal: foundation.decisionMetrics.employmentTotal,
      medianWeeklyEarnings: null,
      medianHourlyEarnings: foundation.decisionMetrics.medianHourlyWage,
      annualisedMedianSalary: foundation.decisionMetrics.medianAnnualWage,
      allOccupationsMedianWeekly: null,
      partTimeSharePct: null,
      femaleSharePct: null,
      medianAge: null,
      averageFullTimeHours: null,
      vacanciesThreeMonthAvg: null,
      vacancyPeriod: null,
      vacancyYoyPct: null,
      employmentGrowth5yPct: null,
      employmentGrowth10yPct: foundation.decisionMetrics.projectedGrowthPct,
      opportunityScore: foundation.campCareerScore?.total ?? null,
      campCareerScore: foundation.campCareerScore,
      scoreMethodologyVersion: CAMPCAREER_SCORE_VERSION,
      scoreStatus: "foundation_ready",
      scoreEvidence: {
        source: "career_data_foundation",
        readiness: foundation.readiness,
        publicScore: foundation.campCareerScore,
        internalOpportunityScore: foundation.opportunityScore,
        internalFormulaVersion: foundation.readiness.formulaVersion,
        components: foundation.scoreComponents.map((component) => ({
          componentKey: component.componentKey,
          availability: component.availability,
          directness: component.directness,
          scoreValue: component.scoreValue,
          reason: component.reason,
          proxyReason: component.proxyReason,
          evidenceStatus: component.evidenceStatus,
        })),
        scoringPolicy: "The public CampCareer Score excludes visa and uses Demand 40 / Pay 30 / Entry 30. Foundation data is public only after strict evidence and coverage review.",
      },
      score: {
        shortage: null,
        vacancyIntensity: null,
        employerDiversity: null,
        vacancyTrend: null,
        entryLevel: null,
        salary: null,
        growth: null,
        visa: null,
        entryBurden: null,
      },
      sourceCheckedAt: foundation.sourceCheckedOn,
    },
    specialisations: [{
      officialCode: foundation.mapping.officialCode,
      officialTitle: foundation.mapping.officialTitle,
      legacyCodeSystem: null,
      legacyCodeVersion: null,
      legacyCode: null,
      shortageRating: null,
      visaEligible: null,
      includedInRollup: true,
    }],
    regions: [],
    links: entryLinks,
    programLinks: [],
  }
}

type ProfileRow = {
  profile_key: string
  country_code: string
  official_title: string
  registration_required: boolean
  publication_status: "review_required" | "profile_ready" | "decision_ready"
}

type MetricRow = {
  profile_key: string
  as_of_date: string
  shortage_component: number | null
  vacancy_intensity_component: number | null
  employer_diversity_component: number | null
  vacancy_trend_component: number | null
  entry_level_component: number | null
  salary_component: number | null
  growth_component: number | null
  entry_burden_component: number | null
  opportunity_score: number
  score_status: "provisional" | "reviewed" | "published"
}

export async function getCareerCountryRecommendations(careerId: string): Promise<CareerMarketRecommendation[]> {
  const [profilesResult, foundationRows] = await Promise.all([
    readRawCareerData((client) => client
      .from("country_occupation_profiles")
      .select("profile_key,country_code,official_title,registration_required,publication_status")
      .eq("canonical_career_id", careerId)
      .in("publication_status", ["profile_ready", "decision_ready"])),
    getFoundationCountriesForCareer(careerId),
  ])

  if (profilesResult.error) throw profilesResult.error
  const profiles = (profilesResult.data ?? []) as ProfileRow[]
  const profileKeys = profiles.map((profile) => profile.profile_key)
  const latestMetrics = new Map<string, MetricRow>()

  if (profileKeys.length) {
    const metricsResult = await readRawCareerData((client) => client
      .from("country_occupation_metric_snapshots")
      .select("profile_key,as_of_date,shortage_component,vacancy_intensity_component,employer_diversity_component,vacancy_trend_component,entry_level_component,salary_component,growth_component,entry_burden_component,opportunity_score,score_status")
      .in("profile_key", profileKeys)
      .order("as_of_date", { ascending: false }))
    if (metricsResult.error) throw metricsResult.error
    for (const row of (metricsResult.data ?? []) as MetricRow[]) {
      if (!latestMetrics.has(row.profile_key)) latestMetrics.set(row.profile_key, row)
    }
  }

  const byCountry = new Map<string, CareerMarketRecommendation>()

  // Prefer the reviewed country_occupation profile when it exists. This keeps
  // a newer internal foundation snapshot from changing a locked public score
  // before that foundation evidence has separately passed coverage review.
  for (const profile of profiles) {
    const metric = latestMetrics.get(profile.profile_key)
    const scoreCandidate = metric
      ? campCareerScoreFromLegacyBreakdown({
          shortage: metric.shortage_component,
          vacancyIntensity: metric.vacancy_intensity_component,
          employerDiversity: metric.employer_diversity_component,
          vacancyTrend: metric.vacancy_trend_component,
          entryLevel: metric.entry_level_component,
          salary: metric.salary_component,
          growth: metric.growth_component,
          entryBurden: metric.entry_burden_component,
        })
      : null
    const campCareerScore = isCareerScoreReady(profile.country_code, careerId) ? scoreCandidate : null
    byCountry.set(profile.country_code, {
      countryCode: profile.country_code,
      countryName: countryName(profile.country_code),
      officialTitle: profile.official_title,
      opportunityScore: campCareerScore?.total ?? null,
      campCareerScore,
      scoreStatus: campCareerScore ? metric?.score_status ?? null : null,
      registrationRequired: profile.registration_required,
      publicationStatus: profile.publication_status,
      demand: toDemand(careerId, profile.country_code),
    })
  }

  // A foundation row may replace a legacy recommendation only after it
  // passes the same explicit public gate used by the Career detail page.
  // This keeps recommendation scores aligned with the reviewed public source
  // instead of falling back to an older provisional country snapshot.
  for (const foundation of foundationRows) {
    if (!isCareerScoreReady(foundation.countryCode, careerId)) continue
    if (!foundation.strictPublicScoreEvidence) continue
    if (!isFoundationRankable({
      decisionReady: foundation.decisionReady,
      scoreReady: foundation.scoreReady,
      publishReady: foundation.publishReady,
      opportunityScore: foundation.campCareerScore?.total ?? null,
    })) continue
    byCountry.set(foundation.countryCode, {
      countryCode: foundation.countryCode,
      countryName: countryName(foundation.countryCode),
      officialTitle: foundation.officialTitle,
      opportunityScore: foundation.campCareerScore?.total ?? null,
      campCareerScore: foundation.campCareerScore,
      scoreStatus: "foundation_ready",
      registrationRequired: null,
      publicationStatus: "decision_ready",
      demand: null,
    })
  }

  for (const demand of OCCUPATION_DETAILS.find((detail) => detail.id === careerId)?.demand ?? []) {
    if (byCountry.has(demand.countryCode)) continue
    byCountry.set(demand.countryCode, {
      countryCode: demand.countryCode,
      countryName: demand.countryLabel,
      officialTitle: null,
      opportunityScore: null,
      campCareerScore: null,
      scoreStatus: null,
      registrationRequired: null,
      publicationStatus: null,
      demand: toDemand(careerId, demand.countryCode),
    })
  }

  return [...byCountry.values()]
    .sort((first, second) => (second.opportunityScore ?? -1) - (first.opportunityScore ?? -1) || first.countryName.localeCompare(second.countryName))
    .slice(0, 8)
}

type VisaRow = {
  visa_name: string
  kind: CareerVisaPathway["kind"]
  note: string
  authority: string
  source_url: string
  source_title: string
  last_verified_on: string
}

export async function getCareerMarketInsight({
  countryCode,
  careerId,
  includeRecommendations = true,
}: {
  countryCode: string
  careerId: string
  includeRecommendations?: boolean
}): Promise<CareerMarketInsight | null> {
  const country = countryCode.trim().toUpperCase()
  const career = CANONICAL_CAREER_BY_ID.get(careerId)
  if (!career || (country !== "NOT-SURE" && !/^[A-Z]{2}$/.test(country))) return null

  const detail = OCCUPATION_DETAILS.find((item) => item.id === careerId)
  const base = {
    id: career.id,
    label: career.label,
    labelKo: career.labelKo,
    overview: detail?.overview ?? null,
    registration: detail?.registration ?? null,
    mainTasks: detail?.mainTasks ?? [],
    sources: detail?.sources ?? [],
  }

  if (country === "NOT-SURE") {
    return {
      career: base,
      country: null,
      profile: null,
      foundation: null,
      readModelSource: "editorial_only",
      demand: null,
      recommendations: includeRecommendations ? await getCareerCountryRecommendations(careerId) : [],
      visas: [],
      degreePaths: [],
    }
  }

  const [foundation, recommendations, degreePaths] = await Promise.all([
    getCareerDataFoundation({ countryCode: country, careerId }),
    includeRecommendations
      ? getCareerCountryRecommendations(careerId)
      : Promise.resolve([] as CareerMarketRecommendation[]),
    getCareerDegreePaths(country, careerId),
  ])

  if (foundation && foundationHasPublicScore(foundation)) {
    const context = foundationCareerContext(foundation)
    return {
      career: {
        ...base,
        overview: context.overview,
        registration: context.registration,
        mainTasks: [],
        sources: context.sources,
      },
      country: { code: country, name: countryName(country) },
      profile: toFoundationCompatibilityProfile(foundation),
      foundation,
      readModelSource: "career_data_foundation",
      demand: toFoundationDemand(foundation),
      recommendations,
      visas: toFoundationVisas(foundation),
      degreePaths,
    }
  }

  const [profile, visaResult] = await Promise.all([
    getCountryOccupationProfile(country, careerId),
    supabase
      .from("visa_pathways")
      .select("visa_name,kind,note,authority,source_url,source_title,last_verified_on")
      .eq("country_code", country)
      .order("display_order", { ascending: true })
      .limit(4),
  ])
  if (visaResult.error) throw visaResult.error

  if (!profile && foundation) {
    return {
      career: base,
      country: { code: country, name: countryName(country) },
      profile: null,
      foundation,
      readModelSource: "editorial_only",
      demand: null,
      recommendations,
      visas: [],
      degreePaths,
    }
  }

  return {
    career: base,
    country: { code: country, name: countryName(country) },
    profile,
    foundation: null,
    readModelSource: profile ? "legacy_country_occupation" : "editorial_only",
    demand: toDemand(careerId, country),
    recommendations,
    visas: ((visaResult.data ?? []) as VisaRow[]).map((visa) => ({
      name: visa.visa_name,
      kind: visa.kind,
      note: visa.note,
      authority: visa.authority,
      sourceUrl: visa.source_url,
      sourceTitle: visa.source_title,
      lastVerifiedOn: visa.last_verified_on,
    })),
    degreePaths,
  }
}
