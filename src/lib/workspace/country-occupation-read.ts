import "server-only"

import { CAMPCAREER_SCORE_VERSION, campCareerScoreFromLegacyBreakdown } from "@/lib/campcareer-score"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type {
  CountryOccupationLink,
  CountryOccupationMetric,
  CountryOccupationProfile,
  CountryOccupationProgramLink,
  CountryOccupationRegionMetric,
  CountryOccupationResolvedProgram,
  CountryOccupationSpecialisation,
} from "@/lib/workspace/country-occupation-contract"
import { isCareerScoreReady } from "./career-coverage"
import { readRawCareerData } from "./raw-career-data"

const numeric = (value: unknown): number | null => {
  if (value == null || value === "") return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

const auProgramId = (programRef: string): number | null => {
  const match = /^au-program:(\d+)$/.exec(programRef)
  if (!match) return null
  const id = Number(match[1])
  return Number.isSafeInteger(id) ? id : null
}

export async function getCountryOccupationProfile(
  countryCode: string,
  canonicalCareerId: string
): Promise<CountryOccupationProfile | null> {
  const country = countryCode.trim().toUpperCase()
  const career = canonicalCareerId.trim()
  if (!/^[A-Z]{2}$/.test(country) || !career) return null

  // The country_occupation tables retain legacy component and source data.
  // They are read only by server-side presentation code, never directly by a
  // browser. This keeps an anonymous REST caller from bypassing the Career
  // publication gate.
  const profileResult = await readRawCareerData((client) => client
    .from("country_occupation_profiles")
    .select("profile_key, country_code, canonical_career_id, official_title, official_code_system, official_code_version, official_unit_group_code, currency, registration_required, registration_authority, registration_url, publication_status, source_checked_at")
    .eq("country_code", country)
    .eq("canonical_career_id", career)
    .maybeSingle())

  if (profileResult.error) throw profileResult.error
  const profile = profileResult.data
  if (!profile) return null

  const metricResult = await readRawCareerData((client) => client
    .from("country_occupation_metric_snapshots")
    .select("as_of_date, employment_total, median_weekly_earnings, median_hourly_earnings, annualised_median_salary, all_occupations_median_weekly, part_time_share_pct, female_share_pct, median_age, average_full_time_hours, vacancies_three_month_avg, vacancy_period, vacancy_yoy_pct, employment_growth_5y_pct, employment_growth_10y_pct, shortage_component, vacancy_intensity_component, employer_diversity_component, vacancy_trend_component, entry_level_component, salary_component, growth_component, visa_component, entry_burden_component, opportunity_score, score_methodology_version, score_status, score_evidence, source_checked_at")
    .eq("profile_key", profile.profile_key)
    .order("as_of_date", { ascending: false })
    .limit(1)
    .maybeSingle())

  if (metricResult.error) throw metricResult.error
  const metricRow = metricResult.data
  if (!metricRow) return null

  const [specialisationsResult, regionsResult, linksResult, programsResult] = await Promise.all([
    readRawCareerData((client) => client
      .from("country_occupation_specialisations")
      .select("official_code, official_title, legacy_code_system, legacy_code_version, legacy_code, shortage_rating, visa_eligible, included_in_rollup")
      .eq("profile_key", profile.profile_key)
      .order("sort_order", { ascending: true })),
    readRawCareerData((client) => client
      .from("country_occupation_region_metrics")
      .select("region_code, as_of_date, shortage_rating, vacancy_count, source_url")
      .eq("profile_key", profile.profile_key)
      .eq("as_of_date", metricRow.as_of_date)
      .order("vacancy_count", { ascending: false, nullsFirst: false })),
    readRawCareerData((client) => client
      .from("country_occupation_links")
      .select("link_type, label, url, provider_type, region_code")
      .eq("profile_key", profile.profile_key)
      .order("link_type", { ascending: true })
      .order("sort_order", { ascending: true })),
    readRawCareerData((client) => client
      .from("country_occupation_program_links")
      .select("program_ref, relation_type")
      .eq("profile_key", profile.profile_key)
      .order("program_ref", { ascending: true })),
  ])

  for (const result of [specialisationsResult, regionsResult, linksResult, programsResult]) {
    if (result.error) throw result.error
  }

  const rawProgramLinks = programsResult.data ?? []
  const resolvedPrograms = new Map<number, CountryOccupationResolvedProgram>()
  const auProgramIds =
    country === "AU"
      ? Array.from(
          new Set(
            rawProgramLinks
              .map((row) => auProgramId(row.program_ref))
              .filter((id): id is number => id != null)
          )
        )
      : []

  if (auProgramIds.length > 0) {
    // courses_au and the institution identity read model are deliberately not exposed to anon.
    // Resolve only the already-curated occupation program IDs through the server-only service-role client.
    const coursesResult = await supabaseAdmin
      .from("courses_au")
      .select("id, institution_id, title, duration_years, tuition_fee_aud, official_course_url, cricos_url, qualifax_url")
      .in("id", auProgramIds)

    if (coursesResult.error) throw coursesResult.error

    const courseRows = coursesResult.data ?? []
    const institutionIds = Array.from(
      new Set(courseRows.map((row) => row.institution_id).filter((id): id is string => Boolean(id)))
    )
    const institutionNames = new Map<string, string>()

    if (institutionIds.length > 0) {
      const institutionsResult = await supabaseAdmin
        .from("au_institution_identity_v1")
        .select("legacy_provider_id, institution_name")
        .in("legacy_provider_id", institutionIds)

      if (institutionsResult.error) throw institutionsResult.error
      for (const row of institutionsResult.data ?? []) {
        institutionNames.set(row.legacy_provider_id, row.institution_name)
      }
    }

    for (const row of courseRows) {
      const id = Number(row.id)
      if (!Number.isSafeInteger(id)) continue
      resolvedPrograms.set(id, {
        title: row.title,
        provider: institutionNames.get(row.institution_id) ?? "Australian provider",
        durationYears: numeric(row.duration_years),
        tuitionFeeAud: numeric(row.tuition_fee_aud),
        url: row.official_course_url ?? row.cricos_url ?? row.qualifax_url ?? null,
      })
    }
  }

  const internalBreakdown = {
    shortage: numeric(metricRow.shortage_component),
    vacancyIntensity: numeric(metricRow.vacancy_intensity_component),
    employerDiversity: numeric(metricRow.employer_diversity_component),
    vacancyTrend: numeric(metricRow.vacancy_trend_component),
    entryLevel: numeric(metricRow.entry_level_component),
    salary: numeric(metricRow.salary_component),
    growth: numeric(metricRow.growth_component),
    visa: numeric(metricRow.visa_component),
    entryBurden: numeric(metricRow.entry_burden_component),
  }

  const scoreCandidate = campCareerScoreFromLegacyBreakdown({
    shortage: internalBreakdown.shortage,
    vacancyIntensity: internalBreakdown.vacancyIntensity,
    employerDiversity: internalBreakdown.employerDiversity,
    vacancyTrend: internalBreakdown.vacancyTrend,
    entryLevel: internalBreakdown.entryLevel,
    salary: internalBreakdown.salary,
    growth: internalBreakdown.growth,
    entryBurden: internalBreakdown.entryBurden,
  })
  const scoreReady = isCareerScoreReady(country, career)
  const campCareerScore = scoreReady ? scoreCandidate : null

  const metric: CountryOccupationMetric = {
    asOfDate: metricRow.as_of_date,
    employmentTotal: numeric(metricRow.employment_total),
    medianWeeklyEarnings: numeric(metricRow.median_weekly_earnings),
    medianHourlyEarnings: numeric(metricRow.median_hourly_earnings),
    annualisedMedianSalary: numeric(metricRow.annualised_median_salary),
    allOccupationsMedianWeekly: numeric(metricRow.all_occupations_median_weekly),
    partTimeSharePct: numeric(metricRow.part_time_share_pct),
    femaleSharePct: numeric(metricRow.female_share_pct),
    medianAge: numeric(metricRow.median_age),
    averageFullTimeHours: numeric(metricRow.average_full_time_hours),
    vacanciesThreeMonthAvg: numeric(metricRow.vacancies_three_month_avg),
    vacancyPeriod: metricRow.vacancy_period,
    vacancyYoyPct: numeric(metricRow.vacancy_yoy_pct),
    employmentGrowth5yPct: numeric(metricRow.employment_growth_5y_pct),
    employmentGrowth10yPct: numeric(metricRow.employment_growth_10y_pct),
    opportunityScore: campCareerScore?.total ?? null,
    campCareerScore,
    scoreMethodologyVersion: CAMPCAREER_SCORE_VERSION,
    scoreStatus: metricRow.score_status,
    scoreEvidence: {
      ...(metricRow.score_evidence ?? {}) as Record<string, unknown>,
      publicScore: campCareerScore,
      publicScoreReady: scoreReady,
      internalOpportunityScore: numeric(metricRow.opportunity_score),
      internalScoreMethodologyVersion: metricRow.score_methodology_version,
      scoringPolicy: "The public CampCareer Score excludes visa and uses Demand 40 / Pay 30 / Entry 30. Coverage readiness must also pass before the derived legacy score is public.",
    },
    score: {
      shortage: internalBreakdown.shortage ?? 0,
      vacancyIntensity: internalBreakdown.vacancyIntensity ?? 0,
      employerDiversity: internalBreakdown.employerDiversity ?? 0,
      vacancyTrend: internalBreakdown.vacancyTrend ?? 0,
      entryLevel: internalBreakdown.entryLevel ?? 0,
      salary: internalBreakdown.salary ?? 0,
      growth: internalBreakdown.growth ?? 0,
      visa: internalBreakdown.visa ?? 0,
      entryBurden: internalBreakdown.entryBurden ?? 0,
    },
    sourceCheckedAt: metricRow.source_checked_at,
  }

  const specialisations: CountryOccupationSpecialisation[] = (specialisationsResult.data ?? []).map((row) => ({
    officialCode: row.official_code,
    officialTitle: row.official_title,
    legacyCodeSystem: row.legacy_code_system,
    legacyCodeVersion: row.legacy_code_version,
    legacyCode: row.legacy_code,
    shortageRating: numeric(row.shortage_rating),
    visaEligible: row.visa_eligible,
    includedInRollup: row.included_in_rollup,
  }))

  const regions: CountryOccupationRegionMetric[] = (regionsResult.data ?? []).map((row) => ({
    regionCode: row.region_code,
    asOfDate: row.as_of_date,
    shortageRating: numeric(row.shortage_rating),
    vacancyCount: numeric(row.vacancy_count),
    sourceUrl: row.source_url,
  }))

  const links: CountryOccupationLink[] = (linksResult.data ?? []).map((row) => ({
    linkType: row.link_type,
    label: row.label,
    url: row.url,
    providerType: row.provider_type,
    regionCode: row.region_code,
  }))

  const programLinks: CountryOccupationProgramLink[] = rawProgramLinks.map((row) => {
    const programId = auProgramId(row.program_ref)
    return {
      programRef: row.program_ref,
      relationType: row.relation_type,
      program: programId == null ? null : resolvedPrograms.get(programId) ?? null,
    }
  })

  return {
    profileKey: profile.profile_key,
    countryCode: profile.country_code,
    canonicalCareerId: profile.canonical_career_id,
    officialTitle: profile.official_title,
    officialCodeSystem: profile.official_code_system,
    officialCodeVersion: profile.official_code_version,
    officialUnitGroupCode: profile.official_unit_group_code,
    currency: profile.currency,
    registrationRequired: profile.registration_required,
    registrationAuthority: profile.registration_authority,
    registrationUrl: profile.registration_url,
    publicationStatus: profile.publication_status,
    sourceCheckedAt: profile.source_checked_at,
    metric,
    specialisations,
    regions,
    links,
    programLinks,
  }
}
