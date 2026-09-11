import "server-only"

import { cache } from "react"
import { supabaseAdmin } from "@/lib/supabase-admin"
import {
  programLevelTypes,
  type ProgramSearchFilters,
} from "@/lib/programs/program-search"

export const PROGRAM_PAGE_SIZE = 20

type CourseRow = {
  id: number
  institution_id: string | null
  course_code: string | null
  cricos_code: string | null
  title: string | null
  field_name: string | null
  broad_field: string | null
  narrow_field: string | null
  aqf_level: number | null
  course_type: string | null
  duration_years: number | string | null
  tuition_fee_aud: number | null
  cricos_url: string | null
  official_course_url: string | null
  official_url_status: string | null
  official_url_checked_at: string | null
  cricos_status: string | null
  cricos_last_seen_at: string | null
  synced_at: string | null
  verified_city_ids: string[] | null
  verified_city_slugs: string[] | null
  verified_delivery_locations: unknown
  location_source_resource: string | null
  location_source_last_modified: string | null
  location_verified_at: string | null
}

type InstitutionRow = {
  institution_id: string | null
  name: string | null
  state: string | null
  city: string | null
  website_url: string | null
  canonical_institution_id: string | null
  institution_slug: string | null
}

type InstitutionIdentityRow = {
  legacy_provider_id: string
  institution_id: string
  institution_slug: string
  institution_name: string
}

export type AuProgramDeliveryLocation = {
  providerCode: string | null
  courseCode: string | null
  locationName: string
  locality: string | null
  state: string | null
  postcode: string | null
  campusId: string | null
  cityId: string | null
  citySlug: string | null
  canonicalCity: string | null
  source: string | null
}

export type AuProgramListItem = {
  id: number
  institutionId: string | null
  canonicalInstitutionId: string | null
  institutionSlug: string | null
  institutionName: string
  institutionWebsite: string | null
  state: string | null
  city: string | null
  courseCode: string | null
  cricosCode: string | null
  title: string
  fieldName: string | null
  broadField: string | null
  narrowField: string | null
  aqfLevel: number | null
  courseType: string | null
  durationYears: number | null
  tuitionFeeAud: number | null
  cricosUrl: string | null
  officialCourseUrl: string | null
  officialUrlStatus: string | null
  officialUrlCheckedAt: string | null
  cricosStatus: string | null
  cricosLastSeenAt: string | null
  syncedAt: string | null
  verifiedCityIds: string[]
  verifiedCitySlugs: string[]
  deliveryLocations: AuProgramDeliveryLocation[]
  locationSourceResource: string | null
  locationSourceLastModified: string | null
  locationVerifiedAt: string | null
}

export type AuProgramSearchResult = {
  programs: AuProgramListItem[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

type ProgramFactRow = {
  field_key: string
  value: unknown
  source_url: string | null
  review_status: string | null
  extracted_at: string | null
}

export type AuProgramFact = {
  fieldKey: string
  value: unknown
  sourceUrl: string | null
  reviewStatus: string | null
  extractedAt: string | null
}

export type AuProgramDetail = AuProgramListItem & {
  facts: AuProgramFact[]
}

function numberOrNull(value: number | string | null) {
  if (value == null) return null
  const number = typeof value === "number" ? value : Number.parseFloat(value)
  return Number.isFinite(number) ? number : null
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null
}

function deliveryLocations(value: unknown): AuProgramDeliveryLocation[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return []
    const row = item as Record<string, unknown>
    const locationName = text(row.locationName)
    if (!locationName) return []

    return [{
      providerCode: text(row.providerCode),
      courseCode: text(row.courseCode),
      locationName,
      locality: text(row.locality),
      state: text(row.state),
      postcode: text(row.postcode),
      campusId: text(row.campusId),
      cityId: text(row.cityId),
      citySlug: text(row.citySlug),
      canonicalCity: text(row.canonicalCity),
      source: text(row.source),
    }]
  })
}

function safeSearchTerm(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
}

