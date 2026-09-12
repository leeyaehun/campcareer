import { LAUNCH_COUNTRIES } from "@/data/launch-countries"
import { getCountryExplorer } from "./country-explorer"
import type { CountrySearchOption } from "@/app/(workspace)/countries/country-search-control"

const POPULAR_CODES = new Set(["AU", "CA", "US"])

/**
 * Static, stable search index for the country selector. Kept out of the
 * initial RSC payload and initial client bundles: the selector loads it via a
 * dynamic import after hydration.
 */
export function loadCountrySearchOptions(): CountrySearchOption[] {
  return LAUNCH_COUNTRIES.map((country) => {
    const explorer = getCountryExplorer(country.code)
    const locationTerms = explorer?.regions.flatMap((region) => [region.name, ...region.cities]) ?? []
    return {
      code: country.code,
      name: country.name,
      currency: country.currency,
      image: country.image,
      searchText: [country.name, country.currency, country.code, ...locationTerms].join(" ").toLowerCase(),
      popular: POPULAR_CODES.has(country.code),
    }
  })
}