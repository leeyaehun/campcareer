import "server-only"

import { cache } from "react"

import { campCareerScoreFromFoundationComponents } from "@/lib/campcareer-score"
import { supabase } from "@/lib/supabase"
import { foundationScoreConfidence } from "./opportunity-score"
import type {
  CareerDataFoundationResult,
  CareerFoundationBlocker,
  CareerFoundationEntryPoint,
  CareerFoundationJobOpportunity,
  CareerFoundationLicensingEvidence,
  CareerFoundationNormalizedMetric,
  CareerFoundationNormalizedMetricInput,
  CareerFoundationRawObservation,
  CareerFoundationScoreComponent,
  CareerFoundationScoreComponentMetricInput,
  CareerFoundationScoreComponentRawInput,
  CareerFoundationSource,
  CareerFoundationVisaPathway,
  FoundationComponentKey,
  FoundationEvidenceStatus,
  FoundationMappingQuality,
  FoundationSourceType,
} from "./types"

type ResultRow = {
  profile_key: string
  country_code: string
  canonical_occupation_id: string
  currency: string
  source_checked_on: string
  official_taxonomy: string
  official_taxonomy_version: string
  official_code: string
  official_title: string
  mapping_relation: "exact" | "broader" | "narrower" | "composite" | "proxy"
  mapping_quality: "high" | "medium" | "low"
  mapping_rationale: string
  mapping_source_url: string
  mapping_verified_on: string
  snapshot_key: string
  formula_version: string
  required_component_count: number
  scored_components: number
  score_coverage_weight: number | string
  score_ready: boolean
  opportunity_score: number | string | null
  decision_ready: boolean
  publish_ready: boolean
  decision_readiness_reason: string
  score_explanation: string
  calculation_timestamp: string | null
}

type MappingRow = { mapping_key: string; source_key: string }

type RawRow = {
  observation_key: string
  metric_key: string
  source_key: string
  mapping_key: string | null
  reference_period: string
  as_of_date: string | null
  raw_value: unknown | null
  unit: string | null
  availability: "available" | "unavailable"
  reason: string | null
  directness: "direct" | "proxy"
  mapping_quality: FoundationMappingQuality
  proxy_reason: string | null
  source_type: FoundationSourceType
  quality: "high" | "medium" | "low"
  confidence: number | string
  last_verified_on: string
  explanation: string
}

type NormalizedRow = {
  normalized_metric_key: string
  metric_key: string
  input_observation_refs: string[]
  normalized_value: number | string | null
  normalized_unit: string | null
  formula_version: string
  availability: "available" | "unavailable"
  reason: string | null
  directness: "direct" | "proxy"
  mapping_quality: FoundationMappingQuality
  proxy_reason: string | null
  source_type: FoundationSourceType
  calculated_at: string
  quality: "high" | "medium" | "low"
  confidence: number | string
  explanation: string
}

type ComponentRow = {
  component_key: FoundationComponentKey
  raw_input_refs: string[]
  normalized_metric_refs: string[]
  normalized_value: number | string | null
  formula_version: string
  score_value: number | string | null
  max_score: number | string
  availability: "available" | "unavailable"
  directness: "direct" | "proxy"
  mapping_quality: FoundationMappingQuality
  proxy_reason: string | null
  source_type: FoundationSourceType
  calculated_at: string
  quality: "high" | "medium" | "low"
  confidence: number | string
  explanation: string
  reason: string | null
  evidence_status: FoundationEvidenceStatus
}

type BlockerRow = {
  blocker_key: string
  blocker_type: CareerFoundationBlocker["blockerType"]
  severity: CareerFoundationBlocker["severity"]
  reason: string
  source_key: string
  official_source_url: string
  applicability_scope: string
  last_verified_on: string
}

type EntryPointRow = {
  entry_point_key: string
  entry_type: CareerFoundationEntryPoint["entryType"]
  label: string
  provider: string
  url: string
  source_key: string
  applicability_scope: string
  last_verified_on: string
  notes: string | null
  sort_order: number
}

type SourceRow = {
  source_key: string
  authority: string
  title: string
  url: string
  source_type: FoundationSourceType
  last_verified_on: string
  notes: string | null
}

