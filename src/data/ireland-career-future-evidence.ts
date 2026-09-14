import {
  CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS,
  type CareerFutureIntelligenceGeography,
  type CareerFutureIntelligenceOccupation,
  type CareerFutureIntelligenceRawEvidence,
  type CareerFutureIntelligenceRecord,
  type CareerFutureIntelligenceReferencePeriod,
  type CareerFutureIntelligenceSignalKey,
  type CareerFutureIntelligenceSource,
} from "@/lib/career-future-intelligence-contract"
import {
  IE_CAREER_COMPARE_IDS,
  IE_CAREER_COMPARE_LABELS,
  type IrelandCareerCompareId,
} from "@/lib/ireland-career-comparison"

export type IrelandFutureEvidenceMapping = CareerFutureIntelligenceOccupation & {
  careerId: IrelandCareerCompareId
  mappingType: "exact" | "close_proxy" | "broader_proxy"
  rationale: string
  sourceKey: string
  geography: CareerFutureIntelligenceGeography
  checkedDate: string
}

export type IrelandFutureCoverageStatus = "direct" | "proxy" | "unavailable"

export type IrelandFutureCoverageCell = {
  careerId: IrelandCareerCompareId
  signal: CareerFutureIntelligenceSignalKey
  status: IrelandFutureCoverageStatus
  evidenceKeys: readonly string[]
  rationale: string
}

const IE: CareerFutureIntelligenceGeography = {
  scope: "country",
  countryCode: "IE",
  regionCode: null,
  label: "Ireland",
}

const GLOBAL: CareerFutureIntelligenceGeography = {
  scope: "global",
  countryCode: null,
  regionCode: null,
  label: "Global",
}

const SOURCE_URLS = {
  csoSoc2010: "https://www.cso.ie/en/methods/classifications/standardoccupationalclassification/",
  solasNsb2025: "https://www.solas.ie/research-lp/skills-labour-market-research-slmru/research/",
  solasForecast2023: "https://www.cedefop.europa.eu/files/skills_forecast_2023_ireland.pdf",
  oecdAiExposure2026: "https://www.oecd.org/en/publications/the-oecd-ai-exposure-measure_f3da0f0a-en.html",
  iloGenAi2025: "https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure",
} as const

const sources = {
  csoSoc2010: {
    sourceKey: "cso-soc-2010",
    publisher: "Central Statistics Office Ireland",
    title: "Standard Occupational Classification 2010",
    url: SOURCE_URLS.csoSoc2010,
    tier: "official_occupation",
    occupationSpecific: true,
  },
  solasNsb2025: {
    sourceKey: "solas-nsb-2025",
    publisher: "SOLAS Skills and Labour Market Research Unit",
    title: "National Skills Bulletin 2025",
    url: SOURCE_URLS.solasNsb2025,
    tier: "official_labour_market",
    occupationSpecific: true,
  },
  solasForecast2023: {
    sourceKey: "solas-skills-forecast-2023",
    publisher: "SOLAS / Cedefop",
    title: "Skills Forecast 2023 — Ireland",
    url: SOURCE_URLS.solasForecast2023,
    tier: "official_sector_proxy",
    occupationSpecific: false,
  },
  oecdAiExposure2026: {
    sourceKey: "oecd-ai-exposure-2026",
    publisher: "OECD",
    title: "The OECD AI exposure measure",
    url: SOURCE_URLS.oecdAiExposure2026,
    tier: "official_task_or_skill_dataset",
    occupationSpecific: true,
  },
  iloGenAi2025: {
    sourceKey: "ilo-generative-ai-index-2025",
    publisher: "International Labour Organization",
    title: "Generative AI and jobs: refined global index of occupational exposure",
    url: SOURCE_URLS.iloGenAi2025,
    tier: "peer_reviewed_research",
    occupationSpecific: true,
  },
} satisfies Record<string, CareerFutureIntelligenceSource>

const periods = {
  nsb2025: { start: "2024-01-01", end: "2024-12-31", label: "2024 labour market observations (NSB 2025)", horizonYears: null },
  forecast2035: { start: "2021-01-01", end: "2035-12-31", label: "2021 baseline to 2035 projection", horizonYears: 14 },
  aiStudy: { start: "2023-01-01", end: "2026-12-31", label: "study/data vintage 2026", horizonYears: null },
} satisfies Record<string, CareerFutureIntelligenceReferencePeriod>

