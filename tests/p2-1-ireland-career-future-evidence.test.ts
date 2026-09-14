import assert from "node:assert/strict"
import test from "node:test"

import {
  CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS,
  validateCareerFutureIntelligenceEvidence,
} from "@/lib/career-future-intelligence-contract"
import { IE_CAREER_COMPARE_IDS } from "@/lib/ireland-career-comparison"
import {
  IRELAND_CAREER_FUTURE_EVIDENCE,
  IRELAND_FUTURE_COVERAGE_MATRIX,
  IRELAND_FUTURE_MAPPINGS,
} from "@/data/ireland-career-future-evidence"

const ids = [...IE_CAREER_COMPARE_IDS]

test("P2.1 contains exactly the reviewed Ireland six-career cohort", () => {
  assert.deepEqual(IRELAND_CAREER_FUTURE_EVIDENCE.map((record) => record.careerId), ids)
  assert.equal(new Set(IRELAND_CAREER_FUTURE_EVIDENCE.map((record) => record.careerId)).size, 6)
  assert.equal(IRELAND_FUTURE_COVERAGE_MATRIX.length, 36)
})

test("every evidence row conforms to P2.0 and keeps normalized signals null", () => {
  for (const record of IRELAND_CAREER_FUTURE_EVIDENCE) {
    assert.equal(record.countryCode, "IE")
    assert.equal(record.normalizedSignals, null)
    assert.deepEqual(Object.keys(record.signals).sort(), [...CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS].sort())
    assert.equal(record.rawEvidence.length, 6)
    for (const evidence of record.rawEvidence) {
      assert.deepEqual(validateCareerFutureIntelligenceEvidence(evidence), [])
      assert.match(evidence.checkedDate, /^\d{4}-\d{2}-\d{2}$/)
      assert.ok(evidence.source.url.startsWith("https://"))
      assert.ok(evidence.geography.label.length > 0)
      if (evidence.availability === "missing") {
        assert.equal(evidence.rawValue, null)
        assert.equal(evidence.evidenceLevel, "unavailable")
        assert.ok(evidence.missingReason)
      } else {
        assert.ok(evidence.rawValue)
      }
    }
  }
})

test("occupation mappings make exact and proxy boundaries explicit", () => {
  assert.equal(IRELAND_FUTURE_MAPPINGS["software-developer"][0].mappingType, "exact")
  assert.equal(IRELAND_FUTURE_MAPPINGS["civil-engineer"][0].mappingType, "exact")
  assert.equal(IRELAND_FUTURE_MAPPINGS.radiographer[0].mappingType, "exact")
  assert.equal(IRELAND_FUTURE_MAPPINGS["cybersecurity-analyst"][0].mappingType, "close_proxy")
  assert.equal(IRELAND_FUTURE_MAPPINGS["data-engineer"][0].mappingType, "close_proxy")
  assert.equal(IRELAND_FUTURE_MAPPINGS["construction-manager"].length, 2)
  assert.equal(IRELAND_FUTURE_MAPPINGS["construction-manager"][1].mappingType, "broader_proxy")
})

test("raw evidence does not smuggle in scores or reinterpret trust boundaries", () => {
  const forbidden = /(^|_)(score|normalized|rating|band)($|_)/i
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object") return
    for (const [key, child] of Object.entries(value)) {
      assert.equal(forbidden.test(key), false, `forbidden derived key: ${key}`)
      visit(child)
    }
  }
  visit(IRELAND_CAREER_FUTURE_EVIDENCE.map((record) => record.rawEvidence))

  for (const record of IRELAND_CAREER_FUTURE_EVIDENCE) {
    const demand = record.rawEvidence.find((row) => row.signal === "demand")!
    assert.match(String(demand.rawValue?.vacancyDefinition), /not a current vacancy count/i)
    const ai = record.rawEvidence.find((row) => row.signal === "ai_exposure")!
    assert.equal(ai.geography.scope, "global")
    assert.match(ai.missingReason ?? "", /not a disappearance probability/i)
    assert.equal(record.rawEvidence.find((row) => row.signal === "stability")?.rawValue, null)
    assert.equal(record.rawEvidence.find((row) => row.signal === "skills_change")?.rawValue, null)
  }
})

test("coverage matrix is deterministic and classifies only direct, proxy or unavailable", () => {
  const keys = new Set<string>()
  for (const cell of IRELAND_FUTURE_COVERAGE_MATRIX) {
    const key = `${cell.careerId}:${cell.signal}`
    assert.equal(keys.has(key), false)
    keys.add(key)
    assert.ok(["direct", "proxy", "unavailable"].includes(cell.status))
    assert.ok(cell.evidenceKeys.length > 0)
  }
  assert.equal(keys.size, 36)
})