type LicensingRow = {
  evidence_key: string
  jurisdiction_code: string
  jurisdiction_name: string
  jurisdiction_level: CareerFoundationLicensingEvidence["jurisdictionLevel"]
  requirement_type: CareerFoundationLicensingEvidence["requirementType"]
  mandatory: boolean
  applies_to: CareerFoundationLicensingEvidence["appliesTo"]
  authority: string
  source_key: string
  official_source_url: string
  verified_on: string
  cost_amount: number | string | null
  cost_currency: string | null
  expected_duration_days: number | null
  exceptions: string | null
  evidence_quality: CareerFoundationLicensingEvidence["evidenceQuality"]
  notes: string | null
}

type VisaPathwayRow = {
  pathway_key: string
  route_role: CareerFoundationVisaPathway["routeRole"]
  pathway_name: string
  source_key: string
  official_source_url: string
  occupation_applicability_points: number
  employer_dependency_points: number
  eligibility_burden_points: number
  long_term_pathway_points: number
  used_for_primary_score: boolean
  applicability_scope: string
  last_verified_on: string
  notes: string | null
}

type JobOpportunityRow = {
  opportunity_key: string
  source_key: string
  title: string
  employer: string
  location_text: string
  posted_on: string | null
  application_deadline: string | null
  source_name: string
  listing_url: string
  apply_url: string
  last_checked_on: string
  status: CareerFoundationJobOpportunity["status"]
  relation_quality: CareerFoundationJobOpportunity["relationQuality"]
  notes: string | null
}

type NormalizedMetricInputRow = {
  normalized_metric_key: string
  observation_key: string
  input_role: string
  usage_type: CareerFoundationNormalizedMetricInput["usageType"]
  input_weight: number | string | null
}

type ScoreMetricInputRow = {
  snapshot_key: string
  component_key: FoundationComponentKey
  normalized_metric_key: string
  input_role: string
}

type ScoreRawInputRow = {
  snapshot_key: string
  component_key: FoundationComponentKey
  observation_key: string
  input_role: string
}

const numberOrNull = (value: number | string | null | undefined) => value == null ? null : Number(value)

const rawNumber = (observations: CareerFoundationRawObservation[], metricKey: string) => {
  const value = observations.find((item) => item.metricKey === metricKey && item.availability === "available")?.rawValue
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value)
  return null
}

const rawObservation = (observations: CareerFoundationRawObservation[], metricKey: string) =>
  observations.find((item) => item.metricKey === metricKey) ?? null