type MappingInput = Omit<IrelandFutureEvidenceMapping, "careerId" | "geography" | "checkedDate">

const mappingInputs: Record<IrelandCareerCompareId, MappingInput> = {
  "software-developer": {
    taxonomy: "SOC",
    taxonomyVersion: "2010",
    code: "2136",
    title: "Programmers and software development professionals",
    relation: "exact",
    mappingQuality: "high",
    mappingType: "exact",
    rationale: "CSO SOC 2010 title directly covers software development professionals.",
    sourceKey: sources.csoSoc2010.sourceKey,
  },
  "cybersecurity-analyst": {
    taxonomy: "SOC",
    taxonomyVersion: "2010",
    code: "2139",
    title: "Information technology and telecommunications professionals n.e.c.",
    relation: "narrower",
    mappingQuality: "medium",
    mappingType: "close_proxy",
    rationale: "Cyber-security analyst is a narrower scope within the SOC 2139 residual IT professional group.",
    sourceKey: sources.csoSoc2010.sourceKey,
  },
  "data-engineer": {
    taxonomy: "SOC",
    taxonomyVersion: "2010",
    code: "2135",
    title: "IT business analysts, architects and systems designers",
    relation: "narrower",
    mappingQuality: "medium",
    mappingType: "close_proxy",
    rationale: "Data engineering is a narrower data/architecture scope within SOC 2135.",
    sourceKey: sources.csoSoc2010.sourceKey,
  },
  "civil-engineer": {
    taxonomy: "SOC",
    taxonomyVersion: "2010",
    code: "2121",
    title: "Civil engineers",
    relation: "exact",
    mappingQuality: "high",
    mappingType: "exact",
    rationale: "CSO SOC 2010 has a direct Civil engineers occupation title.",
    sourceKey: sources.csoSoc2010.sourceKey,
  },
  "construction-manager": {
    taxonomy: "SOC",
    taxonomyVersion: "2010",
    code: "2436",
    title: "Construction project managers and related professionals",
    relation: "composite",
    mappingQuality: "medium",
    mappingType: "close_proxy",
    rationale: "Construction manager is represented by the composite 2436 group; site-manager scope also appears under SOC 1122.",
    sourceKey: sources.csoSoc2010.sourceKey,
  },
  radiographer: {
    taxonomy: "SOC",
    taxonomyVersion: "2010",
    code: "2217",
    title: "Medical radiographers",
    relation: "exact",
    mappingQuality: "high",
    mappingType: "exact",
    rationale: "CSO SOC 2010 directly identifies medical radiographers; diagnostic and therapeutic scopes are retained in notes.",
    sourceKey: sources.csoSoc2010.sourceKey,
  },
}

const checkedDate = "2026-09-14"

export const IRELAND_FUTURE_MAPPINGS: Readonly<Record<IrelandCareerCompareId, readonly IrelandFutureEvidenceMapping[]>> =
  Object.fromEntries(IE_CAREER_COMPARE_IDS.map((careerId) => {
    const base = mappingInputs[careerId]
    const mappings: IrelandFutureEvidenceMapping[] = [{ ...base, careerId, geography: IE, checkedDate }]
    if (careerId === "construction-manager") {
      mappings.push({
        ...base,
        careerId,
        code: "1122",
        title: "Production, works and maintenance managers — site manager scope",
        relation: "proxy",
        mappingQuality: "low",
        mappingType: "broader_proxy",
        rationale: "Secondary site-manager scope retained as a broader proxy; it is not merged with the 2436 observation.",
        sourceKey: sources.csoSoc2010.sourceKey,
        geography: IE,
        checkedDate,
      })
    }
    return [careerId, mappings] as const
  })) as unknown as Record<IrelandCareerCompareId, readonly IrelandFutureEvidenceMapping[]>

