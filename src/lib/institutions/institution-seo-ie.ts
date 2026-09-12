import { institutionDetailPath } from "./institution-search"

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
