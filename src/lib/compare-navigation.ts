import {
  buildCareerCompareCanonicalHref,
  buildCityCompareCanonicalHref,
  buildCountryCompareCanonicalHref,
  buildDegreeCompareCanonicalHref,
  buildProgramCompareCanonicalHref,
} from "@/lib/compare-routes"

export const COMPARE_MODE_NAV_ITEMS = [
  {
    type: "program",
    label: "Programs",
    href: buildProgramCompareCanonicalHref(),
  },
  {
    type: "country",
    label: "Countries",
    href: buildCountryCompareCanonicalHref(),
  },
  {
    type: "city",
    label: "Cities",
    href: buildCityCompareCanonicalHref(),
  },
  {
    type: "career",
    label: "Careers",
    href: buildCareerCompareCanonicalHref(),
  },
  {
    type: "degree",
    label: "Degrees",
    href: buildDegreeCompareCanonicalHref(),
  },
] as const

export type CompareModeType = (typeof COMPARE_MODE_NAV_ITEMS)[number]["type"]
export type ResolvedCompareModeType = CompareModeType | "unsupported"

export function resolveCompareModeType(rawType: string | null): ResolvedCompareModeType {
  if (rawType === null || rawType === "program") return "program"
  if (rawType === "country") return "country"
  if (rawType === "city") return "city"
  if (rawType === "career") return "career"
  if (rawType === "degree") return "degree"
  return "unsupported"
}