function availableEvidence(
  evidenceKey: string,
  signal: CareerFutureIntelligenceSignalKey,
  source: CareerFutureIntelligenceSource,
  rawValue: Record<string, unknown>,
  unit: string | null,
  geography: CareerFutureIntelligenceGeography,
  occupation: CareerFutureIntelligenceOccupation | null,
  referencePeriod: CareerFutureIntelligenceReferencePeriod,
  evidenceLevel: "verified" | "estimated" | "limited_evidence",
  notes: string,
): CareerFutureIntelligenceRawEvidence {
  return { evidenceKey, signal, source, rawValue, unit, geography, occupation, referencePeriod, checkedDate, evidenceLevel, availability: "available", missingReason: null, notes }
}

function unavailableEvidence(
  evidenceKey: string,
  signal: CareerFutureIntelligenceSignalKey,
  source: CareerFutureIntelligenceSource,
  geography: CareerFutureIntelligenceGeography,
  occupation: CareerFutureIntelligenceOccupation | null,
  referencePeriod: CareerFutureIntelligenceReferencePeriod,
  missingReason: string,
): CareerFutureIntelligenceRawEvidence {
  return { evidenceKey, signal, source, rawValue: null, unit: null, geography, occupation, referencePeriod, checkedDate, evidenceLevel: "unavailable", availability: "missing", missingReason, notes: null }
}

function occupationFor(careerId: IrelandCareerCompareId): CareerFutureIntelligenceOccupation {
  const mapping = IRELAND_FUTURE_MAPPINGS[careerId][0]
  return {
    taxonomy: mapping.taxonomy,
    taxonomyVersion: mapping.taxonomyVersion,
    code: mapping.code,
    title: mapping.title,
    relation: mapping.relation,
    mappingQuality: mapping.mappingQuality,
  }
}

const employmentValues: Record<IrelandCareerCompareId, { employed2024: number; growthPct: number; growthLabel: string }> = {
  "software-developer": { employed2024: 54800, growthPct: 12.1, growthLabel: "2019–2024 annual average" },
  "cybersecurity-analyst": { employed2024: 25200, growthPct: 9, growthLabel: "2019–2024 annual average; broader IT proxy" },
  "data-engineer": { employed2024: 25200, growthPct: 9, growthLabel: "2019–2024 annual average; broader IT proxy" },
  "civil-engineer": { employed2024: 22400, growthPct: 4.6, growthLabel: "2019–2024 annual average; combined engineering/project-manager proxy" },
  "construction-manager": { employed2024: 22400, growthPct: 4.6, growthLabel: "2019–2024 annual average; construction project-manager group" },
  radiographer: { employed2024: 29200, growthPct: 5.2, growthLabel: "2019–2024 annual average; broader healthcare-professional proxy" },
}

const outlookGroups: Record<IrelandCareerCompareId, { group: string; baselineThousands: number; netChangeThousands: number }> = {
  "software-developer": { group: "ICT professionals", baselineThousands: 71, netChangeThousands: 29 },
  "cybersecurity-analyst": { group: "ICT professionals", baselineThousands: 71, netChangeThousands: 29 },
  "data-engineer": { group: "ICT professionals", baselineThousands: 71, netChangeThousands: 29 },
  "civil-engineer": { group: "Science and engineering professionals", baselineThousands: 96, netChangeThousands: 19 },
  "construction-manager": { group: "Production and specialised services managers", baselineThousands: 69, netChangeThousands: 38 },
  radiographer: { group: "Health professionals", baselineThousands: 104, netChangeThousands: 8 },
}

