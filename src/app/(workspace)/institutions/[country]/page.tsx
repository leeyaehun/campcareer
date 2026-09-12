import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { getLaunchCountry } from "@/data/launch-countries"
import {
  INSTITUTION_MVP_COUNTRIES,
  normalizeInstitutionCountrySegment,
} from "@/lib/institutions/institution-search"
import { InstitutionsExplorer } from "../institutions-explorer"

export const revalidate = 3600

export function generateStaticParams() {
  return INSTITUTION_MVP_COUNTRIES.map((country) => ({ country: country.toLowerCase() }))
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params
  const countryCode = normalizeInstitutionCountrySegment(country)
  if (!countryCode) return { robots: { index: false, follow: true } }

  const launchCountry = getLaunchCountry(countryCode)
  const locationLabel = countryCode === "AU" ? "campuses" : "locations"
  const euFastpath = countryCode === "BE" || countryCode === "CH" || countryCode === "SE" || countryCode === "DK"
  const authorityFastpath = countryCode === "FI" || countryCode === "NO" || countryCode === "JP" || countryCode === "KR" || countryCode === "AE"
  const description = countryCode === "IE"
    ? `Explore the verified Ireland higher-education cohort backed by Higher Education Authority provider and official location evidence. Program publication remains gated pending exact program-level eligibility.`
    : countryCode === "US"
    ? `Explore the CampCareer US launch cohort of 25 research universities with NCES/IPEDS UNITID identity, NCSES selection context and source-backed city-level ${locationLabel}. The US degree-program catalogue is pending.`
    : countryCode === "NL"
      ? `Explore verified institutions in ${launchCountry?.name ?? countryCode} with official BRIN identity and source-backed ${locationLabel}. Program data will be added as the Netherlands catalogue is verified.`
      : countryCode === "NZ"
        ? `Explore verified universities in ${launchCountry?.name ?? countryCode} with NZQA provider identity and source-backed ${locationLabel}. Program data will be added as the New Zealand catalogue is verified.`
        : countryCode === "SG"
          ? `Explore Singapore Autonomous Universities with source-backed UEN identity and official ${locationLabel}. Program data will be added as the Singapore catalogue is verified.`
          : countryCode === "DE"
            ? `Explore Germany Tier A universities with HRK-verified official identity and DFG-verified ${locationLabel}. Program data will be added as the Germany catalogue is verified.`
            : countryCode === "FR"
              ? `Explore France IdEx universities with official UAI identity and source-backed ${locationLabel}. Program data will be added as the France catalogue is verified.`
              : countryCode === "ES"
                ? `Explore Spain Tier A public universities with source-backed official identity, RUCT registry context and verified administrative ${locationLabel}. Program data will be added as the Spain catalogue is verified.`
                : euFastpath || authorityFastpath
                  ? `Explore authority-verified universities in ${launchCountry?.name ?? countryCode} with source-backed city-level ${locationLabel}. Program data will be added as the country catalogue is verified.`
                  : `Explore verified institutions in ${launchCountry?.name ?? countryCode} with connected programs, ${locationLabel} and normalized location data.`

  return {
    title: `${launchCountry?.name ?? countryCode} Institutions`,
    description,
    alternates: { canonical: `/institutions/${countryCode.toLowerCase()}` },
    robots: { index: true, follow: true },
  }
}

export default async function InstitutionCountryPage({ params, searchParams }: {
  params: Promise<{ country: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { country } = await params
  const countryCode = normalizeInstitutionCountrySegment(country)
  if (!countryCode) notFound()
  if (country !== countryCode.toLowerCase()) permanentRedirect(`/institutions/${countryCode.toLowerCase()}`)
  return <InstitutionsExplorer countryCode={countryCode} searchParams={await searchParams} />
}
