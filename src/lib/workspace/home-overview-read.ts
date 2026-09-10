import "server-only"

import { CANONICAL_CAREERS, careersForCategory, type CareerCategoryId } from "@/data/career-comparison-catalog"
import { STUDY_CATEGORIES } from "@/data/study-concepts"
import type { CountryExplorerData, HomeOverviewData, OverviewEmployer, OverviewOccupationMetric } from "@/lib/home-overview-contract"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getCountryMetrics } from "./country-metrics"
import { readRawCareerData } from "./raw-career-data"

type OccupationProfileRow = {
  profile_key: string
  canonical_career_id: string
  official_title: string
  registration_required: boolean | null
  source_checked_at: string | null
}

type OccupationSnapshotRow = {
  profile_key: string
  as_of_date: string | null
  opportunity_score: number | string | null
  employment_total: number | string | null
  vacancies_three_month_avg: number | string | null
  employment_growth_5y_pct: number | string | null
  annualised_median_salary: number | string | null
  score_status: string | null
}

type EmployerRow = {
  label: string
  url: string | null
  provider_type: string | null
}

type CityDirectoryRow = {
  city_id: string
  slug: string
  name: string
  region: string
  linked_institution_count: number | null
  linked_campus_count: number | null
}

type CityMetricRow = {
  scope_id: string
  value: unknown
}

const numeric = (value: number | string | null): number | null => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function cityLivingCost(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const low = typeof record.low === "number" ? record.low : null
  const high = typeof record.high === "number" ? record.high : null
  const currency = typeof record.currency === "string" ? record.currency : null
  return low !== null && high !== null && currency ? { low, high, currency } : null
}

const CITY_DIRECTORY_TABLE_BY_COUNTRY = {
  AU: "city_directory_au_v1",
  CA: "city_directory_ca_v1",
  IE: "city_directory_ie_v1",
  NZ: "city_directory_nz_v1",
  UK: "city_directory_uk_v1",
  US: "city_directory_us_v1",
} as const

const FEATURED_CITY_NAMES: Record<string, readonly string[]> = {
  AU: ["Sydney", "Melbourne", "Brisbane"],
}

function getAustraliaOpportunities(
  profiles: OccupationProfileRow[],
  latestSnapshotByProfile: Map<string, OccupationSnapshotRow>,
): CountryExplorerData["opportunities"] {
  const profileByCareer = new Map(profiles.map((profile) => [profile.canonical_career_id, profile]))
  return STUDY_CATEGORIES.flatMap((category) => {
    const topRole = CANONICAL_CAREERS
      .filter((career) => career.categoryId === category.id)
      .flatMap((career) => {
        const profile = profileByCareer.get(career.id)
        const snapshot = profile ? latestSnapshotByProfile.get(profile.profile_key) : null
        const score = snapshot ? numeric(snapshot.opportunity_score) : null
        return profile && snapshot && score !== null
          ? [{ title: profile.official_title || career.label, score, vacanciesThreeMonthAvg: numeric(snapshot.vacancies_three_month_avg) }]
          : []
      })
      .sort((first, second) => second.score - first.score)[0]

    return topRole
      ? [{
          categoryId: category.id,
          categoryLabel: category.label,
          topOccupationTitle: topRole.title,
          opportunityScore: topRole.score,
          vacanciesThreeMonthAvg: topRole.vacanciesThreeMonthAvg,
        }]
      : []
  })
    .sort((first, second) => second.opportunityScore - first.opportunityScore)
    .slice(0, 3)
}

