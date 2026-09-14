import assert from "node:assert/strict"
import test from "node:test"

import {
  CAREER_FUTURE_INTELLIGENCE_SIGNAL_DEFINITIONS,
  CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS,
  validateCareerFutureIntelligenceEvidence,
  type CareerFutureIntelligenceRawEvidence,
} from "../src/lib/career-future-intelligence-contract"

const source = {
  sourceKey: "ie-cso-example",
  publisher: "Central Statistics Office",
  title: "Occupation labour-market release",
  url: "https://example.com/source",
  tier: "official_occupation" as const,
  occupationSpecific: true,
}

const baseEvidence: CareerFutureIntelligenceRawEvidence = {
  evidenceKey: "IE:software-developer:demand:example",
  signal: "demand",
  source,
  rawValue: { employment: 1000, definition: "occupation employment" },
  unit: "people",
  geography: { scope: "country", countryCode: "IE", regionCode: null, label: "Ireland" },
  occupation: {
    taxonomy: "SOC",
    taxonomyVersion: "2020",
    code: "2136",
    title: "Programmers and software development professionals",
    relation: "broader",
    mappingQuality: "medium",
  },
  referencePeriod: { start: "2024-01-01", end: "2024-12-31", label: "2024", horizonYears: null },
  checkedDate: "2026-09-14",
  evidenceLevel: "estimated",
  availability: "available",
  missingReason: null,
  notes: "Broader official group used with an explicit proxy label.",
}

test("P2.0 defines exactly the six future-intelligence signals", () => {
  assert.deepEqual(CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS, [
    "demand",
    "growth",
    "stability",
    "ai_exposure",
    "skills_change",
    "outlook",
  ])
  for (const key of CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS) {
    const definition = CAREER_FUTURE_INTELLIGENCE_SIGNAL_DEFINITIONS[key]
    assert.equal(definition.key, key)
    for (const field of ["meaning", "geographyRule", "occupationRule", "referencePeriodRule", "checkedDateRule", "confidenceRule", "missingDataRule", "normalizationBoundary", "userFacingBoundary"]) {
      assert.ok(definition[field as keyof typeof definition], `${key} missing ${field}`)
    }
    assert.ok(definition.doesNotMean.length >= 2)
    assert.ok(definition.preferredSourceHierarchy.length >= 2)
    assert.ok(definition.rawEvidenceShape.length >= 2)
  }
})
test("raw evidence is valid without introducing a normalized or score field", () => {
  assert.deepEqual(validateCareerFutureIntelligenceEvidence(baseEvidence), [])
  assert.equal("score" in baseEvidence, false)
  assert.equal("normalizedValue" in baseEvidence, false)
})

test("missing evidence is explicit and cannot be represented as a neutral value", () => {
  const missing = {
    ...baseEvidence,
    rawValue: null,
    evidenceLevel: "unavailable" as const,
    availability: "missing" as const,
    missingReason: "No occupation-linked longitudinal series is published.",
  }
  assert.deepEqual(validateCareerFutureIntelligenceEvidence(missing), [])
  assert.deepEqual(validateCareerFutureIntelligenceEvidence({ ...missing, rawValue: { value: 0 } }), ["missing evidence must have rawValue=null"])
  assert.deepEqual(validateCareerFutureIntelligenceEvidence({ ...missing, missingReason: null }), ["missing evidence requires missingReason"])
})

test("geography and checked-date boundaries are enforced", () => {
  assert.deepEqual(validateCareerFutureIntelligenceEvidence({ ...baseEvidence, checkedDate: "14-09-2026" }), ["checkedDate must be an ISO date"])
  assert.deepEqual(validateCareerFutureIntelligenceEvidence({ ...baseEvidence, geography: { ...baseEvidence.geography, countryCode: null } }), ["country geography requires countryCode"])
  assert.deepEqual(validateCareerFutureIntelligenceEvidence({ ...baseEvidence, geography: { scope: "global", countryCode: "IE", regionCode: null, label: "Global" } }), ["global geography cannot carry a countryCode"])
})

test("Ireland Golden Slice remains the explicit P2.0 trust-boundary cohort", async () => {
  const { IE_CAREER_COMPARE_IDS } = await import("../src/lib/ireland-career-comparison")
  assert.deepEqual(IE_CAREER_COMPARE_IDS, [
    "software-developer",
    "cybersecurity-analyst",
    "data-engineer",
    "civil-engineer",
    "construction-manager",
    "radiographer",
  ])
})
