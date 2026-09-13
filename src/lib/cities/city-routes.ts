export const PUBLISHED_AU_CITY_SLUGS = ["sydney", "melbourne", "brisbane", "perth", "adelaide"] as const
export type PublishedAuCitySlug = (typeof PUBLISHED_AU_CITY_SLUGS)[number]

export const PUBLISHED_US_CITY_SLUGS = [
  "new-york",
  "boston",
  "los-angeles",
  "chicago",
  "seattle",
  "san-diego",
  "philadelphia",
  "tempe",
] as const
export type PublishedUsCitySlug = (typeof PUBLISHED_US_CITY_SLUGS)[number]

export const PUBLISHED_UK_CITY_SLUGS = [
  "london",
  "manchester",
  "birmingham",
  "edinburgh",
  "glasgow",
  "cardiff",
  "belfast",
  "oxford",
  "cambridge",
  "bristol",
] as const
export type PublishedUkCitySlug = (typeof PUBLISHED_UK_CITY_SLUGS)[number]

export const PUBLISHED_IE_CITY_SLUGS = ["dublin", "cork", "galway", "limerick"] as const
export type PublishedIeCitySlug = (typeof PUBLISHED_IE_CITY_SLUGS)[number]

/**
 * Public Ireland City identity is intentionally kept beside its route gate so
 * search and City pages cannot independently widen the published cohort.
 */
export const PUBLISHED_IE_CITY_NAMES: Readonly<Record<PublishedIeCitySlug, string>> = {
  dublin: "Dublin",
  cork: "Cork",
  galway: "Galway",
  limerick: "Limerick",
}

export const PUBLISHED_NZ_CITY_SLUGS = ["auckland", "christchurch", "hamilton", "wellington", "dunedin"] as const
export type PublishedNzCitySlug = (typeof PUBLISHED_NZ_CITY_SLUGS)[number]

export const PUBLISHED_DE_CITY_SLUGS = [
  "berlin",
  "munich",
  "hamburg",
  "aachen",
  "bonn",
  "dresden",
  "heidelberg",
  "karlsruhe",
  "tuebingen",
] as const
export type PublishedDeCitySlug = (typeof PUBLISHED_DE_CITY_SLUGS)[number]

export const PUBLISHED_NL_CITY_SLUGS = ["amsterdam", "maastricht", "rotterdam", "groningen", "eindhoven"] as const
export type PublishedNlCitySlug = (typeof PUBLISHED_NL_CITY_SLUGS)[number]

export const PUBLISHED_FR_CITY_SLUGS = [
  "paris",
  "paris-saclay",
  "bordeaux",
  "strasbourg",
  "grenoble",
  "aix-marseille",
  "nice",
] as const
export type PublishedFrCitySlug = (typeof PUBLISHED_FR_CITY_SLUGS)[number]

export const PUBLISHED_SE_CITY_SLUGS = ["stockholm", "gothenburg", "uppsala", "lund", "linkoping", "umea"] as const
export type PublishedSeCitySlug = (typeof PUBLISHED_SE_CITY_SLUGS)[number]

export const PUBLISHED_DK_CITY_SLUGS = ["copenhagen", "frederiksberg", "odense", "aarhus", "aalborg"] as const
export type PublishedDkCitySlug = (typeof PUBLISHED_DK_CITY_SLUGS)[number]

export const PUBLISHED_BE_CITY_SLUGS = [
  "brussels",
  "ghent",
  "leuven",
  "antwerp",
  "louvain-la-neuve",
  "liege",
] as const
export type PublishedBeCitySlug = (typeof PUBLISHED_BE_CITY_SLUGS)[number]

export const PUBLISHED_FI_CITY_SLUGS = ["helsinki", "espoo", "tampere", "turku", "oulu", "jyvaskyla", "lappeenranta", "joensuu"] as const
export type PublishedFiCitySlug = (typeof PUBLISHED_FI_CITY_SLUGS)[number]
export const SUPPORTED_FI_CITY_SLUGS = PUBLISHED_FI_CITY_SLUGS
export type SupportedFiCitySlug = PublishedFiCitySlug

export const PUBLISHED_NO_CITY_SLUGS = ["oslo", "trondheim", "stavanger", "as", "tromso"] as const
export type PublishedNoCitySlug = (typeof PUBLISHED_NO_CITY_SLUGS)[number]
export const SUPPORTED_NO_CITY_SLUGS = PUBLISHED_NO_CITY_SLUGS
export type SupportedNoCitySlug = PublishedNoCitySlug

export const PUBLISHED_ES_CITY_SLUGS = ["madrid", "barcelona", "valencia", "sevilla", "granada", "malaga", "bilbao"] as const
export type PublishedEsCitySlug = (typeof PUBLISHED_ES_CITY_SLUGS)[number]
export const SUPPORTED_ES_CITY_SLUGS = PUBLISHED_ES_CITY_SLUGS
export type SupportedEsCitySlug = PublishedEsCitySlug

export const PUBLISHED_KR_CITY_SLUGS = ["seoul", "busan", "daejeon", "suwon", "yongin", "pohang"] as const
export type PublishedKrCitySlug = (typeof PUBLISHED_KR_CITY_SLUGS)[number]
export const SUPPORTED_KR_CITY_SLUGS = PUBLISHED_KR_CITY_SLUGS
export type SupportedKrCitySlug = PublishedKrCitySlug

export const PUBLISHED_AE_CITY_SLUGS = ["abu-dhabi", "sharjah", "al-ain", "dubai"] as const
export type PublishedAeCitySlug = (typeof PUBLISHED_AE_CITY_SLUGS)[number]
export const SUPPORTED_AE_CITY_SLUGS = PUBLISHED_AE_CITY_SLUGS
export type SupportedAeCitySlug = PublishedAeCitySlug

