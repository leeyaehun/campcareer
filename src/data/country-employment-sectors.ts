/**
 * COUNTRY -> OFFICIAL EMPLOYMENT SECTOR SETS
 * Priority-country companion to the verified Ireland module, used by the
 * Countries discovery hub's sector-surface.
 *
 * HONESTY/PROVENANCE CONTRACT — read all of this before touching any number:
 *   1. NOTHING IS FABRICATED. No sector name, ranking, value or "top-5" is ever
 *      invented — here, or anywhere in this session. A `null` set is an explicit
 *      gap, never something filled with made-up numbers.
 *   2. A country's sector set may ONLY be non-empty when it was transcribed
 *      from a real, official, national-statistics publication during research
 *      (and that publication is cited on the set via `url`/`authority`).
 *   3. Every observation carries the source it was transcribed from. `label`
 *      (when present) is only a display gloss of the official label for busy
 *      card surfaces — never a fabricated alternative name or number.
 *   4. When a top-5 has not been transcribed, the set stays `null` with the
 *      honest gap reason. It is NEVER a filled-in estimate or a fabricated
 *      subset.
 *
 * CURRENT STATE — straight to the point:
 *   - IE — VERIFIED. Delegates to the verified Ireland module (single source
 *           of truth; unchanged contract).
 *   - UK, AU, CA, DE, KR, US — VERIFIED top-5 sector levels, transcribed this
 *           session from each country's official national statistics source
 *           (ONS, ABS, StatCan, Destatis, Statistics Korea, BLS). Sources and
 *           reference periods are cited per set.
 */
import { IRELAND_EMPLOYMENT_SECTOR_SOURCE, getIrelandEmploymentSectorsSorted } from "./ireland-employment-sectors"

export type PriorityEmploymentSectorCountryCode = "UK" | "AU" | "CA" | "DE" | "KR" | "US"

export type PriorityEmploymentSectorSource = {
  authority: string
  title: string
  dataset: string
  referencePeriod: string
  sourceUnit: string
  unit: string
  checkedAt: string
  url: string
  methodology: string
  verificationStatus: "verified" | "unverified"
  gapReason?: string
}

export type PriorityEmploymentSectorObservation = {
  id: string
  officialLabel: string
  /** Display gloss of `officialLabel` for tight card surfaces; never a fabricated value. */
  label?: string
  employmentCount: number
  source: PriorityEmploymentSectorSource
}

export const UK_EMPLOYMENT_SECTOR_SOURCE: PriorityEmploymentSectorSource = {
  authority: "Office for National Statistics",
  title: "Vacancies and jobs in the UK",
  dataset: "JOBS02 — Workforce jobs by industry (quarter)",
  referencePeriod: "June 2025 (quarter)",
  sourceUnit: "thousand jobs",
  unit: "jobs",
  checkedAt: "2026-09-17",
  url: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/workforcejobsbyindustryjobs02/current",
  methodology:
    "Top-5 industry groups by workforce jobs transcribed from the ONS JOBS02 table (June 2025 quarter). Source values in thousands were multiplied by 1,000; wholesaling/retailing includes the repair of motor vehicles and motorcycles.",
  verificationStatus: "verified",
}

const uk = (
  id: string,
  officialLabel: string,
  employmentCount: number,
): PriorityEmploymentSectorObservation => ({ id, officialLabel, employmentCount, source: UK_EMPLOYMENT_SECTOR_SOURCE })

export const UK_EMPLOYMENT_SECTORS: readonly PriorityEmploymentSectorObservation[] = [
  uk("health-social-work", "Human health & social work", 5_125_000),
  uk("wholesale-retail", "Wholesale & retail trade", 4_646_000),
  uk("professional-services", "Professional, scientific & technical", 3_482_000),
  uk("education", "Education", 3_089_000),
  uk("administrative-support", "Administrative & support services", 2_975_000),
]

