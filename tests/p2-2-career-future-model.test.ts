import assert from "node:assert/strict"
import test from "node:test"

import {
  CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS,
} from "@/lib/career-future-intelligence-contract"
import {
  IRELAND_CAREER_FUTURE_EVIDENCE,
} from "@/data/ireland-career-future-evidence"
import {
  IRELAND_CAREER_FUTURE_INTELLIGENCE,
  classifyCareerFutureDirections,
  getIrelandCareerFutureIntelligence,
  getIrelandCareerFutureSignal,
  type CareerFutureDerivedSignal,
} from "@/lib/career-future-intelligence-model"
import { IE_CAREER_COMPARE_IDS } from "@/lib/ireland-career-comparison"

test("P2.2 supports exactly the P2.1 Ireland six-career cohort", () => {
  assert.deepEqual(IRELAND_CAREER_FUTURE_INTELLIGENCE.map((record) => record.careerId), [...IE_CAREER_COMPARE_IDS])
  assert.equal(new Set(IRELAND_CAREER_FUTURE_INTELLIGENCE.map((record) => record.careerId)).size, 6)
  for (const record of IRELAND_CAREER_FUTURE_INTELLIGENCE) {
    assert.deepEqual(Object.keys(record.signals).sort(), [...CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS].sort())
  }
})

test("every derived signal traces to P2.1 evidence with explicit geography and period", () => {
  for (const record of IRELAND_CAREER_FUTURE_INTELLIGENCE) {
    const rawKeys = new Set(IRELAND_CAREER_FUTURE_EVIDENCE.find((raw) => raw.careerId === record.careerId)!.rawEvidence.map((row) => row.evidenceKey))
    for (const signal of Object.values(record.signals)) {
      assert.ok(signal.evidenceKeys.length > 0)
      assert.ok(signal.evidenceKeys.every((key) => rawKeys.has(key)))
      assert.ok(signal.geography)
      assert.ok(signal.referencePeriod)
      assert.ok(signal.interpretation.length > 0)
    }
  }
})

test("missing P2.1 evidence remains unavailable rather than neutral or zero", () => {
  for (const record of IRELAND_CAREER_FUTURE_INTELLIGENCE) {
    for (const key of ["stability", "ai_exposure", "skills_change"] as const) {
      const signal = record.signals[key]
      assert.equal(signal.status, "unavailable")
      assert.equal(signal.direction, "unknown")
      assert.equal(signal.displayValue, null)
      assert.equal(signal.confidence, "unavailable")
    }
  }
})

test("proxy evidence lowers certainty and preserves geography boundaries", () => {
  const software = getIrelandCareerFutureIntelligence("software-developer")!
  const cyber = getIrelandCareerFutureIntelligence("cybersecurity-analyst")!
  assert.equal(software.signals.demand.proxyDisclosure, "exact")
  assert.equal(cyber.signals.demand.proxyDisclosure, "proxy")
  assert.equal(cyber.signals.demand.status, "limited")
  assert.equal(software.signals.outlook.proxyDisclosure, "broader_proxy")
  assert.equal(software.signals.ai_exposure.geography?.scope, "global")
  assert.equal(software.signals.ai_exposure.geography?.countryCode, null)
})

test("Demand, Growth and Outlook retain source semantics without arbitrary scores", () => {
  for (const careerId of IE_CAREER_COMPARE_IDS) {
    const model = getIrelandCareerFutureIntelligence(careerId)!
    assert.equal(model.signals.demand.direction, "positive")
    assert.match(model.signals.demand.displayValue ?? "", /Shortage assessment/)
    assert.match(model.signals.growth.displayValue ?? "", /Historical annual average growth/)
    assert.doesNotMatch(model.signals.growth.displayValue ?? "", /projected/i)
    assert.match(model.signals.outlook.displayValue ?? "", /Projected change/)
    const rawDemand = IRELAND_CAREER_FUTURE_EVIDENCE.find((record) => record.careerId === careerId)!.rawEvidence.find((row) => row.signal === "demand")!
    assert.notEqual(rawDemand.rawValue?.metricType, "sector_employment_size")
    assert.doesNotMatch(rawDemand.notes ?? "", /sector size/i)
  }
})

test("Outlook can expose mixed component directions without a magic aggregate", () => {
  const makeSignal = (direction: CareerFutureDerivedSignal["direction"]): CareerFutureDerivedSignal => ({
    signal: "demand",
    status: "available",
    direction,
    confidence: "verified",
    displayValue: null,
    interpretation: "test",
    evidenceKeys: ["test"],
    proxyDisclosure: "exact",
    geography: null,
    referencePeriod: null,
  })
  assert.equal(classifyCareerFutureDirections([makeSignal("positive"), makeSignal("negative")]), "mixed")
  assert.equal(classifyCareerFutureDirections([makeSignal("positive"), makeSignal("unknown")]), "positive")
})

test("model API is deterministic and rejects unsupported careers", () => {
  assert.equal(getIrelandCareerFutureIntelligence("not-a-career"), null)
  assert.equal(getIrelandCareerFutureSignal("not-a-career", "demand"), null)
  const first = getIrelandCareerFutureIntelligence("radiographer")
  const second = getIrelandCareerFutureIntelligence("radiographer")
  assert.deepEqual(first, second)
})

test("derived model has no score, normalization or disappearance-probability fields", () => {
  const forbidden = /(^|_)(score|normalized|rating|band|probability)($|_)/i
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object") return
    for (const [key, child] of Object.entries(value)) {
      assert.equal(forbidden.test(key), false, `forbidden derived key: ${key}`)
      visit(child)
    }
  }
  visit(IRELAND_CAREER_FUTURE_INTELLIGENCE)
  for (const record of IRELAND_CAREER_FUTURE_INTELLIGENCE) {
    assert.doesNotMatch(record.signals.ai_exposure.interpretation, /job disappears|job disappearance|layoff probability/i)
  }
})
