import {
  IRELAND_DEGREE_MATCH_MODEL,
  IRELAND_DEGREE_MATCH_MODEL_DEGREE_IDS,
} from "@/lib/degree-match/ireland-model"

/**
 * P3.4 Ireland Degree Compare state contract.
 *
 * Degree Compare uses the existing root Compare surface and the canonical
 * query shape `/compare?type=degree&country=IE&degrees=...`. It selects from
 * the same six-cohort Degrees produced by the P3.2 derived model — no Degree
 * can enter a comparison that is not already a reviewed Ireland Degree. The
 * URL is deterministic and shareable; reloading restores the comparison.
 */

export const IRELAND_DEGREE_COMPARE_COUNTRY = "IE" as const
export const IRELAND_DEGREE_COMPARE_MAX_DEGREES = 2
export const IRELAND_DEGREE_COMPARE_MIN_DEGREES = 2

export const IRELAND_DEGREE_COMPARE_IDS = IRELAND_DEGREE_MATCH_MODEL_DEGREE_IDS

export type IrelandDegreeCompareId = (typeof IRELAND_DEGREE_COMPARE_IDS)[number]

const IRELAND_DEGREE_COMPARE_LABEL_MAP = new Map(
  IRELAND_DEGREE_MATCH_MODEL.map((result) => [result.degreeId, result.degreeLabel] as const),
)

export const IRELAND_DEGREE_COMPARE_LABELS: Readonly<Record<IrelandDegreeCompareId, string>> = Object.fromEntries(
  IRELAND_DEGREE_COMPARE_IDS.map((degreeId) => [
    degreeId,
    IRELAND_DEGREE_COMPARE_LABEL_MAP.get(degreeId) ?? degreeId,
  ]),
) as Record<IrelandDegreeCompareId, string>

const IRELAND_DEGREE_COMPARE_ID_SET = new Set<string>(IRELAND_DEGREE_COMPARE_IDS)

export function isIrelandDegreeCompareId(value: string): value is IrelandDegreeCompareId {
  return IRELAND_DEGREE_COMPARE_ID_SET.has(value)
}

export function normalizeIrelandDegreeIds(raw: string | readonly string[] | null): IrelandDegreeCompareId[] {
  const values = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : []
  const selected: IrelandDegreeCompareId[] = []

  for (const value of values) {
    const id = value.trim().toLowerCase()
    if (!isIrelandDegreeCompareId(id) || selected.includes(id)) continue
    selected.push(id)
    if (selected.length >= IRELAND_DEGREE_COMPARE_MAX_DEGREES) break
  }

  return selected
}

export function parseIrelandDegreeComparisonState(searchParams: Pick<URLSearchParams, "get">) {
  const country = searchParams.get("country")?.trim().toUpperCase() ?? null
  const supported = country === IRELAND_DEGREE_COMPARE_COUNTRY
  const degreeIds = supported ? normalizeIrelandDegreeIds(searchParams.get("degrees")) : []

  return {
    contextState: supported ? "supported" as const : "unsupported" as const,
    countryCode: supported ? IRELAND_DEGREE_COMPARE_COUNTRY : null,
    degreeIds,
  }
}

const IRELAND_DEGREE_COMPARE_ORDER: Record<IrelandDegreeCompareId, number> = Object.fromEntries(
  IRELAND_DEGREE_COMPARE_IDS.map((degreeId, index) => [degreeId, index]),
) as Record<IrelandDegreeCompareId, number>

function sortIrelandDegreeIds(degreeIds: readonly IrelandDegreeCompareId[]): IrelandDegreeCompareId[] {
  return [...degreeIds].sort(
    (left, right) => IRELAND_DEGREE_COMPARE_ORDER[left] - IRELAND_DEGREE_COMPARE_ORDER[right],
  )
}

/**
 * Deterministic, shareable Degree Compare href. Degrees are validated and
 * always sorted to the six-cohort order so one comparison has one URL.
 */
export function buildIrelandDegreeCompareHref(degreeIds: readonly string[] = []) {
  const ids = sortIrelandDegreeIds(normalizeIrelandDegreeIds(degreeIds))
  const params = new URLSearchParams({
    type: "degree",
    country: IRELAND_DEGREE_COMPARE_COUNTRY,
  })
  if (ids.length) params.set("degrees", ids.join(","))
  return `/compare?${params.toString()}`
}

export function replaceIrelandDegreeAtIndex(
  degreeIds: readonly IrelandDegreeCompareId[],
  index: number,
  nextDegreeId: string | null,
) {
  const next = [...degreeIds]
  if (!nextDegreeId) {
    next.splice(index, 1)
    return normalizeIrelandDegreeIds(next)
  }

  if (!isIrelandDegreeCompareId(nextDegreeId)) return normalizeIrelandDegreeIds(next)
  if (next.some((id, currentIndex) => currentIndex !== index && id === nextDegreeId)) {
    return normalizeIrelandDegreeIds(next)
  }

  if (index < next.length) next[index] = nextDegreeId
  else next.push(nextDegreeId)
  return normalizeIrelandDegreeIds(next)
}