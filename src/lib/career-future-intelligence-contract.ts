/**
 * P2.0 contract for future-looking Career intelligence.
 *
 * This module deliberately models evidence, not scores. It is safe to add to
 * the read model before any collection or publication work starts.
 */

export const CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS = [
  "demand",
  "growth",
  "stability",
  "ai_exposure",
  "skills_change",
  "outlook",
] as const

export type CareerFutureIntelligenceSignalKey = (typeof CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS)[number]

export type CareerFutureIntelligenceAvailability = "available" | "missing"

/** Confidence describes evidence quality, never a numeric signal value. */
export type CareerFutureIntelligenceEvidenceLevel =
  | "verified"
  | "estimated"
  | "limited_evidence"
  | "unavailable"

export const CAREER_FUTURE_INTELLIGENCE_EVIDENCE_LEVELS = [
  "verified",
  "estimated",
  "limited_evidence",
  "unavailable",
] as const satisfies readonly CareerFutureIntelligenceEvidenceLevel[]

export type CareerFutureIntelligenceSourceTier =
  | "official_occupation"
  | "official_labour_market"
  | "official_task_or_skill_dataset"
  | "official_sector_proxy"
  | "peer_reviewed_research"
  | "validated_market_dataset"
  | "editorial_or_ai_summary"

export const CAREER_FUTURE_INTELLIGENCE_SOURCE_TIERS = [
  "official_occupation",
  "official_labour_market",
  "official_task_or_skill_dataset",
  "official_sector_proxy",
  "peer_reviewed_research",
  "validated_market_dataset",
  "editorial_or_ai_summary",
] as const satisfies readonly CareerFutureIntelligenceSourceTier[]

export type CareerFutureIntelligenceGeography = {
  scope: "country" | "subnational" | "global" | "multi_country"
  countryCode: string | null
  regionCode: string | null
  label: string
}

export type CareerFutureIntelligenceOccupation = {
  taxonomy: string
  taxonomyVersion: string
  code: string
  title: string
  relation: "exact" | "broader" | "narrower" | "composite" | "proxy"
  mappingQuality: "high" | "medium" | "low"
}

export type CareerFutureIntelligenceReferencePeriod = {
  /** The period represented by the source observation, not the retrieval date. */
  start: string
  end: string
  label: string
  /** Optional forward horizon, for example 2025-2030. */
  horizonYears: number | null
}

export type CareerFutureIntelligenceSource = {
  sourceKey: string
  publisher: string
  title: string
  url: string
  tier: CareerFutureIntelligenceSourceTier
  /** A source can be official without being occupation-specific. */
  occupationSpecific: boolean
}

export type CareerFutureIntelligenceRawValue = Record<string, unknown> | null

/**
 * Raw evidence remains independently addressable and is never a display score.
 * A missing observation must carry null rawValue and an explicit reason.
 */
export type CareerFutureIntelligenceRawEvidence = {
  evidenceKey: string
  signal: CareerFutureIntelligenceSignalKey
  source: CareerFutureIntelligenceSource
  rawValue: CareerFutureIntelligenceRawValue
  unit: string | null
  geography: CareerFutureIntelligenceGeography
  occupation: CareerFutureIntelligenceOccupation | null
  referencePeriod: CareerFutureIntelligenceReferencePeriod
  checkedDate: string
  evidenceLevel: CareerFutureIntelligenceEvidenceLevel
  availability: CareerFutureIntelligenceAvailability
  missingReason: string | null
  notes: string | null
}

export type CareerFutureIntelligenceSignalRecord = {
  signal: CareerFutureIntelligenceSignalKey
  availability: CareerFutureIntelligenceAvailability
  evidenceKeys: readonly string[]
  /** Human interpretation is bounded copy, not a computed or AI-generated score. */
  interpretation: string | null
  evidenceLevel: CareerFutureIntelligenceEvidenceLevel
}

