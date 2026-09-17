import "server-only"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { safeInstitutionLogoUrl } from "@/lib/institutions/institution-logo"
import {
  institutionExplorerViewName,
  type InstitutionMvpCountryCode,
  type InstitutionSearchFilters,
} from "@/lib/institutions/institution-search"

export const INSTITUTION_PAGE_SIZE = 20

type InstitutionExplorerRow = {
  institution_id: string
  country_code: string
  slug: string
  canonical_name: string
  institution_kind: string | null
  ownership_type: string | null
  website_url: string | null
  program_count: number | string | null
  campus_count: number | string | null
  city_count: number | string | null
  city_names: string[] | null
}

type InstitutionLogoRow = {
  institution_id: string
  logo_url: string | null
}

export type InstitutionExplorerItem = {
  id: string
  countryCode: InstitutionMvpCountryCode
  slug: string
  name: string
  institutionKind: string | null
  ownershipType: string | null
  websiteUrl: string | null
  logoUrl: string | null
  programCount: number
  campusCount: number
  cityCount: number
  cityNames: string[]
}

export type InstitutionSearchResult = {
  institutions: InstitutionExplorerItem[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

function safeNumber(value: number | string | null) {
  if (value == null) return 0
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function safeSearchTerm(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\s&.'()-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
}

function mapInstitution(
  row: InstitutionExplorerRow,
  countryCode: InstitutionMvpCountryCode,
  logoUrl: string | null,
): InstitutionExplorerItem {
  return {
    id: row.institution_id,
    countryCode,
    slug: row.slug,
    name: row.canonical_name,
    institutionKind: row.institution_kind,
    ownershipType: row.ownership_type,
    websiteUrl: row.website_url,
    logoUrl,
    programCount: safeNumber(row.program_count),
    campusCount: safeNumber(row.campus_count),
    cityCount: safeNumber(row.city_count),
    cityNames: Array.isArray(row.city_names)
      ? row.city_names.filter((city): city is string => Boolean(city))
      : [],
  }
}

async function loadInstitutionLogos(ids: string[]) {
  const logos = new Map<string, string | null>()
  if (ids.length === 0) return logos

  const { data, error } = await supabaseAdmin
    .from("institution_logo_v1")
    .select("institution_id,logo_url")
    .in("institution_id", ids)

  if (error) {
    console.error("Unable to load institution logos", error)
    return logos
  }

  for (const row of (data ?? []) as unknown as InstitutionLogoRow[]) {
    logos.set(row.institution_id, safeInstitutionLogoUrl(row.logo_url))
  }

  return logos
}

export async function searchInstitutions(
  countryCode: InstitutionMvpCountryCode,
  filters: InstitutionSearchFilters,
): Promise<InstitutionSearchResult> {
  const explorerView = institutionExplorerViewName(countryCode)

  let query = supabaseAdmin
    .from(explorerView)
    .select(
      [
        "institution_id",
        "country_code",
        "slug",
        "canonical_name",
        "institution_kind",
        "ownership_type",
        "website_url",
        "program_count",
        "campus_count",
        "city_count",
        "city_names",
      ].join(","),
      { count: "exact" },
    )
    .eq("country_code", countryCode)

  const search = safeSearchTerm(filters.q)
  if (search) {
    const pattern = `%${search.replace(/\s+/g, "%")}%`
    query = query.ilike("canonical_name", pattern)
  }
  if (filters.city) query = query.contains("city_names", [filters.city])

  if (filters.kind !== "all") {
    query = query.eq("institution_kind", filters.kind)
  }

  query = query
    .order("program_count", { ascending: false })
    .order("canonical_name", { ascending: true })

  const from = (filters.page - 1) * INSTITUTION_PAGE_SIZE
  const to = from + INSTITUTION_PAGE_SIZE - 1
  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw new Error(`Unable to load institution explorer: ${error.message}`)
  }

  const rows = (data ?? []) as unknown as InstitutionExplorerRow[]
  const logos = await loadInstitutionLogos(rows.map((row) => row.institution_id))
  const institutions = rows.map((row) =>
    mapInstitution(row, countryCode, logos.get(row.institution_id) ?? null),
  )
  const total = count ?? institutions.length

  return {
    institutions,
    total,
    page: filters.page,
    pageSize: INSTITUTION_PAGE_SIZE,
    pageCount: total === 0 ? 0 : Math.ceil(total / INSTITUTION_PAGE_SIZE),
  }
}
