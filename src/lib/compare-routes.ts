export const PROGRAM_COMPARE_COUNTRY = "AU" as const
export const PROGRAM_COMPARE_FIELD = "nursing" as const
export const CITY_COMPARE_COUNTRY = "AU" as const
export const CAREER_COMPARE_COUNTRY = "AU" as const
export const CAREER_COMPARE_PROFILE = "starting-from-scratch" as const
export const COUNTRY_COMPARE_GOAL = "registered-nurse" as const
export const COUNTRY_COMPARE_PROFILE = "starting-from-scratch" as const
export const DEGREE_COMPARE_COUNTRY = "IE" as const

export type CanonicalCompareMode = "programs" | "countries" | "cities" | "careers" | "degrees"

export function compareModePath(_mode: CanonicalCompareMode) {
  return "/compare"
}

export function buildProgramCompareCanonicalHref(items: readonly string[] = []) {
  const params = new URLSearchParams({
    type: "program",
    country: PROGRAM_COMPARE_COUNTRY,
    field: PROGRAM_COMPARE_FIELD,
  })
  if (items.length) params.set("items", items.join(","))
  return `/compare?${params.toString()}`
}

export function buildCityCompareCanonicalHref({
  country = CITY_COMPARE_COUNTRY,
  left = "",
  right = "",
}: {
  country?: string
  left?: string
  right?: string
} = {}) {
  const params = new URLSearchParams({ type: "city", country: country.toUpperCase() })
  if (left) params.set("left", left.toLowerCase())
  if (right) params.set("right", right.toLowerCase())
  return `/compare?${params.toString()}`
}

export function buildCareerCompareCanonicalHref({
  country = CAREER_COMPARE_COUNTRY,
  profile = CAREER_COMPARE_PROFILE,
  city = null,
  careers = [],
}: {
  country?: string
  profile?: string
  city?: string | null
  careers?: readonly string[]
} = {}) {
  const params = new URLSearchParams({
    type: "career",
    country: country.toUpperCase(),
    profile,
  })
  if (city) params.set("city", city)
  if (careers.length) params.set("careers", careers.join(","))
  return `/compare?${params.toString()}`
}

export function buildDegreeCompareCanonicalHref({
  country = DEGREE_COMPARE_COUNTRY,
  degrees = [],
}: {
  country?: string
  degrees?: readonly string[]
} = {}) {
  const params = new URLSearchParams({ type: "degree", country: country.toUpperCase() })
  if (degrees.length) params.set("degrees", degrees.join(","))
  return `/compare?${params.toString()}`
}

export function buildCountryCompareCanonicalHref({
  goal = COUNTRY_COMPARE_GOAL,
  profile = COUNTRY_COMPARE_PROFILE,
  locations = "",
}: {
  goal?: string
  profile?: string
  locations?: string
} = {}) {
  const params = new URLSearchParams({
    type: "country",
    goal,
    profile,
  })
  if (locations) params.set("locations", locations)
  return `/compare?${params.toString()}`
}

export function canonicalCompareModeFromLegacyType(rawType: string | null): CanonicalCompareMode | null {
  if (rawType === null || rawType === "program") return "programs"
  if (rawType === "country") return "countries"
  if (rawType === "city") return "cities"
  if (rawType === "career") return "careers"
  if (rawType === "degree") return "degrees"
  return null
}