export type CareerFutureIntelligenceRecord = {
  countryCode: string
  careerId: string
  /** Durable identity remains country_code + career_id. */
  signals: { [K in CareerFutureIntelligenceSignalKey]: CareerFutureIntelligenceSignalRecord }
  rawEvidence: readonly CareerFutureIntelligenceRawEvidence[]
  /** P2.0 intentionally has no normalized or display score payload. */
  normalizedSignals: null
  checkedDate: string
}

export type CareerFutureIntelligenceSignalDefinition = {
  key: CareerFutureIntelligenceSignalKey
  meaning: string
  doesNotMean: readonly string[]
  preferredSourceHierarchy: readonly CareerFutureIntelligenceSourceTier[]
  rawEvidenceShape: readonly string[]
  geographyRule: string
  occupationRule: string
  referencePeriodRule: string
  checkedDateRule: string
  confidenceRule: string
  missingDataRule: string
  normalizationBoundary: string
  userFacingBoundary: string
}

export const CAREER_FUTURE_INTELLIGENCE_SIGNAL_DEFINITIONS: Readonly<Record<CareerFutureIntelligenceSignalKey, CareerFutureIntelligenceSignalDefinition>> = {
  demand: {
    key: "demand",
    meaning: "Sustained employer need for the defined occupation in the defined geography, evidenced by a combination of shortage pressure, employment, vacancy intensity and/or openings signals over a stated period.",
    doesNotMean: [
      "the number of current vacancies in isolation",
      "sector size, GDP or industry importance",
      "salary, immigration eligibility or a guarantee of a job",
    ],
    preferredSourceHierarchy: ["official_occupation", "official_labour_market", "validated_market_dataset", "official_sector_proxy"],
    rawEvidenceShape: ["occupation code and mapping relation", "shortage assessment or employment/openings measure", "vacancy definition and denominator when present", "reference period and geography"],
    geographyRule: "Country evidence is true only for that country; subnational evidence must carry its region code. Global claims require explicitly multi-country evidence.",
    occupationRule: "Prefer an exact official occupation classification. Broader groups are proxies and must be labelled as such; sector classifications cannot silently stand in for an occupation.",
    referencePeriodRule: "Record the observation period and distinguish a stock, flow, rate, trend or forward projection.",
    checkedDateRule: "Record the date the source was checked or retrieved as an ISO date; it does not replace the reference period.",
    confidenceRule: "Verified requires direct, current official occupation evidence; Estimated allows a defensible broader group or validated market dataset; Limited evidence is directional only.",
    missingDataRule: "No defensible occupation evidence is unavailable, never a zero or neutral demand value.",
    normalizationBoundary: "Any later 0–10 display must be a versioned, deterministic policy using comparable denominators; raw vacancy counts remain separate inputs.",
    userFacingBoundary: "Say that evidence indicates stronger or weaker hiring conditions in this country and period. Do not promise availability of work.",
  },
  growth: {
    key: "growth",
    meaning: "Expected or observed change in employment or occupational opportunities for the defined occupation over a stated forward or historical horizon.",
    doesNotMean: ["current demand", "sector growth or policy ambition without occupation linkage", "a personal promotion or income forecast"],
    preferredSourceHierarchy: ["official_occupation", "official_labour_market", "official_sector_proxy", "peer_reviewed_research"],
    rawEvidenceShape: ["baseline and endpoint employment or openings", "absolute and percentage change", "projection horizon or historical interval", "methodology and scenario if projected"],
    geographyRule: "The projection geography must match the Career country unless explicitly marked as a proxy; global projections cannot become country truth.",
    occupationRule: "Prefer the exact occupation code and version used by the projection. A broader occupation group requires relation, mapping quality and rationale.",
    referencePeriodRule: "Always include start, end and horizon; distinguish historical change from a modelled projection.",
    checkedDateRule: "Checked date is provenance for the release, not the endpoint of the projection.",
    confidenceRule: "Verified is an official occupation projection or observed series with clear methods; Estimated is a defensible broader-group projection; Limited evidence is sector or research context.",
    missingDataRule: "Absent occupation-linked change evidence is unavailable, not zero growth.",
    normalizationBoundary: "Later normalization must specify horizon, baseline, direction and clamping in a published version; do not reuse the legacy growth component automatically.",
    userFacingBoundary: "Describe direction and horizon (for example, projected growth through 2030), not certainty or an individual outcome.",
  },
  stability: {
    key: "stability",
    meaning: "The resilience and continuity of employment in the occupation, using observable persistence, volatility, cyclicality or replacement patterns over time.",
    doesNotMean: ["permanent job security", "a prediction that an individual will keep a job", "low AI exposure, shortage or high pay by itself"],
    preferredSourceHierarchy: ["official_occupation", "official_labour_market", "peer_reviewed_research", "validated_market_dataset"],
    rawEvidenceShape: ["multi-period employment/unemployment or separation series", "volatility or persistence statistic with formula", "cyclical/structural context", "occupation and geography scope"],
    geographyRule: "Stability is country- and occupation-specific unless a source explicitly supports a multi-country comparison.",
    occupationRule: "Use an occupation code with a longitudinal series. Sector resilience is context only and must not be relabelled occupation stability.",
    referencePeriodRule: "Require multiple comparable periods and disclose breaks in classification or methodology.",
    checkedDateRule: "Record the latest period checked and source release date separately when available.",
    confidenceRule: "Verified requires a reproducible multi-period occupation series; Estimated permits a documented proxy; Limited evidence is qualitative context only.",
    missingDataRule: "Without longitudinal occupation evidence, stability is unavailable and must not receive an average value.",
    normalizationBoundary: "A future index must publish its volatility/persistence formula and minimum history; no arbitrary band or AI-generated inference.",
    userFacingBoundary: "Use cautious language such as more resilient or more cyclical in the observed period; never call a career safe.",
  },
  ai_exposure: {
    key: "ai_exposure",
    meaning: "The share or type of occupation tasks exposed to AI capabilities for augmentation or substitution, based on an explicit task or capability framework.",
    doesNotMean: ["the probability that a job disappears", "a forecast of layoffs or an individual's employability", "that AI will replace the whole occupation"],
    preferredSourceHierarchy: ["official_task_or_skill_dataset", "peer_reviewed_research", "official_occupation", "validated_market_dataset"],
    rawEvidenceShape: ["task list or task shares", "exposure/augmentation dimensions and scale", "model or study version", "occupation crosswalk and geography applicability"],
    geographyRule: "Many AI task studies are global. They remain global task evidence unless a country-specific adoption or task dataset is supplied.",
    occupationRule: "Preserve the source classification and crosswalk; do not infer an exact Career mapping from a title match alone.",
    referencePeriodRule: "Record the study/data vintage and whether it measures capability exposure, observed adoption or scenario projection.",
    checkedDateRule: "Checked date records review of the study or dataset and does not imply the exposure itself is current employment data.",
    confidenceRule: "Verified means transparent task-level evidence with a defensible crosswalk; Estimated means a documented occupational proxy; Limited evidence is directional commentary.",
    missingDataRule: "No task-level evidence means unavailable; do not assign low, medium or average exposure by default.",
    normalizationBoundary: "A later display band must preserve augmentation versus substitution dimensions and a versioned mapping; no arbitrary probability or AI-generated score.",
    userFacingBoundary: "Explain which tasks may change or be assisted and keep uncertainty visible. Never state that the career will disappear.",
  },
  skills_change: {
    key: "skills_change",
    meaning: "Observed change in the skills, tasks, tools or requirements attached to an occupation over a stated period.",
    doesNotMean: ["a generic skills list", "AI exposure itself", "that every worker must acquire every listed skill"],
    preferredSourceHierarchy: ["official_task_or_skill_dataset", "official_occupation", "validated_market_dataset", "peer_reviewed_research"],
    rawEvidenceShape: ["skill/task identifiers and labels", "frequency, share or change statistic", "baseline and comparison period", "occupation crosswalk and source coverage"],
    geographyRule: "Skill changes are local to the labour market represented by the source. Job-ad evidence must retain country and coverage boundaries.",
    occupationRule: "Use coded occupational standards or a documented vacancy-to-occupation crosswalk; title-only skills are not sufficient.",
    referencePeriodRule: "Compare at least two named periods and state whether the change is prevalence, emergence or removal.",
    checkedDateRule: "Record source check date separately from the skill observation periods.",
    confidenceRule: "Verified requires reproducible coded longitudinal evidence; Estimated allows a coverage-limited but defensible dataset; Limited evidence is qualitative.",
    missingDataRule: "No comparable skill-change evidence is unavailable, not no change.",
    normalizationBoundary: "Later normalization may summarize direction or magnitude only after coverage, taxonomy and period comparability are documented.",
    userFacingBoundary: "Describe skills that are becoming more common or important in the observed market; avoid prescribing a complete curriculum.",
  },
  outlook: {
    key: "outlook",
    meaning: "A bounded forward-looking interpretation of the occupation's conditions, anchored in cited Demand, Growth, Stability, AI Exposure and Skills Change evidence.",
    doesNotMean: ["a seventh score or hidden total", "an AI-generated prediction", "a guarantee, ranking or universal global truth"],
    preferredSourceHierarchy: ["official_occupation", "official_labour_market", "peer_reviewed_research", "official_sector_proxy"],
    rawEvidenceShape: ["source-published outlook category or narrative", "component evidence references", "horizon, geography and occupation scope", "known caveats and scenario"],
    geographyRule: "Outlook inherits the narrowest geography supported by its component evidence; a country outlook cannot be silently generalized globally.",
    occupationRule: "Prefer a source-published occupation outlook. If synthesized, retain every supporting evidence key and mark the synthesis as derived.",
    referencePeriodRule: "State the outlook horizon and the latest evidence vintage; do not collapse different horizons into one period.",
    checkedDateRule: "Record the editorial review date and each source checked date.",
    confidenceRule: "Verified is directly published official outlook; Estimated is a transparent synthesis from adequate evidence; Limited evidence is explicitly directional.",
    missingDataRule: "If required supporting evidence is absent, outlook is unavailable or partial; never fill a neutral category.",
    normalizationBoundary: "P2.0 permits no composite normalization. Any later category or score requires a documented deterministic rule and must remain explainable to the cited evidence.",
    userFacingBoundary: "Present a concise, qualified direction with reasons and horizon. Keep source limitations visible and do not make a personal recommendation from outlook alone.",
  },
} as const

export function validateCareerFutureIntelligenceEvidence(
  evidence: CareerFutureIntelligenceRawEvidence,
): string[] {
  const errors: string[] = []
  if (evidence.availability === "missing") {
    if (evidence.rawValue !== null) errors.push("missing evidence must have rawValue=null")
    if (!evidence.missingReason?.trim()) errors.push("missing evidence requires missingReason")
    if (evidence.evidenceLevel !== "unavailable") errors.push("missing evidence must use evidenceLevel=unavailable")
  }
  if (evidence.availability === "available" && evidence.rawValue === null) {
    errors.push("available evidence requires a rawValue")
  }
  if (!evidence.checkedDate.match(/^\d{4}-\d{2}-\d{2}$/)) errors.push("checkedDate must be an ISO date")
  if (evidence.geography.scope === "country" && !evidence.geography.countryCode) {
    errors.push("country geography requires countryCode")
  }
  if (evidence.geography.scope === "global" && evidence.geography.countryCode !== null) {
    errors.push("global geography cannot carry a countryCode")
  }
  return errors
}
