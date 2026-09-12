import type { CampCareerScore } from "@/lib/campcareer-score"

export const IE_CAREER_COMPARE_COUNTRY = "IE" as const
export const IE_CAREER_COMPARE_PROFILE = "ireland-career-mvp-v1" as const
export const IE_CAREER_COMPARE_MAX_CAREERS = 3
export const IE_CAREER_COMPARE_MIN_CAREERS = 2

export const IE_CAREER_COMPARE_IDS = [
  "software-developer",
  "cybersecurity-analyst",
  "data-engineer",
  "civil-engineer",
  "construction-manager",
  "radiographer",
] as const

export type IrelandCareerCompareId = (typeof IE_CAREER_COMPARE_IDS)[number]

export type IrelandCareerCompareItem = {
  id: IrelandCareerCompareId
  label: string
  officialTitle: string | null
  score: CampCareerScore
  confidence: "verified" | "estimated" | "limited_evidence"
  registrationRequired: boolean | null
  sourceCheckedOn: string | null
  sourceLabels: readonly string[]
}

export const IE_CAREER_COMPARE_LABELS: Readonly<Record<IrelandCareerCompareId, string>> = {
  "software-developer": "Software Developer",
  "cybersecurity-analyst": "Cybersecurity Analyst",
  "data-engineer": "Data Engineer",
  "civil-engineer": "Civil Engineer",
  "construction-manager": "Construction Manager",
  radiographer: "Radiographer",
}

const IE_CAREER_COMPARE_ID_SET = new Set<string>(IE_CAREER_COMPARE_IDS)

export function isIrelandCareerCompareId(value: string): value is IrelandCareerCompareId {
  return IE_CAREER_COMPARE_ID_SET.has(value)
}

export function normalizeIrelandCareerIds(raw: string | readonly string[] | null): IrelandCareerCompareId[] {
  const values = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : []
  const selected: IrelandCareerCompareId[] = []

  for (const value of values) {
    const id = value.trim().toLowerCase()
    if (!isIrelandCareerCompareId(id) || selected.includes(id)) continue
    selected.push(id)
    if (selected.length >= IE_CAREER_COMPARE_MAX_CAREERS) break
  }

  return selected
}

export function parseIrelandCareerComparisonState(searchParams: Pick<URLSearchParams, "get">) {
  const country = searchParams.get("country")?.trim().toUpperCase() ?? null
  const profile = searchParams.get("profile")?.trim() ?? null
  const supported = country === IE_CAREER_COMPARE_COUNTRY
    && profile === IE_CAREER_COMPARE_PROFILE
  const careerIds = supported ? normalizeIrelandCareerIds(searchParams.get("careers")) : []

  return {
    contextState: supported ? "supported" as const : "unsupported" as const,
    countryCode: supported ? IE_CAREER_COMPARE_COUNTRY : null,
    profile: supported ? IE_CAREER_COMPARE_PROFILE : null,
    careerIds,
  }
}

export function buildIrelandCareerCompareHref(careerIds: readonly string[] = []) {
  const ids = normalizeIrelandCareerIds(careerIds)
  const params = new URLSearchParams({
    type: "career",
    country: IE_CAREER_COMPARE_COUNTRY,
    profile: IE_CAREER_COMPARE_PROFILE,
  })
  if (ids.length) params.set("careers", ids.join(","))
  return `/compare?${params.toString()}`
}

export function replaceIrelandCareerAtIndex(
  careerIds: readonly IrelandCareerCompareId[],
  index: number,
  nextCareerId: string | null,
) {
  const next = [...careerIds]
  if (!nextCareerId) {
    next.splice(index, 1)
    return normalizeIrelandCareerIds(next)
  }

  if (!isIrelandCareerCompareId(nextCareerId)) return normalizeIrelandCareerIds(next)
  if (next.some((id, currentIndex) => currentIndex !== index && id === nextCareerId)) {
    return normalizeIrelandCareerIds(next)
  }

  if (index < next.length) next[index] = nextCareerId
  else next.push(nextCareerId)
  return normalizeIrelandCareerIds(next)
}
