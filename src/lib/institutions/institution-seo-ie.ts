import { institutionDetailPath } from "./institution-search"

// This release allowlist is the audited public cohort from
// city_institution_directory_ie_v1. The server reader still verifies every
// record against the source-backed location contract before rendering it.
export const INDEXABLE_IE_INSTITUTION_ROUTES = [
  ["IE", "dublin-city-university"],
  ["IE", "mary-immaculate-college"],
  ["IE", "rcsi-university-of-medicine-and-health-sciences"],
  ["IE", "technological-university-dublin"],
  ["IE", "trinity-college-dublin"],
  ["IE", "university-college-cork"],
  ["IE", "university-college-dublin"],
  ["IE", "university-of-galway"],
  ["IE", "university-of-limerick"],
] as const

export const INDEXABLE_IE_INSTITUTION_PATHS = INDEXABLE_IE_INSTITUTION_ROUTES.map(
  ([countryCode, slug]) => institutionDetailPath(countryCode, slug),
)

export function isIndexableIrelandInstitutionSlug(slug: string) {
  return INDEXABLE_IE_INSTITUTION_ROUTES.some(([, publishedSlug]) => publishedSlug === slug)
}
