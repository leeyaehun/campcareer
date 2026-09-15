import {
  CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS,
  type CareerFutureIntelligenceGeography,
  type CareerFutureIntelligenceEvidenceLevel,
  type CareerFutureIntelligenceRawEvidence,
  type CareerFutureIntelligenceReferencePeriod,
  type CareerFutureIntelligenceSignalKey,
} from "@/lib/career-future-intelligence-contract"
import {
  IRELAND_CAREER_FUTURE_EVIDENCE,
  IRELAND_FUTURE_MAPPINGS,
} from "@/data/ireland-career-future-evidence"
import {
  IE_CAREER_COMPARE_IDS,
  IE_CAREER_COMPARE_LABELS,
  type IrelandCareerCompareId,
} from "@/lib/ireland-career-comparison"

export type CareerFutureDerivedStatus = "available" | "limited" | "unavailable"
export type CareerFutureDerivedDirection = "positive" | "mixed" | "negative" | "neutral" | "unknown"
export type CareerFutureProxyDisclosure = "exact" | "proxy" | "broader_proxy" | "none"

export type CareerFutureDerivedSignal = {
  signal: CareerFutureIntelligenceSignalKey
  status: CareerFutureDerivedStatus
  direction: CareerFutureDerivedDirection
  confidence: CareerFutureIntelligenceEvidenceLevel
  /** A source-native, human-readable value. This is deliberately not a score. */
  displayValue: string | null
  interpretation: string
  evidenceKeys: readonly string[]
  proxyDisclosure: CareerFutureProxyDisclosure
  geography: CareerFutureIntelligenceGeography | null
  referencePeriod: CareerFutureIntelligenceReferencePeriod | null
}

export type IrelandCareerFutureIntelligence = {
  countryCode: "IE"
  careerId: IrelandCareerCompareId
  careerLabel: string
  signals: { [K in CareerFutureIntelligenceSignalKey]: CareerFutureDerivedSignal }
}

const careerIdSet = new Set<string>(IE_CAREER_COMPARE_IDS)

export function isIrelandCareerFutureCareerId(value: string): value is IrelandCareerCompareId {
  return careerIdSet.has(value)
}

function proxyDisclosureFor(evidence: CareerFutureIntelligenceRawEvidence): CareerFutureProxyDisclosure {
  if (evidence.availability === "missing") return "none"
  if (!evidence.source.occupationSpecific) return "broader_proxy"
  if (evidence.occupation?.relation === "exact") return "exact"
  return "proxy"
}

function statusFor(evidence: CareerFutureIntelligenceRawEvidence): CareerFutureDerivedStatus {
  if (evidence.availability === "missing") return "unavailable"
  return evidence.evidenceLevel === "verified" ? "available" : "limited"
}

function baseSignal(evidence: CareerFutureIntelligenceRawEvidence): CareerFutureDerivedSignal {
  return {
    signal: evidence.signal,
    status: statusFor(evidence),
    direction: "unknown",
    confidence: evidence.evidenceLevel,
    displayValue: null,
    interpretation: evidence.missingReason ?? "Evidence is available for this signal.",
    evidenceKeys: [evidence.evidenceKey],
    proxyDisclosure: proxyDisclosureFor(evidence),
    geography: evidence.geography,
    referencePeriod: evidence.referencePeriod,
  }
}

function deriveDemand(evidence: CareerFutureIntelligenceRawEvidence): CareerFutureDerivedSignal {
  const result = baseSignal(evidence)
  if (!evidence.rawValue) return result
  const raw = evidence.rawValue
  const shortage = String(raw.status ?? "").toLowerCase()
  const positive = shortage.includes("shortage") || shortage.includes("difficult")
  return {
    ...result,
    direction: positive ? "positive" : "unknown",
    displayValue: `Shortage assessment: ${String(raw.status ?? "not stated")}`,
    interpretation: "Official labour-market evidence indicates employer need in Ireland for the stated period; this is not a current-vacancy count or a job guarantee.",
  }
}

function deriveGrowth(evidence: CareerFutureIntelligenceRawEvidence): CareerFutureDerivedSignal {
  const result = baseSignal(evidence)
  if (!evidence.rawValue) return result
  const raw = evidence.rawValue
  const growth = typeof raw.annualAverageGrowthPct === "number" ? raw.annualAverageGrowthPct : null
  return {
    ...result,
    direction: growth === null ? "unknown" : growth > 0 ? "positive" : growth < 0 ? "negative" : "neutral",
    displayValue: growth === null ? "Historical change: not stated" : `Historical annual average growth: ${growth}% (2019–2024)`,
    interpretation: "Observed historical employment change in the named interval; it is not labelled or treated as a forward projection.",
  }
}

