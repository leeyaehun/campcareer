import { campCareerScoreFromFoundationComponents } from "../campcareer-score"
import { scoreFoundationComponent } from "./opportunity-score"
import { FOUNDATION_COMPONENT_MAXIMA, FOUNDATION_FORMULA_VERSION, type FoundationComponentKey } from "./types"

const round = (value: number, digits = 4) => {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function annualizedGrowthPct({
  start,
  end,
  years,
}: {
  start: number
  end: number
  years: number
}) {
  if (!(start > 0) || !(end >= 0) || !(years > 0)) return null
  return round(((end / start) ** (1 / years) - 1) * 100)
}

export function normalizeEmploymentMomentum({
  occupationAnnualGrowthPct,
  nationalAnnualGrowthPct,
}: {
  occupationAnnualGrowthPct: number
  nationalAnnualGrowthPct: number
}) {
  const excessPp = round(occupationAnnualGrowthPct - nationalAnnualGrowthPct)
  const scoreValue = scoreFoundationComponent({
    componentKey: "employment_momentum",
    normalizedValue: excessPp,
    availability: "available",
    directness: "proxy",
    evidenceStatus: "derived",
    proxyReason: "Directness is supplied by the caller's evidence record.",
    formulaVersion: FOUNDATION_FORMULA_VERSION,
  })
  return { excessPp, scoreValue }
}

export function normalizeProjectedGrowth({
  startEmployment,
  netChange,
  years,
  nationalAnnualGrowthPct,
}: {
  startEmployment: number
  netChange: number
  years: number
  nationalAnnualGrowthPct: number
}) {
  const endEmployment = startEmployment + netChange
  const annualGrowthPct = annualizedGrowthPct({ start: startEmployment, end: endEmployment, years })
  if (annualGrowthPct == null) return null

  const excessPp = round(annualGrowthPct - nationalAnnualGrowthPct)
  const scoreValue = scoreFoundationComponent({
    componentKey: "projected_growth",
    normalizedValue: excessPp,
    availability: "available",
    directness: "proxy",
    evidenceStatus: "derived",
    proxyReason: "Projection scope and proxy reason are supplied by the caller's evidence record.",
    formulaVersion: FOUNDATION_FORMULA_VERSION,
  })

  return {
    endEmployment,
    annualGrowthPct,
    excessPp,
    scoreValue,
  }
}


export function conservativeIndustryDiversityFromPublishedShares(
  publishedSharesPct: number[],
) {
  if (!publishedSharesPct.length || publishedSharesPct.some((share) => share < 0 || share > 100)) return null
  const publishedTotal = publishedSharesPct.reduce((sum, share) => sum + share, 0)
  if (publishedTotal > 100) return null

  // Treat all unpublished residual employment as one "other" bucket. This is a
  // conservative HHI upper bound: splitting that residual across real sectors
  // can only lower HHI and therefore maintain or improve the diversity score.
  if (publishedTotal < 80) return null

  const residual = 100 - publishedTotal
  const shares = residual > 0 ? [...publishedSharesPct, residual] : [...publishedSharesPct]
  const hhi = round(shares.reduce((sum, share) => sum + (share / 100) ** 2, 0))
  const topIndustrySharePct = Math.max(...shares)

  let score = 5
  if (topIndustrySharePct >= 75 || hhi >= 0.6) score = 0
  else if (hhi >= 0.45) score = 1
  else if (hhi >= 0.3) score = 2
  else if (hhi >= 0.2) score = 3
  else if (hhi >= 0.12) score = 4

  return {
    publishedCoveragePct: publishedTotal,
    residualOtherPct: residual,
    hhiUpperBound: hhi,
    topIndustrySharePct,
    scoreValue: score,
  }
}


const IRELAND_PUBLIC_SCORE_COMPONENTS: readonly FoundationComponentKey[] = [
  "shortage_signal",
  "vacancy_intensity",
  "industry_diversity",
  "employment_momentum",
  "projected_growth",
  "relative_salary",
  "entry_accessibility",
  "entry_burden",
] as const

export type IrelandStagedComponent = {
  status: string
  scoreValue?: number | null
  maxScore?: number | null
}

export function stagedIrelandCampCareerScore(
  components: Record<string, IrelandStagedComponent>,
) {
  const inputs = []
  for (const componentKey of IRELAND_PUBLIC_SCORE_COMPONENTS) {
    const component = components[componentKey]
    if (
      !component
      || component.status !== "normalized"
      || component.scoreValue == null
      || !Number.isFinite(component.scoreValue)
    ) return null

    inputs.push({
      componentKey,
      scoreValue: component.scoreValue,
      maxScore: component.maxScore ?? FOUNDATION_COMPONENT_MAXIMA[componentKey],
      availability: "available" as const,
    })
  }

  return campCareerScoreFromFoundationComponents(inputs)
}
