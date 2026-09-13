import "server-only"

import { cache } from "react"
import { unstable_cache } from "next/cache"
import { ieCityPath } from "@/lib/cities/city-routes"
import { isIndexableIrelandInstitutionSlug } from "@/lib/institutions/institution-seo-ie"
import { normalizeInstitutionSlugSegment } from "@/lib/institutions/institution-search"
import { supabaseAdmin } from "@/lib/supabase-admin"

type IrelandInstitutionDirectoryRow = {
  city_id: string
  campus_id: string
  institution_id: string
  institution_name: string
  institution_slug: string
  provider_authority: string
  provider_source_url: string
  website_url: string
  campus_name: string
  campus_city: string
  region: string
  address_line: string | null
  postal_code: string | null
  location_source_url: string
  location_quality: string
  record_scope: string
  linkage_basis: string
}

type IrelandCityDirectoryRow = {
  city_id: string
  country_code: string
  slug: string
  name: string
  institution_coverage_status: string
  programme_coverage_status: string
}

export type IrelandInstitutionCity = {
  id: string
  name: string
  slug: string
  path: string
}

export type IrelandInstitutionLocation = {
  id: string
  name: string
  city: IrelandInstitutionCity
  region: string
  addressLine: string | null
  postalCode: string | null
  sourceUrl: string
}

export type IrelandInstitution = {
  id: string
  countryCode: "IE"
  slug: string
  name: string
  websiteUrl: string
  providerAuthority: "Higher Education Authority"
  providerSourceUrl: string
  locations: readonly IrelandInstitutionLocation[]
}

const IE_PROVIDER_AUTHORITY = "Higher Education Authority"
const IE_LOCATION_QUALITY = "verified_official"
const IE_LINKAGE_BASIS = "verified_official_location"
const IE_RECORD_SCOPES = new Set(["verified_campus_location", "verified_institution_location"])

function requiredString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function safeSourceUrl(value: unknown) {
  const string = requiredString(value)
  if (!string) return null
  try {
    const url = new URL(string)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null
  } catch {
    return null
  }
}

function equalText(left: string, right: string) {
  return left.localeCompare(right, undefined, { sensitivity: "accent" }) === 0
}

function verifiedCityById(rows: IrelandCityDirectoryRow[]) {
  const cities = new Map<string, IrelandInstitutionCity>()

  for (const row of rows) {
    const id = requiredString(row.city_id)
    const name = requiredString(row.name)
    const slug = requiredString(row.slug)
    const path = ieCityPath(slug)
    if (
      !id
      || !name
      || !slug
      || !path
      || row.country_code !== "IE"
      || row.institution_coverage_status !== "initial_verified_set"
      || row.programme_coverage_status !== "verification_pending"
    ) continue

    cities.set(id, { id, name, slug, path })
  }

  return cities
}

function verifiedLocation(
  row: IrelandInstitutionDirectoryRow,
  cities: ReadonlyMap<string, IrelandInstitutionCity>,
) {
  const institutionId = requiredString(row.institution_id)
  const institutionName = requiredString(row.institution_name)
  const slug = normalizeInstitutionSlugSegment(row.institution_slug)
  const campusId = requiredString(row.campus_id)
  const campusName = requiredString(row.campus_name)
  const campusCity = requiredString(row.campus_city)
  const region = requiredString(row.region)
  const city = cities.get(row.city_id)
  const websiteUrl = safeSourceUrl(row.website_url)
  const providerSourceUrl = safeSourceUrl(row.provider_source_url)
  const locationSourceUrl = safeSourceUrl(row.location_source_url)

  if (
    !institutionId
    || !institutionName
    || !slug
    || !isIndexableIrelandInstitutionSlug(slug)
    || !campusId
    || !campusName
    || !campusCity
    || !region
    || !city
    || !websiteUrl
    || !providerSourceUrl
    || !locationSourceUrl
    || !equalText(campusCity, city.name)
    || row.provider_authority !== IE_PROVIDER_AUTHORITY
    || row.location_quality !== IE_LOCATION_QUALITY
    || row.linkage_basis !== IE_LINKAGE_BASIS
    || !IE_RECORD_SCOPES.has(row.record_scope)
  ) return null

  return {
    id: institutionId,
    slug,
    name: institutionName,
    websiteUrl,
    providerSourceUrl,
    location: {
      id: campusId,
      name: campusName,
      city,
      region,
      addressLine: requiredString(row.address_line),
      postalCode: requiredString(row.postal_code),
      sourceUrl: locationSourceUrl,
    } satisfies IrelandInstitutionLocation,
  }
}