function deriveOutlookEvidence(evidence: CareerFutureIntelligenceRawEvidence): CareerFutureDerivedSignal {
  const result = baseSignal(evidence)
  if (!evidence.rawValue) return result
  const raw = evidence.rawValue
  const change = typeof raw.netChangeThousandsTo2035 === "number" ? raw.netChangeThousandsTo2035 : null
  return {
    ...result,
    direction: change === null ? "unknown" : change > 0 ? "positive" : change < 0 ? "negative" : "neutral",
    displayValue: change === null ? "Projection change: not stated" : `Projected change: ${change > 0 ? "+" : ""}${change}k through 2035 (${String(raw.projectionGroup ?? "broader group")})`,
    interpretation: "A SOLAS/Cedefop Ireland projection provides broader occupation-group context; it is a proxy input, not a seventh score or universal Career verdict.",
  }
}

function deriveUnavailable(evidence: CareerFutureIntelligenceRawEvidence): CareerFutureDerivedSignal {
  return {
    ...baseSignal(evidence),
    status: "unavailable",
    direction: "unknown",
    confidence: "unavailable",
    displayValue: null,
    interpretation: evidence.missingReason ?? "No defensible evidence is available for this signal.",
  }
}

function directionOf(signals: readonly CareerFutureDerivedSignal[]): CareerFutureDerivedDirection {
  const directions = new Set(signals.map((signal) => signal.direction).filter((direction) => direction !== "unknown" && direction !== "neutral"))
  if (directions.has("positive") && directions.has("negative")) return "mixed"
  if (directions.has("positive")) return "positive"
  if (directions.has("negative")) return "negative"
  return "unknown"
}

function deriveOutlook(
  evidence: CareerFutureIntelligenceRawEvidence,
  demand: CareerFutureDerivedSignal,
  growth: CareerFutureDerivedSignal,
): CareerFutureDerivedSignal {
  const result = deriveOutlookEvidence(evidence)
  const componentDirections = [demand, growth, result]
  const direction = directionOf(componentDirections)
  const componentKeys = [...demand.evidenceKeys, ...growth.evidenceKeys, ...result.evidenceKeys]
  return {
    ...result,
    direction,
    evidenceKeys: [...new Set(componentKeys)],
    interpretation: direction === "mixed"
      ? "Ireland demand, historical growth and projection evidence point in different directions; the outlook is mixed and should not be collapsed into a total score."
      : "The outlook is a transparent synthesis of cited Ireland demand, historical growth and broader-group projection evidence; it is directional, time-bounded and not a guarantee.",
  }
}

function buildCareerModel(careerId: IrelandCareerCompareId): IrelandCareerFutureIntelligence {
  const record = IRELAND_CAREER_FUTURE_EVIDENCE.find((candidate) => candidate.careerId === careerId)
  if (!record) throw new Error(`No Ireland Career Future evidence record for ${careerId}`)
  const evidenceBySignal = new Map(record.rawEvidence.map((evidence) => [evidence.signal, evidence]))
  const demandEvidence = evidenceBySignal.get("demand")!
  const growthEvidence = evidenceBySignal.get("growth")!
  const signals = {
    demand: deriveDemand(demandEvidence),
    growth: deriveGrowth(growthEvidence),
    stability: deriveUnavailable(evidenceBySignal.get("stability")!),
    ai_exposure: deriveUnavailable(evidenceBySignal.get("ai_exposure")!),
    skills_change: deriveUnavailable(evidenceBySignal.get("skills_change")!),
    outlook: deriveOutlook(evidenceBySignal.get("outlook")!, deriveDemand(demandEvidence), deriveGrowth(growthEvidence)),
  }
  return { countryCode: "IE", careerId, careerLabel: IE_CAREER_COMPARE_LABELS[careerId], signals }
}

export const IRELAND_CAREER_FUTURE_INTELLIGENCE: readonly IrelandCareerFutureIntelligence[] = IE_CAREER_COMPARE_IDS.map(buildCareerModel)

export function getIrelandCareerFutureIntelligence(careerId: IrelandCareerCompareId): IrelandCareerFutureIntelligence
export function getIrelandCareerFutureIntelligence(careerId: string): IrelandCareerFutureIntelligence | null
export function getIrelandCareerFutureIntelligence(careerId: string): IrelandCareerFutureIntelligence | null {
  if (!isIrelandCareerFutureCareerId(careerId)) return null
  return IRELAND_CAREER_FUTURE_INTELLIGENCE.find((record) => record.careerId === careerId) ?? null
}

export function getIrelandCareerFutureSignal(
  careerId: string,
  signal: CareerFutureIntelligenceSignalKey,
): CareerFutureDerivedSignal | null {
  return getIrelandCareerFutureIntelligence(careerId)?.signals[signal] ?? null
}

export function classifyCareerFutureDirections(
  signals: readonly CareerFutureDerivedSignal[],
): CareerFutureDerivedDirection {
  return directionOf(signals)
}

export const IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS = IE_CAREER_COMPARE_IDS
export const IRELAND_CAREER_FUTURE_MODEL_SIGNAL_KEYS = CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS

// Keep mappings imported into the domain module so model consumers can inspect
// the same explicit occupation boundaries without re-reading raw evidence.
export { IRELAND_FUTURE_MAPPINGS }