function mapProgram(
  course: CourseRow,
  institution: InstitutionRow | null,
): AuProgramListItem {
  return {
    id: course.id,
    institutionId: course.institution_id,
    canonicalInstitutionId: institution?.canonical_institution_id ?? null,
    institutionSlug: institution?.institution_slug ?? null,
    institutionName: institution?.name ?? course.institution_id ?? "Institution unavailable",
    institutionWebsite: institution?.website_url ?? null,
    state: institution?.state ?? null,
    city: institution?.city ?? null,
    courseCode: course.course_code,
    cricosCode: course.cricos_code,
    title: course.title ?? "Untitled program",
    fieldName: course.field_name,
    broadField: course.broad_field,
    narrowField: course.narrow_field,
    aqfLevel: course.aqf_level,
    courseType: course.course_type,
    durationYears: numberOrNull(course.duration_years),
    tuitionFeeAud: course.tuition_fee_aud,
    cricosUrl: course.cricos_url,
    officialCourseUrl: course.official_course_url,
    officialUrlStatus: course.official_url_status,
    officialUrlCheckedAt: course.official_url_checked_at,
    cricosStatus: course.cricos_status,
    cricosLastSeenAt: course.cricos_last_seen_at,
    syncedAt: course.synced_at,
    verifiedCityIds: course.verified_city_ids ?? [],
    verifiedCitySlugs: course.verified_city_slugs ?? [],
    deliveryLocations: deliveryLocations(course.verified_delivery_locations),
    locationSourceResource: course.location_source_resource,
    locationSourceLastModified: course.location_source_last_modified,
    locationVerifiedAt: course.location_verified_at,
  }
}

async function institutionMap(institutionIds: readonly string[]) {
  if (institutionIds.length === 0) return new Map<string, InstitutionRow>()

  const [legacyResult, identityResult] = await Promise.all([
    supabaseAdmin
      .from("colleges_au")
      .select("institution_id, name, state, city, website_url")
      .in("institution_id", [...institutionIds]),
    supabaseAdmin
      .from("au_institution_identity_v1")
      .select("legacy_provider_id, institution_id, institution_slug, institution_name")
      .in("legacy_provider_id", [...institutionIds]),
  ])

  if (legacyResult.error) {
    throw new Error(`Unable to load Australian institutions: ${legacyResult.error.message}`)
  }
  if (identityResult.error) {
    throw new Error(`Unable to resolve canonical Australian institutions: ${identityResult.error.message}`)
  }

  const legacyRows = (legacyResult.data ?? []) as Array<Omit<InstitutionRow, "canonical_institution_id" | "institution_slug">>
  const identityRows = (identityResult.data ?? []) as InstitutionIdentityRow[]
  const legacyById = new Map(
    legacyRows
      .filter((row) => row.institution_id)
      .map((row) => [row.institution_id as string, row]),
  )
  const identityById = new Map(identityRows.map((row) => [row.legacy_provider_id, row]))
  const result = new Map<string, InstitutionRow>()

  for (const legacyProviderId of institutionIds) {
    const legacy = legacyById.get(legacyProviderId)
    const identity = identityById.get(legacyProviderId)
    result.set(legacyProviderId, {
      institution_id: legacyProviderId,
      name: legacy?.name ?? identity?.institution_name ?? legacyProviderId,
      state: legacy?.state ?? null,
      city: legacy?.city ?? null,
      website_url: legacy?.website_url ?? null,
      canonical_institution_id: identity?.institution_id ?? null,
      institution_slug: identity?.institution_slug ?? null,
    })
  }

  return result
}

async function institutionIdsForState(state: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("colleges_au")
    .select("institution_id")
    .eq("state", state)

  if (error) throw new Error(`Unable to filter Australian institutions: ${error.message}`)

  const rows = (data ?? []) as Array<{ institution_id: string | null }>
  return rows
    .map((row) => row.institution_id)
    .filter((value): value is string => Boolean(value))
}

const COURSE_SELECT = [
  "id",
  "institution_id",
  "course_code",
  "cricos_code",
  "title",
  "field_name",
  "broad_field",
  "narrow_field",
  "aqf_level",
  "course_type",
  "duration_years",
  "tuition_fee_aud",
  "cricos_url",
  "official_course_url",
  "official_url_status",
  "official_url_checked_at",
  "cricos_status",
  "cricos_last_seen_at",
  "synced_at",
  "verified_city_ids",
  "verified_city_slugs",
  "verified_delivery_locations",
  "location_source_resource",
  "location_source_last_modified",
  "location_verified_at",
].join(",")