function buildEvidence(careerId: IrelandCareerCompareId): readonly CareerFutureIntelligenceRawEvidence[] {
  const occupation = occupationFor(careerId)
  const values = employmentValues[careerId]
  const outlook = outlookGroups[careerId]
  const demandStatus = careerId === "software-developer" || careerId === "civil-engineer" || careerId === "radiographer" ? "direct" : "proxy"
  return [
    availableEvidence(`${careerId}:demand:nsb-2025`, "demand", sources.solasNsb2025, {
      metricType: "shortage_assessment",
      status: "shortage_or_difficult_to_fill",
      coverage: demandStatus,
      employed2024: values.employed2024,
      vacancyDefinition: "Not a current vacancy count; NSB occupation assessment and employment context.",
    }, "persons (employment context)", IE, occupation, periods.nsb2025, demandStatus === "direct" ? "verified" : "estimated", "Employment stock and shortage narrative are separate raw fields; neither is a display score."),
    availableEvidence(`${careerId}:growth:nsb-2025`, "growth", sources.solasNsb2025, {
      metricType: "historical_employment_change",
      employed2024: values.employed2024,
      annualAverageGrowthPct: values.growthPct,
      interval: "2019–2024",
      coverage: values.growthLabel,
    }, "% annual average", IE, occupation, periods.nsb2025, careerId === "software-developer" ? "verified" : "estimated", "Observed historical change; no normalization or forward certainty is implied."),
    availableEvidence(`${careerId}:outlook:solas-forecast-2035`, "outlook", sources.solasForecast2023, {
      metricType: "official_projection_context",
      projectionGroup: outlook.group,
      baselineEmploymentThousands: outlook.baselineThousands,
      netChangeThousandsTo2035: outlook.netChangeThousands,
      scope: "broader occupation group",
    }, "thousands of persons", IE, occupation, periods.forecast2035, "estimated", "Official Ireland projection is a broader-group proxy and is not an occupation score or universal Career verdict."),
    unavailableEvidence(`${careerId}:stability:occupation-series`, "stability", sources.solasNsb2025, IE, occupation, periods.nsb2025, "No reproducible multi-period Ireland occupation stability or volatility series was identified in the reviewed official releases."),
    unavailableEvidence(`${careerId}:ai-exposure:ireland-crosswalk`, "ai_exposure", sources.oecdAiExposure2026, GLOBAL, occupation, periods.aiStudy, "OECD and ILO task-level measures are global; no defensible SOC 2010-to-study crosswalk was established for an Ireland-specific claim. AI exposure is therefore unavailable, not a disappearance probability."),
    unavailableEvidence(`${careerId}:skills-change:ireland-series`, "skills_change", sources.iloGenAi2025, GLOBAL, occupation, periods.aiStudy, "Reviewed global task/skills research does not provide a comparable Ireland occupation skill-change series with a verified SOC 2010 crosswalk."),
  ]
}

export const IRELAND_CAREER_FUTURE_EVIDENCE: readonly CareerFutureIntelligenceRecord[] = IE_CAREER_COMPARE_IDS.map((careerId) => {
  const evidence = buildEvidence(careerId)
  const signalRecord = (signal: CareerFutureIntelligenceSignalKey) => {
    const rows = evidence.filter((item) => item.signal === signal)
    const available = rows.some((item) => item.availability === "available")
    const evidenceLevel = available ? rows.find((item) => item.availability === "available")!.evidenceLevel : "unavailable"
    return { signal, availability: available ? "available" as const : "missing" as const, evidenceKeys: rows.map((item) => item.evidenceKey), interpretation: null, evidenceLevel }
  }
  return {
    countryCode: "IE",
    careerId,
    signals: Object.fromEntries(CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS.map((signal) => [signal, signalRecord(signal)])) as unknown as CareerFutureIntelligenceRecord["signals"],
    rawEvidence: evidence,
    normalizedSignals: null,
    checkedDate,
  }
})

export const IRELAND_FUTURE_COVERAGE_MATRIX: readonly IrelandFutureCoverageCell[] = IRELAND_CAREER_FUTURE_EVIDENCE.flatMap((record) => CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS.map((signal) => {
  const rows = record.rawEvidence.filter((item) => item.signal === signal)
  const available = rows.filter((item) => item.availability === "available")
  const status: IrelandFutureCoverageStatus = available.length === 0 ? "unavailable" : available.some((item) => item.evidenceLevel === "verified") ? "direct" : "proxy"
  return {
    careerId: record.careerId as IrelandCareerCompareId,
    signal,
    status,
    evidenceKeys: rows.map((item) => item.evidenceKey),
    rationale: status === "unavailable" ? "No defensible Ireland occupation evidence; explicit missing state retained." : status === "direct" ? "Direct official occupation/labour-market evidence." : "Broader-group or coverage-limited official evidence; raw proxy boundary retained.",
  }
}))

export const IRELAND_FUTURE_CAREER_IDS = IE_CAREER_COMPARE_IDS
export const IRELAND_FUTURE_CAREER_LABELS = IE_CAREER_COMPARE_LABELS