export const AU_EMPLOYMENT_SECTOR_SOURCE: PriorityEmploymentSectorSource = {
  authority: "Australian Bureau of Statistics",
  title: "Labour Account, Australia",
  dataset: "Employed persons by industry, seasonally adjusted",
  referencePeriod: "June quarter 2026",
  sourceUnit: "thousand persons",
  unit: "persons",
  checkedAt: "2026-09-17",
  url: "https://www.abs.gov.au/statistics/labour/labour-accounts/labour-account-australia/latest-release",
  methodology:
    "Top-5 ANZSIC divisions by employed persons transcribed from the Labour Account industry summary table (June quarter 2026, seasonally adjusted). Source values in thousands were multiplied by 1,000; education and training and professional, scientific and technical services both publish a rounded value of 1,321 (thousand) and are ordered by their exact values.",
  verificationStatus: "verified",
}

const au = (
  id: string,
  officialLabel: string,
  employmentCount: number,
): PriorityEmploymentSectorObservation => ({ id, officialLabel, employmentCount, source: AU_EMPLOYMENT_SECTOR_SOURCE })

export const AU_EMPLOYMENT_SECTORS: readonly PriorityEmploymentSectorObservation[] = [
  au("health-social-assistance", "Health care and social assistance", 2_501_000),
  au("retail-trade", "Retail trade", 1_516_000),
  au("construction", "Construction", 1_342_000),
  au("education-training", "Education and training", 1_321_000),
  au("professional-services", "Professional, scientific and technical services", 1_321_000),
]

export const CA_EMPLOYMENT_SECTOR_SOURCE: PriorityEmploymentSectorSource = {
  authority: "Statistics Canada",
  title: "Labour Force Survey",
  dataset: "Tables 14-10-0288-02 / 14-10-0355-02 — Employment by industry, seasonally adjusted",
  referencePeriod: "August 2026",
  sourceUnit: "thousand persons",
  unit: "persons",
  checkedAt: "2026-09-17",
  url: "https://www150.statcan.gc.ca/n1/daily-quotidien/260904/dq260904a-eng.htm",
  methodology:
    "Top-5 NAICS industries by employment transcribed from the Labour Force Survey release of September 4, 2026 (August 2026 reference period, seasonally adjusted), Table 2 — Employment by class of worker and industry. Source values in thousands were multiplied by 1,000.",
  verificationStatus: "verified",
}

const ca = (
  id: string,
  officialLabel: string,
  employmentCount: number,
): PriorityEmploymentSectorObservation => ({ id, officialLabel, employmentCount, source: CA_EMPLOYMENT_SECTOR_SOURCE })

export const CA_EMPLOYMENT_SECTORS: readonly PriorityEmploymentSectorObservation[] = [
  ca("health-social", "Health care and social assistance", 3_015_900),
  ca("wholesale-retail", "Wholesale and retail trade", 2_954_300),
  ca("professional-services", "Professional, scientific and technical services", 2_026_800),
  ca("manufacturing", "Manufacturing", 1_847_000),
  ca("construction", "Construction", 1_647_500),
]

export const DE_EMPLOYMENT_SECTOR_SOURCE: PriorityEmploymentSectorSource = {
  authority: "Statistisches Bundesamt (Destatis)",
  title: "Persons in employment by economic sector (domestic concept)",
  dataset: "Erwerbstätige und Arbeitnehmer nach Wirtschaftsbereichen (Inlandskonzept)",
  referencePeriod: "2025 (annual)",
  sourceUnit: "thousand persons",
  unit: "persons",
  checkedAt: "2026-09-17",
  url: "https://www.destatis.de/DE/Themen/Arbeit/Arbeitsmarkt/Erwerbstaetigkeit/Tabellen/arbeitnehmer-wirtschaftsbereiche.html",
  methodology:
    "Top-5 economic sectors by persons in employment transcribed from the Destatis table (2025 annual, domestic concept / Inlandskonzept). Source values in thousands were multiplied by 1,000. Official German labels are kept as `officialLabel` with an English display gloss in `label`.",
  verificationStatus: "verified",
}

