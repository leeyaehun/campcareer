import { LAUNCH_COUNTRIES, type LaunchCountry, type LaunchCountryCode } from "@/data/launch-countries"
import { AUSTRALIA_OCCUPATION_COUNTRY_PROFILE } from "@/data/australia-occupation-country-profile"
import { IRELAND_OCCUPATION_COUNTRY_PROFILE } from "@/data/ireland-occupation-country-profile"
import { UNITED_KINGDOM_OCCUPATION_COUNTRY_PROFILE } from "@/data/united-kingdom-occupation-country-profile"
import { UNITED_STATES_OCCUPATION_COUNTRY_PROFILE } from "@/data/united-states-occupation-country-profile"
import { CANADA_OCCUPATION_COUNTRY_PROFILE } from "@/data/canada-occupation-country-profile"
import { GERMANY_OCCUPATION_COUNTRY_PROFILE } from "@/data/germany-occupation-country-profile"
import { NETHERLANDS_OCCUPATION_COUNTRY_PROFILE } from "@/data/netherlands-occupation-country-profile"
import { BELGIUM_OCCUPATION_COUNTRY_PROFILE } from "@/data/belgium-occupation-country-profile"
import { FRANCE_OCCUPATION_COUNTRY_PROFILE } from "@/data/france-occupation-country-profile"
import { getBatch2CountryContent } from "@/data/batch-2-country-content"
import { BATCH_3_COUNTRY_CONTENT } from "@/data/batch-3-country-content"
import { getPriorityEmploymentSectorsSorted } from "@/data/country-employment-sectors"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"
import { formatMoneyRange, type CountryMetrics } from "@/lib/workspace/country-metric-contract"

export type IndustrySectorBar = { label: string; value: number }

export type CountryDiscoverySummary = {
  country: LaunchCountry
  strongMajorLabels: readonly string[]
  institutionCount: number
  topInstitutions: readonly string[]
  workOpportunityHeadline: string
  salaryFormatted: string
  minimumWageFormatted: string | null
  industrySectors: readonly IndustrySectorBar[] | null
}

const OCCUPATION_PROFILES: Partial<Record<LaunchCountryCode, { introduction: string; strongMajors: readonly { id: string; label: string; reason: string }[]; majorInstitutions: readonly { name: string; type: string; location: string }[] }>> = {
  AU: AUSTRALIA_OCCUPATION_COUNTRY_PROFILE,
  IE: IRELAND_OCCUPATION_COUNTRY_PROFILE,
  UK: UNITED_KINGDOM_OCCUPATION_COUNTRY_PROFILE,
  US: UNITED_STATES_OCCUPATION_COUNTRY_PROFILE,
  CA: CANADA_OCCUPATION_COUNTRY_PROFILE,
  DE: GERMANY_OCCUPATION_COUNTRY_PROFILE,
  NL: NETHERLANDS_OCCUPATION_COUNTRY_PROFILE,
  BE: BELGIUM_OCCUPATION_COUNTRY_PROFILE,
  FR: FRANCE_OCCUPATION_COUNTRY_PROFILE,
}

function getEditorialContent(code: LaunchCountryCode) {
  const profile = OCCUPATION_PROFILES[code]
  if (profile) {
    return {
      introduction: profile.introduction,
      strongMajors: profile.strongMajors,
      majorInstitutions: profile.majorInstitutions,
    }
  }

  const batch2 = getBatch2CountryContent(code)
  if (batch2) {
    return {
      introduction: batch2.introduction,
      strongMajors: batch2.strongMajors,
      majorInstitutions: batch2.majorInstitutions,
    }
  }

  const batch3 = BATCH_3_COUNTRY_CONTENT[code as keyof typeof BATCH_3_COUNTRY_CONTENT]
  if (batch3) {
    return {
      introduction: batch3.introduction,
      strongMajors: batch3.strongMajors,
      majorInstitutions: batch3.majorInstitutions,
    }
  }

  return null
}

function getWorkOpportunities(code: LaunchCountryCode) {
  const profile = OCCUPATION_PROFILES[code]
  if (profile && "workOpportunities" in profile) {
    const wo = (profile as { workOpportunities?: { headline: string } }).workOpportunities
    if (wo) return wo.headline
  }

  const batch2 = getBatch2CountryContent(code)
  if (batch2) return batch2.workOpportunities.headline

  const batch3 = BATCH_3_COUNTRY_CONTENT[code as keyof typeof BATCH_3_COUNTRY_CONTENT]
  if (batch3) return batch3.workOpportunities.headline

  return ""
}

function formatMinimumWage(metrics: CountryMetrics): string | null {
  const mw = metrics.minimumHourlyWage
  if (!mw) return null
  return `${mw.currency} ${mw.amount.toFixed(mw.amount < 10 ? 2 : 0)} / hour`
}

export async function loadCountryDiscoveryData(): Promise<readonly CountryDiscoverySummary[]> {
  const metricsResults = await Promise.all(
    LAUNCH_COUNTRIES.map(async (country) => {
      try {
        return await getCountryMetrics(country.code)
      } catch {
        return null
      }
    }),
  )

  return LAUNCH_COUNTRIES.map((country, index) => {
    const editorial = getEditorialContent(country.code)
    const metrics = metricsResults[index]

    const strongMajorLabels = editorial?.strongMajors.map((m) => m.label) ?? []
    const institutions = editorial?.majorInstitutions ?? []
    const topInstitutions = institutions.slice(0, 2).map((inst) => inst.name)
    const workOpportunityHeadline = getWorkOpportunities(country.code)
    const salaryFormatted = formatMoneyRange(metrics?.salaryRange)
    const minimumWageFormatted = metrics ? formatMinimumWage(metrics) : null
    const industrySectors = getPriorityEmploymentSectorsSorted(country.code)

    return {
      country,
      strongMajorLabels,
      institutionCount: institutions.length,
      topInstitutions,
      workOpportunityHeadline,
      salaryFormatted,
      minimumWageFormatted,
      industrySectors,
    }
  })
}
