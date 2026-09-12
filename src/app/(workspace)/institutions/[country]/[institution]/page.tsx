import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { DatabaseZap } from "lucide-react"
import { SITE_URL } from "@/lib/seo-routes.mjs"
import { institutionDetailPath, normalizeInstitutionCountrySegment, normalizeInstitutionSlugSegment } from "@/lib/institutions/institution-search"
import { INDEXABLE_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo"
import { INDEXABLE_AE_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-ae"
import { INDEXABLE_AUTHORITY_FASTPATH_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-authority-fastpath"
import { INDEXABLE_DE_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-de"
import { INDEXABLE_ES_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-es"
import { INDEXABLE_EU_FASTPATH_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-eu-fastpath"
import { INDEXABLE_FR_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-fr"
import { INDEXABLE_IE_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-ie"
import { INDEXABLE_NL_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-nl"
import { INDEXABLE_NZ_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-nz"
import { INDEXABLE_SG_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-sg"
import { INDEXABLE_UK_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-uk"
import { INDEXABLE_US_INSTITUTION_ROUTES } from "@/lib/institutions/institution-seo-us"
import { getInstitutionDetail, type InstitutionDetail } from "@/lib/institutions/institution-detail.server"
import { getIrelandInstitutionDetail } from "@/lib/institutions/ireland-institution-detail.server"
import { getAeInstitutionDetail, type AeInstitutionDetailResult } from "@/lib/institutions/ae-institution-detail.server"
import { getAuthorityFastpathInstitutionDetail, type AuthorityFastpathCountryCode, type AuthorityFastpathInstitutionDetailResult } from "@/lib/institutions/authority-fastpath-institution-detail.server"
import { getEuFastpathInstitutionDetail, type EuFastpathCountryCode, type EuFastpathInstitutionDetailResult } from "@/lib/institutions/eu-fastpath-institution-detail.server"
import { getSpainInstitutionDetail, type SpainInstitutionDetailResult } from "@/lib/institutions/spain-institution-detail.server"
import { getUsInstitutionDetail, type UsInstitutionDetailResult } from "@/lib/institutions/us-institution-detail.server"
import { AuthorityFastpathInstitutionDetailView } from "../../authority-fastpath-institution-detail"
import { CanadianInstitutionDetailView } from "../../canadian-institution-detail"
import { EuFastpathInstitutionDetailView } from "../../eu-fastpath-institution-detail"
import { FranceInstitutionDetailView } from "../../france-institution-detail"
import { GermanyInstitutionDetailView } from "../../germany-institution-detail"
import { InstitutionDetailView } from "../../institution-detail"
import { NetherlandsInstitutionDetailView } from "../../netherlands-institution-detail"
import { NewZealandInstitutionDetailView } from "../../new-zealand-institution-detail"
import { SingaporeInstitutionDetailView } from "../../singapore-institution-detail"
import { SpainInstitutionDetailView } from "../../spain-institution-detail"
import { UsInstitutionDetailView } from "../../us-institution-detail"

export const revalidate = 3600

export function generateStaticParams() {
  return INDEXABLE_INSTITUTION_ROUTES
    .filter(([countryCode]) => countryCode === "AU")
    .map(([countryCode, slug]) => ({
      country: countryCode.toLowerCase(),
      institution: slug,
    }))
}

type InstitutionDetailPageProps = { params: Promise<{ country: string; institution: string }> }
function isEuFastpathCountry(countryCode: string): countryCode is EuFastpathCountryCode { return countryCode === "BE" || countryCode === "CH" || countryCode === "SE" || countryCode === "DK" }
function isAuthorityFastpathCountry(countryCode: string): countryCode is AuthorityFastpathCountryCode { return countryCode === "FI" || countryCode === "NO" || countryCode === "JP" || countryCode === "KR" }
function isIndexableInstitutionRoute(countryCode: string, slug: string) {
  return INDEXABLE_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_UK_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_NL_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_NZ_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_SG_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_DE_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_FR_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_IE_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_ES_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_EU_FASTPATH_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_AUTHORITY_FASTPATH_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_AE_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
    || INDEXABLE_US_INSTITUTION_ROUTES.some(([c,s]) => c===countryCode && s===slug)
}

export async function generateMetadata({ params }: InstitutionDetailPageProps): Promise<Metadata> {
  const { country, institution } = await params
  const countryCode = normalizeInstitutionCountrySegment(country)
  const slug = normalizeInstitutionSlugSegment(institution)
  if (!countryCode || !slug) return { title: "Institution not found", robots: { index: false, follow: true } }
  try {
    const detail = countryCode === "IE" ? await getIrelandInstitutionDetail(slug)
      : countryCode === "ES" ? (await getSpainInstitutionDetail(slug))?.institution ?? null
      : countryCode === "AE" ? (await getAeInstitutionDetail(slug))?.institution ?? null
      : countryCode === "US" ? (await getUsInstitutionDetail(slug))?.institution ?? null
      : isEuFastpathCountry(countryCode) ? (await getEuFastpathInstitutionDetail(countryCode, slug))?.institution ?? null
      : isAuthorityFastpathCountry(countryCode) ? (await getAuthorityFastpathInstitutionDetail(countryCode, slug))?.institution ?? null
      : await getInstitutionDetail(countryCode, slug)
    if (!detail) return { title: "Institution not found", robots: { index: false, follow: true } }
    const canonicalPath = institutionDetailPath(countryCode, detail.slug)
    const locationLabel = countryCode === "AU" ? "campuses" : "locations"
    const description = countryCode === "IE"
      ? `Explore ${detail.name} verified Higher Education Authority identity and official Ireland location evidence on CampCareer. Ireland program publication remains gated pending exact program-level eligibility.`
      : countryCode === "US"
      ? `Explore ${detail.name} verified NCES/IPEDS UNITID identity, NCSES launch-cohort context and city-level ${locationLabel} on CampCareer. The US degree-program catalogue is pending.`
      : countryCode === "NL" ? `Explore ${detail.name} official institution identity, BRIN registration and source-backed ${locationLabel} on CampCareer. Program data will be added as the Netherlands catalogue is verified.`
      : countryCode === "NZ" ? `Explore ${detail.name} NZQA provider identity and source-backed ${locationLabel} on CampCareer. Program data will be added as the New Zealand catalogue is verified.`
      : countryCode === "SG" ? `Explore ${detail.name} UEN identity and source-backed ${locationLabel} on CampCareer. Program data will be added as the Singapore catalogue is verified.`
      : countryCode === "DE" ? `Explore ${detail.name} HRK-verified official identity and DFG-verified ${locationLabel} on CampCareer. Program data will be added as the Germany catalogue is verified.`
      : countryCode === "FR" ? `Explore ${detail.name} official UAI identity and source-backed ${locationLabel} on CampCareer. Program data will be added as the France catalogue is verified.`
      : countryCode === "ES" ? `Explore ${detail.name} source-backed official identity, RUCT registry context and verified administrative ${locationLabel} on CampCareer. Program data will be added as the Spain catalogue is verified.`
      : countryCode === "AE" ? `Explore ${detail.name} current CAA institution identity and verified city-level ${locationLabel} on CampCareer. Program data will be added as the UAE catalogue is verified.`
      : isEuFastpathCountry(countryCode) || isAuthorityFastpathCountry(countryCode) ? `Explore ${detail.name} authority-backed institution identity and verified city-level ${locationLabel} on CampCareer. Program data will be added as the country catalogue is verified.`
      : `Explore ${detail.name} programs, ${locationLabel} and source-backed institution details on CampCareer.`
    return { title: `${detail.name} | Institutions`, description, alternates: { canonical: `${SITE_URL}${canonicalPath}` }, robots: { index: isIndexableInstitutionRoute(countryCode, detail.slug), follow: true } }
  } catch { return { title: "Institution | CampCareer", robots: { index: false, follow: true } } }
}

export default async function InstitutionDetailPage({ params }: InstitutionDetailPageProps) {
  const { country, institution } = await params
  const countryCode = normalizeInstitutionCountrySegment(country)
  const slug = normalizeInstitutionSlugSegment(institution)
  if (!countryCode || !slug) notFound()
  const canonicalPath = institutionDetailPath(countryCode, slug)
  if (country !== countryCode.toLowerCase() || institution !== slug) permanentRedirect(canonicalPath)

  if (countryCode === "IE") {
    let detail: InstitutionDetail | null = null
    try { detail = await getIrelandInstitutionDetail(slug) } catch (error) { console.error("Unable to load Ireland institution detail page", error); return <InstitutionUnavailable /> }
    if (!detail) notFound()
    return <InstitutionDetailView institution={detail} />
  }
  if (countryCode === "ES") {
    let result: SpainInstitutionDetailResult | null = null
    try { result = await getSpainInstitutionDetail(slug) } catch (error) { console.error("Unable to load Spain institution detail page", error); return <InstitutionUnavailable /> }
    if (!result) notFound(); return <SpainInstitutionDetailView institution={result.institution} identity={result.identity} />
  }
  if (countryCode === "AE") {
    let result: AeInstitutionDetailResult | null = null
    try { result = await getAeInstitutionDetail(slug) } catch (error) { console.error("Unable to load UAE institution detail page", error); return <InstitutionUnavailable /> }
    if (!result) notFound(); return <AuthorityFastpathInstitutionDetailView result={result} />
  }
  if (countryCode === "US") {
    let result: UsInstitutionDetailResult | null = null
    try { result = await getUsInstitutionDetail(slug) } catch (error) { console.error("Unable to load US institution detail page", error); return <InstitutionUnavailable /> }
    if (!result) notFound(); return <UsInstitutionDetailView result={result} />
  }
  if (isEuFastpathCountry(countryCode)) {
    let result: EuFastpathInstitutionDetailResult | null = null
    try { result = await getEuFastpathInstitutionDetail(countryCode, slug) } catch (error) { console.error(`Unable to load ${countryCode} institution detail page`, error); return <InstitutionUnavailable /> }
    if (!result) notFound(); return <EuFastpathInstitutionDetailView result={result} />
  }
  if (isAuthorityFastpathCountry(countryCode)) {
    let result: AuthorityFastpathInstitutionDetailResult | null = null
    try { result = await getAuthorityFastpathInstitutionDetail(countryCode, slug) } catch (error) { console.error(`Unable to load ${countryCode} institution detail page`, error); return <InstitutionUnavailable /> }
    if (!result) notFound(); return <AuthorityFastpathInstitutionDetailView result={result} />
  }
  let detail: InstitutionDetail | null = null
  try { detail = await getInstitutionDetail(countryCode, slug) } catch (error) { console.error("Unable to load institution detail page", error); return <InstitutionUnavailable /> }
  if (!detail) notFound()
  if (countryCode === "CA") return <CanadianInstitutionDetailView institution={detail} />
  if (countryCode === "NL") return <NetherlandsInstitutionDetailView institution={detail} />
  if (countryCode === "NZ") return <NewZealandInstitutionDetailView institution={detail} />
  if (countryCode === "SG") return <SingaporeInstitutionDetailView institution={detail} />
  if (countryCode === "DE") return <GermanyInstitutionDetailView institution={detail} />
  if (countryCode === "FR") return <FranceInstitutionDetailView institution={detail} />
  return <InstitutionDetailView institution={detail} />
}

function InstitutionUnavailable() {
  return <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[#f0d8d2] bg-[#fff9f7] p-10 text-center"><DatabaseZap className="size-7 text-[#b65c45]" /><h1 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Institution data is temporarily unavailable</h1><p className="mt-2 max-w-lg text-[12px] leading-5 text-[#786b66]">Please try again shortly. No cached or substitute institution profile has been shown.</p></div>
}
