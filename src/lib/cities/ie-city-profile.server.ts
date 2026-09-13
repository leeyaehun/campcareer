import "server-only"

import { cache } from "react"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { isPublishedIeCitySlug, normalizeCitySlug } from "@/lib/cities/city-routes"

type CityRow = {
  city_id: string
  country_code: string
  slug: string
  name: string
  region: string
  scope_kind: string
  study_destination_scope: string
  linked_campus_count: number
  linked_institution_count: number
  linked_program_count: number
  institution_coverage_status: string
  programme_coverage_status: string
}

type MetricRow = {
  metric_key: string
  value: unknown
  source_name: string
  source_url: string
  data_as_of: string
  confidence: string
  evidence_kind: string
}

export type IeCityMetricSource = {
  name: string
  url: string
  dataAsOf: string
  confidence: string
}

export type IeCityProfile = {
  id: string
  slug: string
  name: string
  countryCode: "IE"
  countryName: "Ireland"
  region: string
  scopeKind: string
  studyDestinationScope: string
  scopeLabel: string
  linkedCampusCount: number
  linkedInstitutionCount: number
  linkedProgramCount: number
  institutionCoverageStatus: string
  programmeCoverage: {
    status: "verification_pending"
    label: string
    detail: string
  }
  population: {
    amount: number
    geography: string
    dataAsOf: string
  } | null
  livingCost: {
    low: number
    high: number
    currency: string
    period: string
    scenario: string | null
    evidenceKind: string
  } | null
  transport: {
    referenceAmount: number
    period: string
    currency: string
    referenceKind: string
    eligibilityRequired: boolean
    sourceNativePeriod: boolean
    evidenceKind: string
  } | null
  workRights: {
    hoursTermTime: number
    hoursDesignatedHolidays: number
    period: string
    context: string
    eligibilityConditionsApply: boolean
    nationalRule: boolean
  } | null
  employmentSectors: string[]
  employmentSectorBasis: string | null
  sources: IeCityMetricSource[]
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function scopeLabel(city: CityRow) {
  switch (city.study_destination_scope) {
    case "dublin_four_local_authorities":
      return "Dublin four-local-authority study market"
    case "cork_city":
      return "Cork City study scope"
    case "galway_city":
      return "Galway City study scope"
    case "limerick_urban":
      return "Limerick urban study scope"
    default:
      return `${city.name} approved study scope`
  }
}

async function loadIeCityProfile(slug: string): Promise<IeCityProfile | null> {
  const normalizedSlug = normalizeCitySlug(slug)
  if (!normalizedSlug || !isPublishedIeCitySlug(normalizedSlug)) return null

  const { data: cityData, error: cityError } = await supabaseAdmin
    .from("city_directory_ie_v1")
    .select(
      "city_id,country_code,slug,name,region,scope_kind,study_destination_scope,linked_campus_count,linked_institution_count,linked_program_count,institution_coverage_status,programme_coverage_status",
    )
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (cityError) throw new Error(`Unable to load Ireland city: ${cityError.message}`)
  if (!cityData) return null

  const city = cityData as CityRow
  const metricResult = await supabaseAdmin
    .from("report_metric_evidence_city")
    .select("metric_key,value,source_name,source_url,data_as_of,confidence,evidence_kind")
    .eq("geography_id", city.city_id)
    .eq("scope_type", "city")
    .eq("review_status", "verified")
    .in("metric_key", [
      "city_population",
      "student_living_cost_monthly_range",
      "student_transport_reference",
      "student_work_hours_week",
      "employment_focus_sectors",
    ])
    .order("metric_key", { ascending: true })

  if (metricResult.error) {
    throw new Error(`Unable to load Ireland city metrics: ${metricResult.error.message}`)
  }

  const metricRows = (metricResult.data ?? []) as MetricRow[]
  const metrics = new Map(metricRows.map((row) => [row.metric_key, row]))

  const populationRow = metrics.get("city_population")
  const populationValue = record(populationRow?.value)
  const populationAmount = numberValue(populationValue.amount)
  const populationGeography = stringValue(populationValue.geography)

  const livingRow = metrics.get("student_living_cost_monthly_range")
  const livingValue = record(livingRow?.value)
  const livingLow = numberValue(livingValue.low)
  const livingHigh = numberValue(livingValue.high)

  const transportRow = metrics.get("student_transport_reference")
  const transportValue = record(transportRow?.value)
  const transportAmount = numberValue(transportValue.amount)

  const workRow = metrics.get("student_work_hours_week")
  const workValue = record(workRow?.value)
  const workTermHours = numberValue(workValue.hours_term_time)
  const workHolidayHours = numberValue(workValue.hours_designated_holidays)

  const sectorsRow = metrics.get("employment_focus_sectors")
  const sectorsValue = record(sectorsRow?.value)

  const sources = Array.from(
    new Map(
      metricRows.map((row) => [
        row.source_url,
        {
          name: row.source_name,
          url: row.source_url,
          dataAsOf: row.data_as_of,
          confidence: row.confidence,
        } satisfies IeCityMetricSource,
      ]),
    ).values(),
  )

  return {
    id: city.city_id,
    slug: city.slug,
    name: city.name,
    countryCode: "IE",
    countryName: "Ireland",
    region: city.region,
    scopeKind: city.scope_kind,
    studyDestinationScope: city.study_destination_scope,
    scopeLabel: scopeLabel(city),
    linkedCampusCount: city.linked_campus_count,
    linkedInstitutionCount: city.linked_institution_count,
    linkedProgramCount: city.linked_program_count,
    institutionCoverageStatus: city.institution_coverage_status,
    programmeCoverage: {
      status: "verification_pending",
      label: "Ireland programme delivery verification pending",
      detail:
        "Existing Ireland programme records remain legacy discovery data until an official programme or offering is explicitly verified against a delivery campus. Institution presence is never used to infer programme delivery.",
    },
    population:
      populationRow && populationAmount != null && populationGeography
        ? { amount: populationAmount, geography: populationGeography, dataAsOf: populationRow.data_as_of }
        : null,
    livingCost:
      livingRow && livingLow != null && livingHigh != null
        ? {
            low: livingLow,
            high: livingHigh,
            currency: stringValue(livingValue.currency) ?? "EUR",
            period: stringValue(livingValue.period) ?? "month",
            scenario: stringValue(livingValue.scenario),
            evidenceKind: livingRow.evidence_kind,
          }
        : null,
    transport:
      transportRow && transportAmount != null
        ? {
            referenceAmount: transportAmount,
            period: stringValue(transportValue.period) ?? "published_period",
            currency: stringValue(transportValue.currency) ?? "EUR",
            referenceKind: stringValue(transportValue.transport_kind) ?? "student_transport_reference",
            eligibilityRequired: transportValue.eligibility_required === true,
            sourceNativePeriod: transportValue.source_native_period === true,
            evidenceKind: transportRow.evidence_kind,
          }
        : null,
    workRights:
      workRow && workTermHours != null && workHolidayHours != null
        ? {
            hoursTermTime: workTermHours,
            hoursDesignatedHolidays: workHolidayHours,
            period: stringValue(workValue.period) ?? "week",
            context: stringValue(workValue.context) ?? "stamp_2_student_permission",
            eligibilityConditionsApply: workValue.eligibility_conditions_apply === true,
            nationalRule: workValue.national_rule === true,
          }
        : null,
    employmentSectors: stringArray(sectorsValue.sectors),
    employmentSectorBasis: stringValue(sectorsValue.basis),
    sources,
  }
}

export const getIeCityProfile = cache(loadIeCityProfile)
