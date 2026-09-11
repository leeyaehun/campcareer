import "server-only"
import { unstable_cache } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase-admin"
import {
  buildCountryMetrics,
  COUNTRY_METRIC_KEYS,
  type CountryMetricRecord,
  type CountryMetrics,
  type CountryMetricSnapshotRecord,
  type CountryMetricSourceRecord,
} from "./country-metric-contract"

type PublishedMetricRow = {
  id: string
  metric_key: string
  value: unknown
  source_name: string
  source_url: string
  data_as_of: string | null
  last_verified_at: string | null
  confidence: string
}

const PUBLISHED_METRIC_TABLES: Record<string, readonly string[]> = {
  AU: ["report_metric_evidence_country", "report_metric_evidence_au"],
  CA: ["report_metric_evidence_country"],
  US: ["report_metric_evidence_country"],
  UK: ["report_metric_evidence_country"],
  IE: ["report_metric_evidence_country"],
  DE: ["report_metric_evidence_country"],
  NL: ["report_metric_evidence_country"],
  BE: ["report_metric_evidence_country"],
  FR: ["report_metric_evidence_country"],
  ES: ["report_metric_evidence_country"],
  SG: ["report_metric_evidence_country"],
  KR: ["report_metric_evidence_country"],
  JP: ["report_metric_evidence_country"],
  NZ: ["report_metric_evidence_country"],
  NO: ["report_metric_evidence_country"],
  SE: ["report_metric_evidence_country"],
  DK: ["report_metric_evidence_country"],
  FI: ["report_metric_evidence_country"],
  CH: ["report_metric_evidence_country"],
  AE: ["report_metric_evidence_country"],
}

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  AU: "AUD",
  CA: "CAD",
  US: "USD",
  UK: "GBP",
  IE: "EUR",
  DE: "EUR",
  NL: "EUR",
  BE: "EUR",
  FR: "EUR",
  ES: "EUR",
  SG: "SGD",
  KR: "KRW",
  JP: "JPY",
  NZ: "NZD",
  NO: "NOK",
  SE: "SEK",
  DK: "DKK",
  FI: "EUR",
  CH: "CHF",
  AE: "AED",
}

function metricUnit(countryCode: string, metricKey: string) {
  const currency = CURRENCY_BY_COUNTRY[countryCode]
  if (!currency) return null
  if (["full_time_annual_earnings_range", "average_annual_salary", "tuition_annual_low", "tuition_annual_high"].includes(metricKey)) return `${currency}/year`
  if (metricKey === "national_minimum_hourly_wage") return `${currency}/hour`
  if (metricKey === "student_living_cost_monthly_range" || metricKey.startsWith("student_living_cost_shared_monthly_")) return `${currency}/month`
  if (metricKey === "visa_application_fee") return currency
  if (metricKey === "student_work_hours_limit") return countryCode === "FR" ? "hours/year" : "hours/week"
  return null
}

function sourceOrganisation(row: PublishedMetricRow) {
  const url = row.source_url
  if (url.includes("abs.gov.au")) return "Australian Bureau of Statistics"
  if (url.includes("fairwork.gov.au")) return "Fair Work Ombudsman"
  if (url.includes("studyaustralia.gov.au")) return "Study Australia"
  if (url.includes("canada.ca")) return "Government of Canada"
  if (url.includes("educanada.ca")) return "EduCanada"
  if (url.includes("bls.gov")) return "U.S. Bureau of Labor Statistics"
  if (url.includes("dol.gov")) return "U.S. Department of Labor"
  if (url.includes("collegeboard.org")) return "College Board"
  if (url.includes("travel.state.gov") || url.includes("studyinthestates.dhs.gov")) return "U.S. Government"
  if (url.includes("ons.gov.uk")) return "Office for National Statistics"
  if (url.includes("britishcouncil.org")) return "British Council"
  if (url.includes("gov.uk")) return "UK Government"
  if (url.includes("cso.ie")) return "Central Statistics Office Ireland"
  if (url.includes("irishimmigration.ie")) return "Immigration Service Delivery"
  if (url.includes("educationinireland.com")) return "Education in Ireland"
  if (url.includes("gov.ie")) return "Government of Ireland"
  if (url.includes("destatis.de")) return "Federal Statistical Office Germany"
  if (url.includes("make-it-in-germany.com")) return "Make it in Germany"
  if (url.includes("daad.de")) return "DAAD"
  if (url.includes("bmas.de")) return "Federal Ministry of Labour Germany"
  if (url.includes("auswaertiges-amt.de")) return "Federal Foreign Office Germany"
  if (url.includes("cbs.nl")) return "Statistics Netherlands"
  if (url.includes("studyinnl.org")) return "Study in NL"
  if (url.includes("government.nl")) return "Government of the Netherlands"
  if (url.includes("ind.nl")) return "Immigration and Naturalisation Service"
  if (url.includes("statbel.fgov.be")) return "Statbel"
  if (url.includes("studyinflanders.be")) return "Study in Flanders"
  if (url.includes("employment.belgium.be")) return "Belgian FPS Employment"
  if (url.includes("dofi.ibz.be")) return "Belgian Immigration Office"
  if (url.includes("studentatwork.be")) return "Student At Work Belgium"
  if (url.includes("insee.fr")) return "INSEE"
  if (url.includes("campusfrance.org")) return "Campus France"
  if (url.includes("france-visas.gouv.fr")) return "France-Visas"
  if (url.includes("travail-emploi.gouv.fr")) return "French Ministry of Labour"
  return row.source_name
}

async function readPublishedRows(code: string): Promise<PublishedMetricRow[]> {
  const tables = PUBLISHED_METRIC_TABLES[code] ?? []
  for (const [index, table] of tables.entries()) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("id, metric_key, value, source_name, source_url, data_as_of, last_verified_at, confidence")
      .eq("scope_type", "country")
      .eq("scope_id", code)
      .eq("review_status", "verified")
      .in("metric_key", [...COUNTRY_METRIC_KEYS])
      .order("last_verified_at", { ascending: false, nullsFirst: false })
    if (!error) return (data ?? []) as PublishedMetricRow[]
    if (index === tables.length - 1) console.error(`[country-metrics] ${code} published metric query failed:`, error)
  }
  return []
}

async function loadCountryMetrics(countryCode: string): Promise<CountryMetrics> {
  const code = countryCode.trim().toUpperCase()
  if (!PUBLISHED_METRIC_TABLES[code]) return { sources: [] }
  const rows = await readPublishedRows(code)
  const metrics: CountryMetricRecord[] = rows.map((row) => ({ sourceSnapshotId: row.id, metricKey: row.metric_key, value: row.value, unit: metricUnit(code, row.metric_key), confidence: row.confidence, verifiedAt: row.last_verified_at, effectiveFrom: row.data_as_of }))
  const snapshots: CountryMetricSnapshotRecord[] = rows.map((row) => ({ id: row.id, sourceId: row.id, sourceUrl: row.source_url, dataAsOf: row.data_as_of }))
  const sources: CountryMetricSourceRecord[] = rows.map((row) => ({ id: row.id, organisationName: sourceOrganisation(row), sourceName: row.source_name }))
  return buildCountryMetrics(metrics, snapshots, sources)
}

const getCachedCountryMetrics = unstable_cache(
  loadCountryMetrics,
  ["country-metrics-v1"],
  { revalidate: 3600, tags: ["country-metrics"] },
)

export function getCountryMetrics(countryCode: string): Promise<CountryMetrics> {
  return getCachedCountryMetrics(countryCode.trim().toUpperCase())
}
