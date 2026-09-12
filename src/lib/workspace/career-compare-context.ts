import { buildCareerCompareHref } from "@/lib/career-comparison"
import {
  buildIrelandCareerCompareHref,
  isIrelandCareerCompareId,
} from "@/lib/ireland-career-comparison"

const AU_CAREER_COMPARE_ID_BY_CANONICAL_ID: Readonly<Record<string, "registered-nurse" | "software-engineer" | "early-childhood-teacher">> = {
  "registered-nurse": "registered-nurse",
  "software-developer": "software-engineer",
  "early-childhood-teacher": "early-childhood-teacher",
}

export function resolveCareerCompareHref(countryCode: string, canonicalCareerId: string) {
  const country = countryCode.toUpperCase()

  if (country === "IE") {
    return isIrelandCareerCompareId(canonicalCareerId)
      ? buildIrelandCareerCompareHref([canonicalCareerId])
      : null
  }

  if (country !== "AU") return null
  const compareId = AU_CAREER_COMPARE_ID_BY_CANONICAL_ID[canonicalCareerId]
  if (!compareId) return null
  return buildCareerCompareHref(null, [compareId])
}
