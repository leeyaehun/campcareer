export const INSTITUTION_MVP_COUNTRIES = ["AU", "CA", "UK", "NL", "NZ", "SG", "DE", "FR", "ES", "BE", "CH", "SE", "DK", "FI", "NO", "JP", "KR", "AE", "US", "IE"] as const
export type InstitutionMvpCountryCode = (typeof INSTITUTION_MVP_COUNTRIES)[number]

export const INSTITUTION_KIND_VALUES = [
  "all",
  "university",
  "college",
  "polytechnic",
  "tafe_vet",
  "other",
] as const

export type InstitutionKindFilter = (typeof INSTITUTION_KIND_VALUES)[number]

export type InstitutionSearchFilters = {
  q: string
  city: string
  kind: InstitutionKindFilter
  page: number
}

export const INSTITUTION_KIND_OPTIONS: readonly {
  value: InstitutionKindFilter
  label: string
}[] = [
  { value: "all", label: "All verified types" },
  { value: "university", label: "University" },
  { value: "college", label: "College" },
  { value: "polytechnic", label: "Polytechnic" },
  { value: "tafe_vet", label: "TAFE / VET" },
  { value: "other", label: "Other" },
]

const INSTITUTION_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function isInstitutionMvpCountry(
  value: string,
): value is InstitutionMvpCountryCode {
  return INSTITUTION_MVP_COUNTRIES.includes(
    value.toUpperCase() as InstitutionMvpCountryCode,
  )
}

export function normalizeInstitutionCountrySegment(
  value: string,
): InstitutionMvpCountryCode | null {
  const code = value.toUpperCase()
  return isInstitutionMvpCountry(code) ? code : null
}

export function normalizeInstitutionSlugSegment(value: string) {
  const slug = value.trim().toLowerCase()
  return INSTITUTION_SLUG_PATTERN.test(slug) ? slug : null
}

export function institutionCountryPath(countryCode: InstitutionMvpCountryCode) {
  return `/institutions/${countryCode.toLowerCase()}`
}

export function institutionExplorerViewName(countryCode: InstitutionMvpCountryCode) {
  switch (countryCode) {
    case "UK":
      return "institution_explorer_uk_v1"
    case "CA":
      return "institution_explorer_ca_v1"
    case "NL":
      return "institution_explorer_nl_v1"
    case "NZ":
      return "institution_explorer_nz_v1"
    case "SG":
      return "institution_explorer_sg_v1"
    case "DE":
      return "institution_explorer_de_v1"
    case "FR":
      return "institution_explorer_fr_v1"
    case "ES":
      return "institution_explorer_es_v1"
    case "AE":
      return "institution_explorer_ae_v1"
    case "US":
      return "institution_explorer_us_tier_a_v1"
    case "BE":
    case "CH":
    case "SE":
    case "DK":
      return "institution_explorer_eu_fastpath_v1"
    case "FI":
    case "NO":
    case "JP":
    case "KR":
      return "institution_explorer_authority_fastpath_v1"
    default:
      return "institution_explorer_v1"
  }
}

export function institutionDetailPath(
  countryCode: InstitutionMvpCountryCode,
  slug: string,
) {
  const normalizedSlug = normalizeInstitutionSlugSegment(slug)
  if (!normalizedSlug) {
    throw new Error(`Invalid institution slug: ${slug}`)
  }
  return `${institutionCountryPath(countryCode)}/${normalizedSlug}`
}

export function parseInstitutionSearchParams(
  params: Record<string, string | string[] | undefined>,
): InstitutionSearchFilters {
  const q = (firstValue(params.q) ?? "").trim().slice(0, 80)
  const city = (firstValue(params.city) ?? "").trim().replace(/\s+/g, " ").slice(0, 60)
  const rawKind = firstValue(params.kind) ?? "all"
  const kind = INSTITUTION_KIND_VALUES.includes(rawKind as InstitutionKindFilter)
    ? (rawKind as InstitutionKindFilter)
    : "all"
  const rawPage = Number.parseInt(firstValue(params.page) ?? "1", 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  return { q, city, kind, page }
}

export function buildInstitutionExplorerUrl(
  countryCode: InstitutionMvpCountryCode,
  filters: InstitutionSearchFilters,
  updates: Partial<InstitutionSearchFilters> = {},
) {
  const next = { ...filters, ...updates }
  const params = new URLSearchParams()

  if (next.q) params.set("q", next.q)
  if (next.city) params.set("city", next.city)
  if (next.kind !== "all") params.set("kind", next.kind)
  if (next.page > 1) params.set("page", String(next.page))

  const query = params.toString()
  return `${institutionCountryPath(countryCode)}${query ? `?${query}` : ""}`
}
