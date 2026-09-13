import { getLaunchCountry } from "@/data/launch-countries"
import type { VisaEntry } from "./visa-catalog"

export const IRELAND_VISA_DIRECTORY_PATH = "/countries/ie/visas"

export function normalizeVisaCountryCode(value: string) {
  const normalized = value.trim().toUpperCase()
  return normalized === "GB" ? "UK" : normalized
}

export function visaSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function visaCanonicalPath(countryCode: string, visaName: string) {
  return `/visas/${normalizeVisaCountryCode(countryCode).toLowerCase()}/${visaSlug(visaName)}`
}

export function irelandVisaCanonicalPath(visaName: string) {
  return `${IRELAND_VISA_DIRECTORY_PATH}/${visaSlug(visaName)}`
}

export function visaPublicCanonicalPath(countryCode: string, visaName: string) {
  return normalizeVisaCountryCode(countryCode) === "IE"
    ? irelandVisaCanonicalPath(visaName)
    : visaCanonicalPath(countryCode, visaName)
}

export function getVisaRoute(
  catalog: readonly VisaEntry[],
  countryCode: string,
  visaSegment: string,
) {
  const normalizedCountry = normalizeVisaCountryCode(countryCode)
  const country = getLaunchCountry(normalizedCountry)
  const slug = visaSlug(visaSegment)
  if (!country || !slug) return null

  const matches = catalog.filter(
    (visa) => visa.countryCode === country.code && visaSlug(visa.name) === slug,
  )
  if (matches.length !== 1) return null

  const visa = matches[0]
  return {
    country,
    visa,
    slug,
    path: visaCanonicalPath(country.code, visa.name),
  }
}

export function getIrelandCountryVisaRoute(catalog: readonly VisaEntry[], visaSegment: string) {
  const route = getVisaRoute(catalog, "IE", visaSegment)
  if (!route) return null

  return { ...route, path: irelandVisaCanonicalPath(route.visa.name) }
}

export function getIndexableVisaRoutes(catalog: readonly VisaEntry[]) {
  const routes: Array<NonNullable<ReturnType<typeof getVisaRoute>>> = []
  const seen = new Set<string>()

  for (const visa of catalog) {
    if (!visa.url.trim()) continue
    const country = getLaunchCountry(visa.countryCode)
    if (!country) continue

    const slug = visaSlug(visa.name)
    if (!slug) continue
    const path = visaPublicCanonicalPath(country.code, visa.name)
    if (seen.has(path)) {
      throw new Error(`Duplicate visa canonical route: ${path}`)
    }
    seen.add(path)
    routes.push({ country, visa, slug, path })
  }

  return routes
}