const de = (
  id: string,
  officialLabel: string,
  label: string,
  employmentCount: number,
): PriorityEmploymentSectorObservation => ({ id, officialLabel, label, employmentCount, source: DE_EMPLOYMENT_SECTOR_SOURCE })

export const DE_EMPLOYMENT_SECTORS: readonly PriorityEmploymentSectorObservation[] = [
  de("public-services-education-health", "Öffentliche Dienstleister, Erziehung, Gesundheit", "Public services, education & health", 15_411_000),
  de("trade-transport-hospitality", "Handel, Verkehr und Gastgewerbe", "Trade, transport & hospitality", 10_027_000),
  de("manufacturing", "Produzierendes Gewerbe (ohne Baugewerbe)", "Manufacturing (excl. construction)", 7_927_000),
  de("business-services", "Unternehmensdienstleister", "Business services", 6_196_000),
  de("construction", "Baugewerbe", "Construction", 2_579_000),
]

export const KR_EMPLOYMENT_SECTOR_SOURCE: PriorityEmploymentSectorSource = {
  authority: "Statistics Korea",
  title: "Economically Active Population Survey (고용동향)",
  dataset: "Employed persons by industry (산업별 취업자)",
  referencePeriod: "August 2026",
  sourceUnit: "thousand persons",
  unit: "persons",
  checkedAt: "2026-09-17",
  url: "https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1DA7E06S",
  methodology:
    "Top-5 industries by employed persons transcribed from the 고용동향 press release of September 9, 2026 (August 2026 reference period), 산업별 취업자 table. Source values in thousands were multiplied by 1,000. Official Korean labels are kept as `officialLabel` with an English display gloss in `label`.",
  verificationStatus: "verified",
}

const kr = (
  id: string,
  officialLabel: string,
  label: string,
  employmentCount: number,
): PriorityEmploymentSectorObservation => ({ id, officialLabel, label, employmentCount, source: KR_EMPLOYMENT_SECTOR_SOURCE })

export const KR_EMPLOYMENT_SECTORS: readonly PriorityEmploymentSectorObservation[] = [
  kr("manufacturing", "제조업", "Manufacturing", 4_325_000),
  kr("health-social-welfare", "보건업 및 사회복지서비스업", "Health & social welfare services", 3_476_000),
  kr("wholesale-retail", "도매 및 소매업", "Wholesale & retail trade", 3_226_000),
  kr("accommodation-food", "숙박 및 음식점업", "Accommodation & food services", 2_259_000),
  kr("education", "교육서비스업", "Education services", 1_934_000),
]

export const US_EMPLOYMENT_SECTOR_SOURCE: PriorityEmploymentSectorSource = {
  authority: "U.S. Bureau of Labor Statistics",
  title: "Current Employment Statistics (CES)",
  dataset: "All employees by supersector, seasonally adjusted (national)",
  referencePeriod: "July 2026",
  sourceUnit: "thousand persons",
  unit: "persons",
  checkedAt: "2026-09-17",
  url: "https://data.bls.gov/timeseries/CES4000000001",
  methodology:
    "Top-5 CES supersectors by all-employee levels transcribed from the BLS supersector time series (July 2026, seasonally adjusted, preliminary where flagged): CES4000000001 Trade, transportation and utilities; CES6500000001 Private education and health services; CES9000000001 Government; CES6000000001 Professional and business services; CES7000000001 Leisure and hospitality. Source values in thousands were multiplied by 1,000.",
  verificationStatus: "verified",
}

const us = (
  id: string,
  officialLabel: string,
  employmentCount: number,
): PriorityEmploymentSectorObservation => ({ id, officialLabel, employmentCount, source: US_EMPLOYMENT_SECTOR_SOURCE })