async function getCareerDataFoundationUncached({
  countryCode,
  careerId,
}: {
  countryCode: string
  careerId: string
}): Promise<CareerDataFoundationResult | null> {
  const country = countryCode.trim().toUpperCase()
  const resultQuery = await supabase
    .from("career_foundation_result_v1")
    .select("*")
    .eq("country_code", country)
    .eq("canonical_occupation_id", careerId)
    .maybeSingle()

  if (resultQuery.error) throw resultQuery.error
  if (!resultQuery.data) return null
  const result = resultQuery.data as ResultRow

  const [mappingQuery, rawQuery, normalizedQuery, componentQuery, blockerQuery, entryPointQuery, licensingQuery, visaPathwayQuery, jobOpportunityQuery] = await Promise.all([
    supabase.from("career_occupation_mappings").select("mapping_key,source_key").eq("profile_key", result.profile_key).eq("is_primary", true).single(),
    supabase.from("career_raw_observations").select("*").eq("profile_key", result.profile_key).order("observation_key"),
    supabase.from("career_normalized_metrics").select("*").eq("profile_key", result.profile_key).order("normalized_metric_key"),
    supabase.from("career_score_components").select("*").eq("snapshot_key", result.snapshot_key).order("component_key"),
    supabase.from("career_foundation_blockers").select("*").eq("profile_key", result.profile_key).eq("active", true).order("blocker_type"),
    supabase.from("career_foundation_entry_points").select("*").eq("profile_key", result.profile_key).order("sort_order"),
    supabase.from("career_foundation_licensing_evidence").select("*").eq("profile_key", result.profile_key).order("jurisdiction_code"),
    supabase.from("career_foundation_visa_pathways").select("*").eq("profile_key", result.profile_key).order("route_role"),
    supabase.from("career_foundation_job_opportunities").select("*").eq("profile_key", result.profile_key).eq("status", "active").order("last_checked_on", { ascending: false }),
  ])

  for (const query of [mappingQuery, rawQuery, normalizedQuery, componentQuery, blockerQuery, entryPointQuery, licensingQuery, visaPathwayQuery, jobOpportunityQuery]) {
    if (query.error) throw query.error
  }

  const mappingRow = mappingQuery.data as MappingRow
  const rawObservations: CareerFoundationRawObservation[] = ((rawQuery.data ?? []) as RawRow[]).map((row) => ({
    observationKey: row.observation_key,
    metricKey: row.metric_key,
    sourceKey: row.source_key,
    mappingKey: row.mapping_key,
    referencePeriod: row.reference_period,
    asOfDate: row.as_of_date,
    rawValue: row.raw_value,
    unit: row.unit,
    availability: row.availability,
    reason: row.reason,
    directness: row.directness,
    mappingQuality: row.mapping_quality,
    proxyReason: row.proxy_reason,
    sourceType: row.source_type,
    quality: row.quality,
    confidence: Number(row.confidence),
    lastVerifiedOn: row.last_verified_on,
    explanation: row.explanation,
  }))

  const normalizedMetrics: CareerFoundationNormalizedMetric[] = ((normalizedQuery.data ?? []) as NormalizedRow[]).map((row) => ({
    normalizedMetricKey: row.normalized_metric_key,
    metricKey: row.metric_key,
    inputObservationRefs: row.input_observation_refs,
    normalizedValue: numberOrNull(row.normalized_value),
    normalizedUnit: row.normalized_unit,
    formulaVersion: row.formula_version,
    availability: row.availability,
    reason: row.reason,
    directness: row.directness,
    mappingQuality: row.mapping_quality,
    proxyReason: row.proxy_reason,
    sourceType: row.source_type,
    calculatedAt: row.calculated_at,
    quality: row.quality,
    confidence: Number(row.confidence),
    explanation: row.explanation,
  }))

  const scoreComponents: CareerFoundationScoreComponent[] = ((componentQuery.data ?? []) as ComponentRow[]).map((row) => ({
    componentKey: row.component_key,
    rawInputRefs: row.raw_input_refs,
    normalizedMetricRefs: row.normalized_metric_refs,
    normalizedValue: numberOrNull(row.normalized_value),
    formulaVersion: row.formula_version,
    scoreValue: numberOrNull(row.score_value),
    maxScore: Number(row.max_score),
    availability: row.availability,
    directness: row.directness,
    mappingQuality: row.mapping_quality,
    proxyReason: row.proxy_reason,
    sourceType: row.source_type,
    calculatedAt: row.calculated_at,
    quality: row.quality,
    confidence: Number(row.confidence),
    explanation: row.explanation,
    reason: row.reason,
    evidenceStatus: row.evidence_status,
  }))

  const blockers: CareerFoundationBlocker[] = ((blockerQuery.data ?? []) as BlockerRow[]).map((row) => ({
    blockerKey: row.blocker_key,
    blockerType: row.blocker_type,
    severity: row.severity,
    reason: row.reason,
    sourceKey: row.source_key,
    officialSourceUrl: row.official_source_url,
    applicabilityScope: row.applicability_scope,
    lastVerifiedOn: row.last_verified_on,
  }))

  const entryPoints: CareerFoundationEntryPoint[] = ((entryPointQuery.data ?? []) as EntryPointRow[]).map((row) => ({
    entryPointKey: row.entry_point_key,
    entryType: row.entry_type,
    label: row.label,
    provider: row.provider,
    url: row.url,
    sourceKey: row.source_key,
    applicabilityScope: row.applicability_scope,
    lastVerifiedOn: row.last_verified_on,
    notes: row.notes,
    sortOrder: row.sort_order,
  }))

  const licensingEvidence: CareerFoundationLicensingEvidence[] = ((licensingQuery.data ?? []) as LicensingRow[]).map((row) => ({
    evidenceKey: row.evidence_key,
    jurisdictionCode: row.jurisdiction_code,
    jurisdictionName: row.jurisdiction_name,
    jurisdictionLevel: row.jurisdiction_level,
    requirementType: row.requirement_type,
    mandatory: row.mandatory,
    appliesTo: row.applies_to,
    authority: row.authority,
    sourceKey: row.source_key,
    officialSourceUrl: row.official_source_url,
    verifiedOn: row.verified_on,
    costAmount: numberOrNull(row.cost_amount),
    costCurrency: row.cost_currency,
    expectedDurationDays: row.expected_duration_days,
    exceptions: row.exceptions,
    evidenceQuality: row.evidence_quality,
    notes: row.notes,
  }))

  const visaPathways: CareerFoundationVisaPathway[] = ((visaPathwayQuery.data ?? []) as VisaPathwayRow[]).map((row) => ({
    pathwayKey: row.pathway_key,
    routeRole: row.route_role,
    pathwayName: row.pathway_name,
    sourceKey: row.source_key,
    officialSourceUrl: row.official_source_url,
    occupationApplicabilityPoints: row.occupation_applicability_points,
    employerDependencyPoints: row.employer_dependency_points,
    eligibilityBurdenPoints: row.eligibility_burden_points,
    longTermPathwayPoints: row.long_term_pathway_points,
    usedForPrimaryScore: row.used_for_primary_score,
    applicabilityScope: row.applicability_scope,
    lastVerifiedOn: row.last_verified_on,
    notes: row.notes,
  }))

  const jobOpportunities: CareerFoundationJobOpportunity[] = ((jobOpportunityQuery.data ?? []) as JobOpportunityRow[]).map((row) => ({
    opportunityKey: row.opportunity_key,
    sourceKey: row.source_key,
    title: row.title,
    employer: row.employer,
    locationText: row.location_text,
    postedOn: row.posted_on,
    applicationDeadline: row.application_deadline,
    sourceName: row.source_name,
    listingUrl: row.listing_url,
    applyUrl: row.apply_url,
    lastCheckedOn: row.last_checked_on,
    status: row.status,
    relationQuality: row.relation_quality,
    notes: row.notes,
  }))

  const normalizedMetricKeys = normalizedMetrics.map((item) => item.normalizedMetricKey)
  const [normalizedInputQuery, scoreMetricInputQuery, scoreRawInputQuery] = await Promise.all([
    normalizedMetricKeys.length
      ? supabase.from("career_normalized_metric_inputs").select("*").in("normalized_metric_key", normalizedMetricKeys).order("normalized_metric_key")
      : Promise.resolve({ data: [], error: null }),
    supabase.from("career_score_component_metric_inputs").select("*").eq("snapshot_key", result.snapshot_key).order("component_key"),
    supabase.from("career_score_component_raw_inputs").select("*").eq("snapshot_key", result.snapshot_key).order("component_key"),
  ])

  for (const query of [normalizedInputQuery, scoreMetricInputQuery, scoreRawInputQuery]) {
    if (query.error) throw query.error
  }

  const normalizedMetricInputs: CareerFoundationNormalizedMetricInput[] = ((normalizedInputQuery.data ?? []) as NormalizedMetricInputRow[]).map((row) => ({
    normalizedMetricKey: row.normalized_metric_key,
    observationKey: row.observation_key,
    inputRole: row.input_role,
    usageType: row.usage_type,
    inputWeight: numberOrNull(row.input_weight),
  }))
  const scoreComponentMetricInputs: CareerFoundationScoreComponentMetricInput[] = ((scoreMetricInputQuery.data ?? []) as ScoreMetricInputRow[]).map((row) => ({
    snapshotKey: row.snapshot_key,
    componentKey: row.component_key,
    normalizedMetricKey: row.normalized_metric_key,
    inputRole: row.input_role,
  }))
  const scoreComponentRawInputs: CareerFoundationScoreComponentRawInput[] = ((scoreRawInputQuery.data ?? []) as ScoreRawInputRow[]).map((row) => ({
    snapshotKey: row.snapshot_key,
    componentKey: row.component_key,
    observationKey: row.observation_key,
    inputRole: row.input_role,
  }))

  const sourceKeys = [...new Set([
    mappingRow.source_key,
    ...rawObservations.map((item) => item.sourceKey),
    ...blockers.map((item) => item.sourceKey),
    ...entryPoints.map((item) => item.sourceKey),
    ...licensingEvidence.map((item) => item.sourceKey),
    ...visaPathways.map((item) => item.sourceKey),
    ...jobOpportunities.map((item) => item.sourceKey),
  ])]
  const sourceQuery = await supabase.from("career_official_sources").select("*").in("source_key", sourceKeys).order("source_key")
  if (sourceQuery.error) throw sourceQuery.error
  const sources: CareerFoundationSource[] = ((sourceQuery.data ?? []) as SourceRow[]).map((row) => ({
    sourceKey: row.source_key,
    authority: row.authority,
    title: row.title,
    url: row.url,
    sourceType: row.source_type,
    lastVerifiedOn: row.last_verified_on,
    notes: row.notes,
  }))

  const vacancy = rawObservation(rawObservations, "national_vacancy_intensity")
  const shortage = rawObservation(rawObservations, "national_shortage_signal")
  const employment = rawObservation(rawObservations, "employment_total")
  const annualWage = rawObservation(rawObservations, "median_annual_wage")
  const hourlyWage = rawObservation(rawObservations, "median_hourly_wage")
  const projectedEmployment = rawObservation(rawObservations, "projected_employment_total")
  const projectedGrowth = rawObservation(rawObservations, "projected_growth_pct")
  const annualOpenings = rawObservation(rawObservations, "projected_annual_openings")
  const scoreConfidence = foundationScoreConfidence({ scoreReady: result.score_ready, components: scoreComponents })
  const campCareerScore = result.score_ready ? campCareerScoreFromFoundationComponents(scoreComponents) : null

  return {
    profileKey: result.profile_key,
    countryCode: result.country_code,
    careerId: result.canonical_occupation_id,
    currency: result.currency,
    sourceCheckedOn: result.source_checked_on,
    mapping: {
      mappingKey: mappingRow.mapping_key,
      careerId: result.canonical_occupation_id,
      countryCode: result.country_code,
      officialTaxonomy: result.official_taxonomy,
      officialTaxonomyVersion: result.official_taxonomy_version,
      officialCode: result.official_code,
      officialTitle: result.official_title,
      mappingRelation: result.mapping_relation,
      mappingQuality: result.mapping_quality,
      rationale: result.mapping_rationale,
      sourceKey: mappingRow.source_key,
      sourceUrl: result.mapping_source_url,
      verifiedOn: result.mapping_verified_on,
      isPrimary: true,
    },
    readiness: {
      decisionReady: result.decision_ready,
      scoreReady: result.score_ready && campCareerScore != null,
      publishReady: result.publish_ready,
      decisionReason: result.decision_readiness_reason,
      scoredComponents: result.scored_components,
      requiredComponents: result.required_component_count,
      scoreCoverageWeight: Number(result.score_coverage_weight),
      formulaVersion: result.formula_version,
      calculationTimestamp: result.calculation_timestamp,
    },
    opportunityScore: numberOrNull(result.opportunity_score),
    campCareerScore,
    scoreConfidence,
    scoreExplanation: result.score_explanation,
    decisionMetrics: {
      employmentTotal: rawNumber(rawObservations, "employment_total"),
      employmentReferencePeriod: employment?.referencePeriod ?? null,
      medianAnnualWage: rawNumber(rawObservations, "median_annual_wage"),
      medianHourlyWage: rawNumber(rawObservations, "median_hourly_wage"),
      wageReferencePeriod: annualWage?.referencePeriod ?? hourlyWage?.referencePeriod ?? null,
      projectedEmployment2034: rawNumber(rawObservations, "projected_employment_total"),
      projectedGrowthPct: rawNumber(rawObservations, "projected_growth_pct"),
      projectedAnnualOpenings: rawNumber(rawObservations, "projected_annual_openings"),
      projectionsReferencePeriod: annualOpenings?.referencePeriod ?? projectedGrowth?.referencePeriod ?? projectedEmployment?.referencePeriod ?? null,
      vacancyAvailability: vacancy?.availability ?? "unavailable",
      vacancyReason: vacancy?.reason ?? "No validated direct vacancy observation is available.",
      shortageAvailability: shortage?.availability ?? "unavailable",
      shortageReason: shortage?.reason ?? "No validated direct shortage observation is available.",
    },
    sources,
    rawObservations,
    normalizedMetrics,
    scoreComponents,
    normalizedMetricInputs,
    scoreComponentMetricInputs,
    scoreComponentRawInputs,
    licensingEvidence,
    visaPathways,
    jobOpportunities,
    blockers,
    entryPoints,
  }
}

