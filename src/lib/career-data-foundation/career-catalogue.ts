import {
  CANONICAL_CAREER_BY_ID,
  CANONICAL_CAREERS,
  careersForCategory,
  getCanonicalCareer,
  type CanonicalCareer,
} from "@/data/career-comparison-catalog"

/**
 * Product-facing access to the reviewed global career catalogue. The source
 * remains `career-comparison-catalog` while Phase 2 gives callers a single
 * Career-named boundary.
 */
export type Career = CanonicalCareer

export const CAREER_CATALOGUE: readonly Career[] = CANONICAL_CAREERS
export const CAREER_BY_ID: ReadonlyMap<string, Career> = CANONICAL_CAREER_BY_ID

export function getCareer(careerId: string): Career | null {
  return getCanonicalCareer(careerId)
}

export function careersInCategory(categoryId: Career["categoryId"]): readonly Career[] {
  return careersForCategory(categoryId)
}
