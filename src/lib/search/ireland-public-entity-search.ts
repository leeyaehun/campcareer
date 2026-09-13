import {
  PUBLISHED_IE_CITY_NAMES,
  PUBLISHED_IE_CITY_SLUGS,
  ieCityPath,
} from "@/lib/cities/city-routes"
import { CAREER_CATALOGUE } from "@/lib/career-data-foundation/career-catalogue"
import type { IrelandInstitution } from "@/lib/institutions/ireland-institutions.server"
import { institutionDetailPath } from "@/lib/institutions/institution-search"
import { getIndexableCareerRoute } from "@/lib/workspace/occupation-routes"

export type IrelandPublicSearchEntityType = "country" | "career" | "city" | "institution"

export type IrelandPublicSearchEntity = {
  id: string
  type: IrelandPublicSearchEntityType
  name: string
  context: string
  href: string
  careerId?: string
  terms: readonly string[]
}

function normalizeSearchTerm(value: string) {
  return value.trim().toLocaleLowerCase("en-IE").replace(/\s+/g, " ")
}

function uniqueTerms(values: readonly string[]) {
  return [...new Set(values.map(normalizeSearchTerm).filter(Boolean))]
}

function matchRank(entity: IrelandPublicSearchEntity, query: string) {
  const terms = uniqueTerms(entity.terms)
  if (terms.some((term) => term === query)) return 0
  if (terms.some((term) => term.startsWith(query))) return 1
  if (terms.some((term) => term.includes(query))) return 2
  return null
}

function typeRank(type: IrelandPublicSearchEntityType) {
  if (type === "country") return 0
  if (type === "career") return 1
  if (type === "city") return 2
  return 3
}

function irelandCountryEntry(): IrelandPublicSearchEntity {
  return {
    id: "country:ie",
    type: "country",
    name: "Ireland",
    context: "Country · Ireland",
    href: "/countries/ie",
    terms: ["Ireland"],
  }
}

function irelandCareerEntries(): IrelandPublicSearchEntity[] {
  return CAREER_CATALOGUE.flatMap((career) => {
    const route = getIndexableCareerRoute("IE", career.id)
    if (!route) return []

    return [{
      id: `career:ie:${career.id}`,
      type: "career" as const,
      name: career.label,
      context: "Career · Ireland",
      href: route.path,
      careerId: career.id,
      terms: [career.label, career.labelKo, ...career.aliases, ...career.aliasesKo],
    }]
  })
}

function irelandCityEntries(): IrelandPublicSearchEntity[] {
  return PUBLISHED_IE_CITY_SLUGS.map((slug) => ({
    id: `city:ie:${slug}`,
    type: "city" as const,
    name: PUBLISHED_IE_CITY_NAMES[slug],
    context: "City · Ireland",
    href: ieCityPath(slug)!,
    terms: [PUBLISHED_IE_CITY_NAMES[slug]],
  }))
}

function institutionContext(institution: IrelandInstitution) {
  const cities = [...new Set(institution.locations.map((location) => location.city.name))]
  return `Institution · ${cities.join(", ")}, Ireland`
}

export function irelandPublicSearchEntries(
  institutions: readonly IrelandInstitution[],
): IrelandPublicSearchEntity[] {
  return [
    irelandCountryEntry(),
    ...irelandCareerEntries(),
    ...irelandCityEntries(),
    ...institutions.map((institution) => ({
      id: `institution:ie:${institution.slug}`,
      type: "institution" as const,
      name: institution.name,
      context: institutionContext(institution),
      href: institutionDetailPath("IE", institution.slug),
      terms: [institution.name],
    })),
  ]
}

export function filterIrelandPublicSearchEntries(
  query: string,
  institutions: readonly IrelandInstitution[],
): IrelandPublicSearchEntity[] {
  const normalizedQuery = normalizeSearchTerm(query)
  if (normalizedQuery.length < 2) return []

  return irelandPublicSearchEntries(institutions)
    .flatMap((entity) => {
      const rank = matchRank(entity, normalizedQuery)
      return rank == null ? [] : [{ entity, rank }]
    })
    .sort((left, right) => (
      left.rank - right.rank
      || typeRank(left.entity.type) - typeRank(right.entity.type)
      || left.entity.name.localeCompare(right.entity.name, "en-IE")
    ))
    .map(({ entity }) => entity)
    .slice(0, 12)
}