const CITY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeCitySlug(value: string | null | undefined) {
  if (!value) return null
  const slug = value.trim().toLowerCase()
  return CITY_SLUG_PATTERN.test(slug) ? slug : null
}

export function isPublishedAuCitySlug(value: string): value is PublishedAuCitySlug {
  return PUBLISHED_AU_CITY_SLUGS.includes(value as PublishedAuCitySlug)
}

export function isPublishedUsCitySlug(value: string): value is PublishedUsCitySlug {
  return PUBLISHED_US_CITY_SLUGS.includes(value as PublishedUsCitySlug)
}

export function isPublishedUkCitySlug(value: string): value is PublishedUkCitySlug {
  return PUBLISHED_UK_CITY_SLUGS.includes(value as PublishedUkCitySlug)
}

export function isPublishedIeCitySlug(value: string): value is PublishedIeCitySlug {
  return PUBLISHED_IE_CITY_SLUGS.includes(value as PublishedIeCitySlug)
}

export function isPublishedNzCitySlug(value: string): value is PublishedNzCitySlug {
  return PUBLISHED_NZ_CITY_SLUGS.includes(value as PublishedNzCitySlug)
}

export function isPublishedDeCitySlug(value: string): value is PublishedDeCitySlug {
  return PUBLISHED_DE_CITY_SLUGS.includes(value as PublishedDeCitySlug)
}

export function isPublishedNlCitySlug(value: string): value is PublishedNlCitySlug {
  return PUBLISHED_NL_CITY_SLUGS.includes(value as PublishedNlCitySlug)
}

export function isPublishedFrCitySlug(value: string): value is PublishedFrCitySlug {
  return PUBLISHED_FR_CITY_SLUGS.includes(value as PublishedFrCitySlug)
}

export function isPublishedSeCitySlug(value: string): value is PublishedSeCitySlug {
  return PUBLISHED_SE_CITY_SLUGS.includes(value as PublishedSeCitySlug)
}

export function isPublishedDkCitySlug(value: string): value is PublishedDkCitySlug {
  return PUBLISHED_DK_CITY_SLUGS.includes(value as PublishedDkCitySlug)
}

export function isPublishedBeCitySlug(value: string): value is PublishedBeCitySlug {
  return PUBLISHED_BE_CITY_SLUGS.includes(value as PublishedBeCitySlug)
}

export function isPublishedFiCitySlug(value: string): value is PublishedFiCitySlug {
  return PUBLISHED_FI_CITY_SLUGS.includes(value as PublishedFiCitySlug)
}

export function isPublishedNoCitySlug(value: string): value is PublishedNoCitySlug {
  return PUBLISHED_NO_CITY_SLUGS.includes(value as PublishedNoCitySlug)
}

export function isPublishedEsCitySlug(value: string): value is PublishedEsCitySlug {
  return PUBLISHED_ES_CITY_SLUGS.includes(value as PublishedEsCitySlug)
}

export function isPublishedKrCitySlug(value: string): value is PublishedKrCitySlug {
  return PUBLISHED_KR_CITY_SLUGS.includes(value as PublishedKrCitySlug)
}

export function isPublishedAeCitySlug(value: string): value is PublishedAeCitySlug {
  return PUBLISHED_AE_CITY_SLUGS.includes(value as PublishedAeCitySlug)
}

export function isSupportedFiCitySlug(value: string): value is SupportedFiCitySlug {
  return isPublishedFiCitySlug(value)
}

export function isSupportedNoCitySlug(value: string): value is SupportedNoCitySlug {
  return isPublishedNoCitySlug(value)
}

export function isSupportedEsCitySlug(value: string): value is SupportedEsCitySlug {
  return isPublishedEsCitySlug(value)
}

export function isSupportedKrCitySlug(value: string): value is SupportedKrCitySlug {
  return isPublishedKrCitySlug(value)
}

export function isSupportedAeCitySlug(value: string): value is SupportedAeCitySlug {
  return isPublishedAeCitySlug(value)
}

export function auCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedAuCitySlug(slug)) return null
  return `/cities/au/${slug}`
}

export function usCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedUsCitySlug(slug)) return null
  return `/cities/us/${slug}`
}

export function ukCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedUkCitySlug(slug)) return null
  return `/cities/uk/${slug}`
}

export function ieCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedIeCitySlug(slug)) return null
  return `/cities/ie/${slug}`
}

export function nzCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedNzCitySlug(slug)) return null
  return `/cities/nz/${slug}`
}

export function deCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedDeCitySlug(slug)) return null
  return `/cities/de/${slug}`
}

export function nlCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedNlCitySlug(slug)) return null
  return `/cities/nl/${slug}`
}

export function frCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedFrCitySlug(slug)) return null
  return `/cities/fr/${slug}`
}

export function seCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedSeCitySlug(slug)) return null
  return `/cities/se/${slug}`
}

export function dkCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedDkCitySlug(slug)) return null
  return `/cities/dk/${slug}`
}

export function beCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedBeCitySlug(slug)) return null
  return `/cities/be/${slug}`
}

export function fiCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedFiCitySlug(slug)) return null
  return `/cities/fi/${slug}`
}

export function noCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedNoCitySlug(slug)) return null
  return `/cities/no/${slug}`
}

export function esCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedEsCitySlug(slug)) return null
  return `/cities/es/${slug}`
}

export function krCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedKrCitySlug(slug)) return null
  return `/cities/kr/${slug}`
}

export function aeCityPath(value: string | null | undefined) {
  const slug = normalizeCitySlug(value)
  if (!slug || !isPublishedAeCitySlug(slug)) return null
  return `/cities/ae/${slug}`
}