const getCareerDataFoundationCached = cache((countryCode: string, careerId: string) =>
  getCareerDataFoundationUncached({ countryCode, careerId })
)

export function getCareerDataFoundation({
  countryCode,
  careerId,
}: {
  countryCode: string
  careerId: string
}) {
  return getCareerDataFoundationCached(countryCode.trim().toUpperCase(), careerId)
}

export async function getFoundationCountriesForCareer(careerId: string) {
  const query = await supabase
    .from("career_foundation_result_v1")
    .select("country_code,decision_ready,score_ready,publish_ready,opportunity_score,official_title,snapshot_key")
    .eq("canonical_occupation_id", careerId)
  if (query.error) throw query.error

  const rows = (query.data ?? []) as Array<{
    country_code: string
    decision_ready: boolean
    score_ready: boolean
    publish_ready: boolean
    opportunity_score: number | string | null
    official_title: string
    snapshot_key: string
  }>
  const snapshotKeys = rows.map((row) => row.snapshot_key).filter(Boolean)
  const componentsBySnapshot = new Map<string, Array<{
    componentKey: FoundationComponentKey
    scoreValue: number | null
    maxScore: number
    availability: "available" | "unavailable"
    evidenceStatus: FoundationEvidenceStatus
  }>>()

  if (snapshotKeys.length) {
    const componentQuery = await supabase
      .from("career_score_components")
      .select("snapshot_key,component_key,score_value,max_score,availability,evidence_status")
      .in("snapshot_key", snapshotKeys)
    if (componentQuery.error) throw componentQuery.error

    for (const row of componentQuery.data ?? []) {
      const snapshotKey = String(row.snapshot_key)
      const items = componentsBySnapshot.get(snapshotKey) ?? []
      items.push({
        componentKey: String(row.component_key) as FoundationComponentKey,
        scoreValue: numberOrNull(row.score_value as number | string | null),
        maxScore: Number(row.max_score),
        availability: row.availability as "available" | "unavailable",
        evidenceStatus: row.evidence_status as FoundationEvidenceStatus,
      })
      componentsBySnapshot.set(snapshotKey, items)
    }
  }

  const publicComponentKeys: readonly FoundationComponentKey[] = [
    "shortage_signal",
    "vacancy_intensity",
    "industry_diversity",
    "employment_momentum",
    "projected_growth",
    "relative_salary",
    "entry_accessibility",
    "entry_burden",
  ]
  const missingEvidence = new Set<FoundationEvidenceStatus>([
    "no_evidence_found",
    "insufficient_industry_coverage",
  ])

  return rows.map((row) => {
    const components = componentsBySnapshot.get(row.snapshot_key) ?? []
    const campCareerScore = row.score_ready
      ? campCareerScoreFromFoundationComponents(components)
      : null
    const componentsByKey = new Map(components.map((component) => [component.componentKey, component]))
    const strictPublicScoreEvidence = publicComponentKeys.every((componentKey) => {
      const component = componentsByKey.get(componentKey)
      return Boolean(
        component
        && component.availability === "available"
        && component.scoreValue != null
        && Number.isFinite(component.scoreValue)
        && !missingEvidence.has(component.evidenceStatus),
      )
    })

    return {
      countryCode: String(row.country_code),
      decisionReady: Boolean(row.decision_ready),
      scoreReady: Boolean(row.score_ready) && campCareerScore != null,
      publishReady: Boolean(row.publish_ready),
      strictPublicScoreEvidence,
      opportunityScore: campCareerScore?.total ?? null,
      campCareerScore,
      legacyOpportunityScore: numberOrNull(row.opportunity_score),
      officialTitle: String(row.official_title),
    }
  })
}
