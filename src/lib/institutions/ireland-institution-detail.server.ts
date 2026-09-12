import "server-only"

import { cache } from "react"
import { unstable_cache } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { safeInstitutionLogoUrl } from "@/lib/institutions/institution-logo"
import { getIrelandVerifiedInstitution } from "@/lib/institutions/ireland-institution-contract"
import type { InstitutionDetail } from "@/lib/institutions/institution-detail.server"

type IrelandInstitutionRow = {
  institution_id: string
  institution_slug: string
  institution_name: string
  website_url: string | null
  campus_id: string
  campus_name: string | null
  campus_city: string | null
  region: string | null
  address_line: string | null
  postal_code: string | null
}

async function loadIrelandInstitutionDetail(slug: string): Promise<InstitutionDetail | null> {
  const verified = getIrelandVerifiedInstitution(slug)
  if (!verified) return null

  const { data, error } = await supabaseAdmin
    .from("city_institution_directory_ie_v1")
    .select("institution_id,institution_slug,institution_name,website_url,campus_id,campus_name,campus_city,region,address_line,postal_code")
    .eq("institution_slug", slug)
    .order("campus_name", { ascending: true, nullsFirst: false })

  if (error) throw new Error(`Unable to load Ireland institution detail: ${error.message}`)
  const rows = (data ?? []) as unknown as IrelandInstitutionRow[]
  if (rows.length === 0) return null

  const institution = rows[0]
  const { data: logoData, error: logoError } = await supabaseAdmin
    .from("institution_logo_v1")
    .select("logo_url")
    .eq("institution_id", institution.institution_id)
    .maybeSingle()

  if (logoError) console.error("Unable to load Ireland institution logo", logoError)

  const cities = [...new Set(rows.map((row) => row.campus_city).filter((city): city is string => Boolean(city)))].sort()

  return {
    id: institution.institution_id,
    countryCode: "IE",
    slug: institution.institution_slug,
    name: institution.institution_name,
    institutionKind: verified.kind,
    ownershipType: null,
    websiteUrl: institution.website_url,
    logoUrl: safeInstitutionLogoUrl((logoData as { logo_url?: string | null } | null)?.logo_url ?? null),
    status: "verified_official",
    programCount: 0,
    campusCount: new Set(rows.map((row) => row.campus_id)).size,
    cityCount: cities.length,
    cityNames: cities,
    cricosProviderCode: null,
    cricosSourceUrl: null,
    ukprn: null,
    ukprnSourceUrl: null,
    dliNumber: null,
    dliSourceUrl: null,
    brinCode: null,
    brinSourceUrl: null,
    providerNumber: null,
    providerSourceUrl: null,
    uen: null,
    uenSourceUrl: null,
    officialDomain: null,
    officialDomainSourceUrl: null,
    uai: null,
    uaiSourceUrl: null,
    campuses: rows.map((row) => ({
      id: row.campus_id,
      name: row.campus_name,
      city: row.campus_city,
      citySlug: row.campus_city?.trim().toLowerCase().replace(/\s+/g, "-") ?? null,
      reportedCity: null,
      region: row.region,
      address: row.address_line,
      postalCode: row.postal_code,
      officialUrl: null,
    })),
    studyAreas: [],
    programmeTypes: [],
    programs: [],
  }
}

const getCachedIrelandInstitutionDetail = unstable_cache(
  loadIrelandInstitutionDetail,
  ["ireland-institution-detail-v1"],
  { revalidate: 3600, tags: ["ireland-institution-detail"] },
)

export const getIrelandInstitutionDetail = cache((slug: string) =>
  getCachedIrelandInstitutionDetail(slug),
)