export async function searchAuPrograms(
  filters: ProgramSearchFilters,
): Promise<AuProgramSearchResult> {
  let filteredInstitutionIds: string[] | null = null

  // State remains the legacy institution-state filter. A verified city filter takes precedence
  // because an institution headquartered in another state can operate a registered Sydney campus.
  if (filters.city === "all" && filters.state !== "all") {
    const stateInstitutionIds = await institutionIdsForState(filters.state)
    if (stateInstitutionIds.length === 0) {
      return {
        programs: [],
        total: 0,
        page: filters.page,
        pageSize: PROGRAM_PAGE_SIZE,
        pageCount: 0,
      }
    }
    filteredInstitutionIds = stateInstitutionIds
  }

  let query = supabaseAdmin
    .from("courses_au")
    .select(COURSE_SELECT, { count: "exact" })
    .eq("cricos_status", "active")
    .not("title", "is", null)

  if (filteredInstitutionIds) query = query.in("institution_id", filteredInstitutionIds)
  if (filters.city !== "all") query = query.contains("verified_city_slugs", [filters.city])

  const search = safeSearchTerm(filters.q)
  if (search) {
    const pattern = `%${search.replace(/\s+/g, "%")}%`
    query = query.or(
      `title.ilike.${pattern},field_name.ilike.${pattern},narrow_field.ilike.${pattern}`,
    )
  }

  const levelTypes = programLevelTypes(filters.level)
  if (levelTypes) query = query.in("course_type", [...levelTypes])
  if (filters.field !== "all") query = query.eq("broad_field", filters.field)

  if (filters.duration === "under-1") query = query.lte("duration_years", 1)
  if (filters.duration === "1-2") query = query.gt("duration_years", 1).lte("duration_years", 2)
  if (filters.duration === "2-3") query = query.gt("duration_years", 2).lte("duration_years", 3)
  if (filters.duration === "3-plus") query = query.gt("duration_years", 3)

  if (filters.fee === "under-30000") query = query.lt("tuition_fee_aud", 30000)
  if (filters.fee === "30000-40000") query = query.gte("tuition_fee_aud", 30000).lt("tuition_fee_aud", 40000)
  if (filters.fee === "40000-50000") query = query.gte("tuition_fee_aud", 40000).lt("tuition_fee_aud", 50000)
  if (filters.fee === "50000-plus") query = query.gte("tuition_fee_aud", 50000)

  if (filters.source === "verified") query = query.eq("official_url_status", "verified")

  if (filters.sort === "fee-low") {
    query = query.order("tuition_fee_aud", { ascending: true, nullsFirst: false })
  } else if (filters.sort === "fee-high") {
    query = query.order("tuition_fee_aud", { ascending: false, nullsFirst: false })
  } else if (filters.sort === "duration-short") {
    query = query.order("duration_years", { ascending: true, nullsFirst: false })
  } else if (filters.sort === "title") {
    query = query.order("title", { ascending: true })
  } else {
    query = query
      .order("official_url_status", { ascending: false })
      .order("tuition_fee_aud", { ascending: true, nullsFirst: false })
      .order("title", { ascending: true })
  }

  const from = (filters.page - 1) * PROGRAM_PAGE_SIZE
  const to = from + PROGRAM_PAGE_SIZE - 1
  const { data, error, count } = await query.range(from, to)

  if (error) throw new Error(`Unable to load Australian programs: ${error.message}`)

  const courseRows = (data ?? []) as unknown as CourseRow[]
  const ids = [
    ...new Set(
      courseRows
        .map((course) => course.institution_id)
        .filter((value): value is string => Boolean(value)),
    ),
  ]
  const institutions = await institutionMap(ids)
  const programs = courseRows.map((course) =>
    mapProgram(
      course,
      course.institution_id ? institutions.get(course.institution_id) ?? null : null,
    ),
  )
  const total = count ?? programs.length

  return {
    programs,
    total,
    page: filters.page,
    pageSize: PROGRAM_PAGE_SIZE,
    pageCount: total === 0 ? 0 : Math.ceil(total / PROGRAM_PAGE_SIZE),
  }
}

async function loadAuProgramById(id: number): Promise<AuProgramDetail | null> {
  const { data, error } = await supabaseAdmin
    .from("courses_au")
    .select(COURSE_SELECT)
    .eq("id", id)
    .eq("cricos_status", "active")
    .maybeSingle()

  if (error) throw new Error(`Unable to load Australian program: ${error.message}`)
  if (!data) return null

  const course = data as unknown as CourseRow
  const [institutions, factsResult] = await Promise.all([
    institutionMap(course.institution_id ? [course.institution_id] : []),
    supabaseAdmin
      .from("program_page_facts_au")
      .select("field_key, value, source_url, review_status, extracted_at")
      .eq("course_id", id)
      .eq("review_status", "verified")
      .order("field_key", { ascending: true })
      .order("extracted_at", { ascending: true }),
  ])

  if (factsResult.error) {
    throw new Error(`Unable to load Australian program facts: ${factsResult.error.message}`)
  }
  const factRows = factsResult.data

  const program = mapProgram(
    course,
    course.institution_id ? institutions.get(course.institution_id) ?? null : null,
  )

  return {
    ...program,
    facts: ((factRows ?? []) as ProgramFactRow[]).map((fact) => ({
      fieldKey: fact.field_key,
      value: fact.value,
      sourceUrl: fact.source_url,
      reviewStatus: fact.review_status,
      extractedAt: fact.extracted_at,
    })),
  }
}

export const getAuProgramById = cache(loadAuProgramById)
