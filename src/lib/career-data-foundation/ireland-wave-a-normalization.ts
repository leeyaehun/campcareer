import { scoreFoundationComponent } from "./opportunity-score"
import { FOUNDATION_FORMULA_VERSION } from "./types"

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