export const US_EMPLOYMENT_SECTORS: readonly PriorityEmploymentSectorObservation[] = [
  us("trade-transport-utilities", "Trade, transportation & utilities", 28_762_000),
  us("education-health-services", "Education & health services (private)", 27_962_000),
  us("government", "Government", 23_288_000),
  us("professional-business-services", "Professional & business services", 22_517_000),
  us("leisure-hospitality", "Leisure & hospitality", 16_931_000),
]

export const PRIORITY_EMPLOYMENT_SECTOR_SOURCES: Record<
  PriorityEmploymentSectorCountryCode,
  PriorityEmploymentSectorSource
> = {
  UK: UK_EMPLOYMENT_SECTOR_SOURCE,
  AU: AU_EMPLOYMENT_SECTOR_SOURCE,
  CA: CA_EMPLOYMENT_SECTOR_SOURCE,
  DE: DE_EMPLOYMENT_SECTOR_SOURCE,
  KR: KR_EMPLOYMENT_SECTOR_SOURCE,
  US: US_EMPLOYMENT_SECTOR_SOURCE,
}

export const PRIORITY_EMPLOYMENT_SECTORS: Record<PriorityEmploymentSectorCountryCode, readonly PriorityEmploymentSectorObservation[]> = {
  UK: UK_EMPLOYMENT_SECTORS,
  AU: AU_EMPLOYMENT_SECTORS,
  CA: CA_EMPLOYMENT_SECTORS,
  DE: DE_EMPLOYMENT_SECTORS,
  KR: KR_EMPLOYMENT_SECTORS,
  US: US_EMPLOYMENT_SECTORS,
}

export type PriorityEmploymentSectorBarsCountryCode = "IE" | PriorityEmploymentSectorCountryCode
export const PRIORITY_EMPLOYMENT_SECTOR_COUNTRIES: readonly PriorityEmploymentSectorBarsCountryCode[] = [
  "IE", "UK", "AU", "CA", "DE", "KR", "US",
]

/** Full set of observations for a country as a `{label,value}` bar list, or
 * null when the country has no verified/sourced official top-5 (documented
 * gap, never fabricated). Sorting is size-descending with a stable label
 * tie-breaker; the returned list is capped at five bars per country. */
export function getPriorityEmploymentSectorsSorted(
  code: string,
): readonly { label: string; value: number }[] | null {
  const countryCode = code.toUpperCase()

  if (countryCode === "IE") {
    return getIrelandEmploymentSectorsSorted()
      .slice(0, 5)
      .map((sector) => ({ label: sector.officialLabel, value: sector.employmentCount }))
  }

  const sectors = PRIORITY_EMPLOYMENT_SECTORS[countryCode as PriorityEmploymentSectorCountryCode]
  if (!sectors) return null

  return [...sectors]
    .sort(
      (a, b) =>
        b.employmentCount - a.employmentCount ||
        (a.label ?? a.officialLabel).localeCompare(b.label ?? b.officialLabel, "en"),
    )
    .slice(0, 5)
    .map((sector) => ({ label: sector.label ?? sector.officialLabel, value: sector.employmentCount }))
}

export function getPriorityEmploymentSectorSource(code: string): PriorityEmploymentSectorSource | null {
  const countryCode = code.toUpperCase()
  if (countryCode === "IE") return { ...IRELAND_EMPLOYMENT_SECTOR_SOURCE, verificationStatus: "verified" }
  return PRIORITY_EMPLOYMENT_SECTOR_SOURCES[countryCode as PriorityEmploymentSectorCountryCode] ?? null
}

export function isPriorityEmploymentSectorCountry(code: string): boolean {
  return (PRIORITY_EMPLOYMENT_SECTOR_COUNTRIES as readonly string[]).some((c) => c === code.toUpperCase())
}

/** Compact, unit-consistent count label for sector bars (e.g. "383K", "5.1M"). */
export function formatPriorityEmploymentCount(count: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(count)
}