async function loadIrelandInstitutions(): Promise<readonly IrelandInstitution[]> {
  const [institutionResult, cityResult] = await Promise.all([
    supabaseAdmin
      .from("city_institution_directory_ie_v1")
      .select("city_id,campus_id,institution_id,institution_name,institution_slug,provider_authority,provider_source_url,website_url,campus_name,campus_city,region,address_line,postal_code,location_source_url,location_quality,record_scope,linkage_basis")
      .eq("provider_authority", IE_PROVIDER_AUTHORITY)
      .eq("location_quality", IE_LOCATION_QUALITY)
      .eq("linkage_basis", IE_LINKAGE_BASIS)
      .order("institution_name", { ascending: true })
      .order("campus_name", { ascending: true }),
    supabaseAdmin
      .from("city_directory_ie_v1")
      .select("city_id,country_code,slug,name,institution_coverage_status,programme_coverage_status")
      .eq("country_code", "IE")
      .eq("institution_coverage_status", "initial_verified_set")
      .eq("programme_coverage_status", "verification_pending"),
  ])

  if (institutionResult.error) {
    throw new Error(`Unable to load verified Ireland institutions: ${institutionResult.error.message}`)
  }
  if (cityResult.error) {
    throw new Error(`Unable to load verified Ireland institution cities: ${cityResult.error.message}`)
  }

  const cities = verifiedCityById((cityResult.data ?? []) as IrelandCityDirectoryRow[])
  const institutions = new Map<string, IrelandInstitution>()

  for (const row of (institutionResult.data ?? []) as IrelandInstitutionDirectoryRow[]) {
    const verified = verifiedLocation(row, cities)
    if (!verified) continue

    const existing = institutions.get(verified.id)
    if (existing) {
      if (
        existing.slug !== verified.slug
        || existing.name !== verified.name
        || existing.websiteUrl !== verified.websiteUrl
        || existing.providerSourceUrl !== verified.providerSourceUrl
      ) continue
      if (!existing.locations.some((location) => location.id === verified.location.id)) {
        existing.locations = [...existing.locations, verified.location]
      }
      continue
    }

    institutions.set(verified.id, {
      id: verified.id,
      countryCode: "IE",
      slug: verified.slug,
      name: verified.name,
      websiteUrl: verified.websiteUrl,
      providerAuthority: IE_PROVIDER_AUTHORITY,
      providerSourceUrl: verified.providerSourceUrl,
      locations: [verified.location],
    })
  }

  return [...institutions.values()]
    .map((institution) => ({
      ...institution,
      locations: [...institution.locations].sort((left, right) => left.name.localeCompare(right.name)),
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

const getCachedIrelandInstitutions = unstable_cache(
  loadIrelandInstitutions,
  ["ireland-verified-institutions-v1"],
  { revalidate: 3600, tags: ["ireland-verified-institutions"] },
)

export const getIrelandInstitutions = cache(() => getCachedIrelandInstitutions())

export const getIrelandInstitution = cache(async (slug: string) => {
  const normalizedSlug = normalizeInstitutionSlugSegment(slug)
  if (!normalizedSlug || !isIndexableIrelandInstitutionSlug(normalizedSlug)) return null
  const institutions = await getIrelandInstitutions()
  return institutions.find((institution) => institution.slug === normalizedSlug) ?? null
})