async function getDestinationCities(countryCode: string): Promise<CountryExplorerData["cities"]> {
  const cityTable = CITY_DIRECTORY_TABLE_BY_COUNTRY[countryCode as keyof typeof CITY_DIRECTORY_TABLE_BY_COUNTRY]
  if (!cityTable) return []

  const selectedNames = FEATURED_CITY_NAMES[countryCode]
  const cityResult = selectedNames
    ? await supabaseAdmin
      .from(cityTable)
      .select("city_id, slug, name, region, linked_institution_count, linked_campus_count")
      .in("name", selectedNames)
    : await supabaseAdmin
      .from(cityTable)
      .select("city_id, slug, name, region, linked_institution_count, linked_campus_count")
      .order("linked_institution_count", { ascending: false, nullsFirst: false })
      .order("linked_campus_count", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .limit(3)

  if (cityResult.error || !cityResult.data?.length) return []

  const cities = cityResult.data as CityDirectoryRow[]
  const { data: metricData, error: metricError } = await supabaseAdmin
    .from("report_metric_evidence_city")
    .select("scope_id, value")
    .eq("scope_type", "city")
    .eq("metric_key", "student_living_cost_monthly_range")
    .eq("review_status", "verified")
    .in("scope_id", cities.map((city) => city.city_id))

  const livingCostByCity = new Map(
    ((metricError ? [] : metricData ?? []) as CityMetricRow[])
      .map((metric) => [metric.scope_id, cityLivingCost(metric.value)] as const),
  )
  return cities
    .sort((first, second) => selectedNames ? selectedNames.indexOf(first.name) - selectedNames.indexOf(second.name) : 0)
    .map((city) => ({
      slug: city.slug,
      name: city.name,
      region: city.region,
      linkedInstitutionCount: city.linked_institution_count ?? 0,
      linkedCampusCount: city.linked_campus_count ?? 0,
      monthlyLivingCost: livingCostByCity.get(city.city_id) ?? null,
    }))
}

async function getDestinationExplorer(
  countryCode: string,
  profiles: OccupationProfileRow[],
  latestSnapshotByProfile: Map<string, OccupationSnapshotRow>,
): Promise<CountryExplorerData> {
  const [cities] = await Promise.all([
    getDestinationCities(countryCode),
  ])

  return {
    opportunities: countryCode === "AU" ? getAustraliaOpportunities(profiles, latestSnapshotByProfile) : [],
    cities,
  }
}

export async function getHomeOverviewData(
  countryCode: string,
  categoryId: CareerCategoryId | "not-sure",
  options: { destinationExplorer?: boolean } = {},
): Promise<HomeOverviewData> {
  const country = countryCode.toUpperCase()
  const isDestinationExplorer = options.destinationExplorer === true && categoryId === "not-sure"
  const isAustraliaExplorer = country === "AU" && isDestinationExplorer
  const careers = categoryId === "not-sure" ? [] : careersForCategory(categoryId)
  const careersForLookup = isAustraliaExplorer ? CANONICAL_CAREERS : careers
  const [countryMetrics, profilesResult] = await Promise.all([
    getCountryMetrics(country),
    careersForLookup.length
      ? readRawCareerData((client) => client
        .from("country_occupation_profiles")
        .select("profile_key, canonical_career_id, official_title, registration_required, source_checked_at")
        .eq("country_code", country)
        .in("canonical_career_id", careersForLookup.map((career) => career.id)))
      : Promise.resolve({ data: [], error: null }),
  ])

  if (profilesResult.error) throw profilesResult.error

  const profiles = (profilesResult.data ?? []) as OccupationProfileRow[]
  const profileKeys = profiles.map((profile) => profile.profile_key)
  const snapshotsResult = profileKeys.length
    ? await readRawCareerData((client) => client
      .from("country_occupation_metric_snapshots")
      .select("profile_key, as_of_date, opportunity_score, employment_total, vacancies_three_month_avg, employment_growth_5y_pct, annualised_median_salary, score_status")
      .in("profile_key", profileKeys)
      .order("as_of_date", { ascending: false }))
    : { data: [], error: null }

  if (snapshotsResult.error) throw snapshotsResult.error

  const latestSnapshotByProfile = new Map<string, OccupationSnapshotRow>()
  for (const snapshot of (snapshotsResult.data ?? []) as OccupationSnapshotRow[]) {
    if (!latestSnapshotByProfile.has(snapshot.profile_key)) latestSnapshotByProfile.set(snapshot.profile_key, snapshot)
  }

  const profileByCareer = new Map(profiles.map((profile) => [profile.canonical_career_id, profile]))
  const occupations: OverviewOccupationMetric[] = careers.flatMap((career) => {
    const profile = profileByCareer.get(career.id)
    if (!profile) return []
    const snapshot = latestSnapshotByProfile.get(profile.profile_key)
    return [{
      careerId: career.id,
      title: profile.official_title || career.label,
      opportunityScore: snapshot ? numeric(snapshot.opportunity_score) : null,
      employmentTotal: snapshot ? numeric(snapshot.employment_total) : null,
      vacanciesThreeMonthAvg: snapshot ? numeric(snapshot.vacancies_three_month_avg) : null,
      employmentGrowthFiveYearPct: snapshot ? numeric(snapshot.employment_growth_5y_pct) : null,
      annualisedMedianSalary: snapshot ? numeric(snapshot.annualised_median_salary) : null,
      registrationRequired: profile.registration_required,
      asOfDate: snapshot?.as_of_date ?? null,
      checkedAt: profile.source_checked_at,
      scoreStatus: snapshot?.score_status ?? null,
    }]
  })

  const topOccupation = [...occupations]
    .filter((occupation) => occupation.opportunityScore != null)
    .sort((first, second) => (second.opportunityScore ?? 0) - (first.opportunityScore ?? 0))[0]
  const topProfile = topOccupation ? profileByCareer.get(topOccupation.careerId) : null
  const employersResult = topProfile
    ? await readRawCareerData((client) => client
      .from("country_occupation_links")
      .select("label, url, provider_type")
      .eq("profile_key", topProfile.profile_key)
      .eq("link_type", "employer")
      .limit(4))
    : { data: [], error: null }

  if (employersResult.error) throw employersResult.error

  const employers = (employersResult.data ?? []) as EmployerRow[]
  const countryExplorer = isDestinationExplorer
    ? await getDestinationExplorer(country, profiles, latestSnapshotByProfile)
    : null

  return {
    countryMetrics,
    occupations,
    expectedOccupationCount: careers.length,
    employerFocus: topOccupation && employers.length
      ? {
          occupationTitle: topOccupation.title,
          employers: employers.map((employer): OverviewEmployer => ({ label: employer.label, url: employer.url, providerType: employer.provider_type })),
          market: {
            employmentTotal: topOccupation.employmentTotal,
            vacanciesThreeMonthAvg: topOccupation.vacanciesThreeMonthAvg,
            employmentGrowthFiveYearPct: topOccupation.employmentGrowthFiveYearPct,
          },
        }
      : null,
    countryExplorer,
  }
}
