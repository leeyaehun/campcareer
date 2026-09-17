import { LAUNCH_COUNTRIES } from "@/data/launch-countries"
import { STUDY_CONCEPTS } from "@/data/study-concepts"
import { CAREER_CATALOGUE } from "@/lib/career-data-foundation/career-catalogue"
import type { InstitutionSearchIndexEntry } from "@/lib/search/institution-index.server"

export type QuickSearchEntityType = "country" | "major" | "career" | "institution"

export type QuickSearchResult = {
  id: string
  type: QuickSearchEntityType
  label: string
  labelKo?: string
  href: string
}

export type QuickSearchGroupedResults = {
  query: string
  countries: QuickSearchResult[]
  majors: QuickSearchResult[]
  careers: QuickSearchResult[]
  institutions: QuickSearchResult[]
}

const GROUP_LIMIT = 5

function buildStaticEntries(): QuickSearchResult[] {
  const countries: QuickSearchResult[] = LAUNCH_COUNTRIES.map((country) => ({
    id: country.code,
    type: "country",
    label: country.name,
    href: `/countries/${country.code.toLowerCase()}`,
  }))

  const majors: QuickSearchResult[] = STUDY_CONCEPTS.map((concept) => ({
    id: concept.id,
    type: "major",
    label: concept.label,
    labelKo: concept.labelKo,
    href: `/careers?category=${concept.category}`,
  }))

  const careers: QuickSearchResult[] = CAREER_CATALOGUE.map((career) => ({
    id: career.id,
    type: "career",
    label: career.label,
    labelKo: career.labelKo,
    href: `/careers?q=${encodeURIComponent(career.label)}`,
  }))

  return [...countries, ...majors, ...careers]
}

function matchQuery(label: string | undefined, query: string) {
  return label != null && label.toLowerCase().includes(query)
}

function matches(entry: QuickSearchResult, query: string) {
  return matchQuery(entry.label, query) || matchQuery(entry.labelKo, query)
}

function rankMatches(entries: QuickSearchResult[], query: string) {
  return [...entries]
    .filter((entry) => matches(entry, query))
    .sort((left, right) => {
      const leftPrefix = left.label.toLowerCase().startsWith(query) ? 1 : 0
      const rightPrefix = right.label.toLowerCase().startsWith(query) ? 1 : 0
      if (leftPrefix !== rightPrefix) return rightPrefix - leftPrefix
      return left.label.localeCompare(right.label)
    })
}

export function quickSearch(
  query: string,
  institutionIndex: InstitutionSearchIndexEntry[],
): QuickSearchGroupedResults {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return { query, countries: [], majors: [], careers: [], institutions: [] }
  }

  const staticEntries = buildStaticEntries()

  const countries = rankMatches(
    staticEntries.filter((entry) => entry.type === "country"),
    normalized,
  ).slice(0, GROUP_LIMIT)

  const majors = rankMatches(
    staticEntries.filter((entry) => entry.type === "major"),
    normalized,
  ).slice(0, GROUP_LIMIT)

  const careers = rankMatches(
    staticEntries.filter((entry) => entry.type === "career"),
    normalized,
  ).slice(0, GROUP_LIMIT)

  const institutions: QuickSearchResult[] = matchInstitutions(
    institutionIndex,
    normalized,
  ).slice(0, GROUP_LIMIT)

  return { query, countries, majors, careers, institutions }
}

function matchInstitutions(entries: InstitutionSearchIndexEntry[], query: string) {
  return [...entries]
    .filter((entry) => matchQuery(entry.name, query))
    .sort((left, right) => {
      const leftPrefix = left.name.toLowerCase().startsWith(query) ? 1 : 0
      const rightPrefix = right.name.toLowerCase().startsWith(query) ? 1 : 0
      if (leftPrefix !== rightPrefix) return rightPrefix - leftPrefix
      return left.name.localeCompare(right.name)
    })
    .map((entry) => ({
      id: entry.id,
      type: "institution" as const,
      label: entry.name,
      href: `/institutions/${entry.countryCode.toLowerCase()}/${entry.slug}`,
    }))
}