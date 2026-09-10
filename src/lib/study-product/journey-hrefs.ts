import type { StudyLocale, TaxonomySearchResult } from "@/lib/study-product/types"
import { resolveDecisionCareer } from "@/lib/comparison/public-contract"

const MAP_DETAIL_HREF = /^\/maps\/[a-z]{2}\/[a-z0-9][a-z0-9-]*(?:\?[^#]*)?$/i
const CANONICAL_WORKSPACE_PATHS = new Set(["/maps", "/compare", "/visas"])

export function localizeStudyJourneyHref(href: string, locale: StudyLocale) {
  if (locale !== "ko-KR" || !href.startsWith("/") || href.startsWith("/ko/")) return href
  const pathname = href.split(/[?#]/, 1)[0]
  if (CANONICAL_WORKSPACE_PATHS.has(pathname)) return href
  return `/ko${href}`
}

/**
 * Sends an occupation result to its verified Maps detail page. Broader study
 * concepts continue through the matching canonical comparison tool.
 */
export function getTaxonomyJourneyHref(
  item: Pick<TaxonomySearchResult, "exploreHref" | "kind" | "slug">,
  locale: StudyLocale = "en",
) {
  if (item.exploreHref && MAP_DETAIL_HREF.test(item.exploreHref)) {
    return localizeStudyJourneyHref(item.exploreHref, locale)
  }

  const query = new URLSearchParams()
  if (item.kind === "TRADE_PATHWAY") {
    const career = resolveDecisionCareer(null, item.slug)
    if (career) {
      query.set("career", career.id)
      return localizeStudyJourneyHref(`/compare?${query.toString()}`, locale)
    }
  }

  query.set("major", item.slug)
  return localizeStudyJourneyHref(`/compare?${query.toString()}`, locale)
}
