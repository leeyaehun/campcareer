import { getCareerRoute } from "@/lib/workspace/occupation-routes"

export type OverviewSearchValues = {
  country: string
  occupation: string
}

type SearchParamsLike = Pick<URLSearchParams, "get">

/**
 * Compatibility parser for the canonical Career UI.
 * The retired Home product is gone; this only validates old country/occupation
 * query links before they are redirected into stable Career routes.
 */
export function getOverviewSearchQuery(searchParams: SearchParamsLike): OverviewSearchValues | null {
  const country = (searchParams.get("country") ?? "").toUpperCase()
  const occupation = searchParams.get("occupation") ?? ""
  if (!country || !occupation) return null

  return getCareerRoute(country, occupation) ? { country, occupation } : null
}
