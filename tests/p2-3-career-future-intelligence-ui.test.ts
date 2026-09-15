import assert from "node:assert/strict"
import test from "node:test"

import { CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS } from "@/lib/career-future-intelligence-contract"
import {
  getIrelandCareerFutureIntelligence,
  getIrelandCareerFutureProvenance,
  IRELAND_CAREER_FUTURE_INTELLIGENCE,
  IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS,
  isIrelandCareerFutureCareerId,
} from "@/lib/career-future-intelligence-model"
import { IE_CAREER_COMPARE_IDS } from "@/lib/ireland-career-comparison"
import {
  FUTURE_OUTLOOK_COUNTRY_CODE,
  FUTURE_OUTLOOK_SIGNAL_ORDER,
  futureOutlookAiExposureBoundary,
  futureOutlookCardCopy,
  futureOutlookConfidenceLabel,
  futureOutlookDirectionLabel,
  futureOutlookPeriodAndGeography,
  futureOutlookProxyNote,
  futureOutlookSectionCopy,
  futureOutlookSectionVisible,
  futureOutlookSignalDoesNotMean,
  futureOutlookSignalMeaning,
  futureOutlookSignalName,
  futureOutlookSignalUserFacingBoundary,
  futureOutlookStatusLabel,
  futureOutlookUnavailableTitle,
} from "@/lib/career-future-intelligence-ui"

const SUPPORTED = [...IE_CAREER_COMPARE_IDS]
const UNSUPPORTED = ["nurse", "lawyer", "teacher", "not-a-career", "bricklayer"]

test("P2.3 gates the Future outlook section on exactly the six Ireland careers", () => {
  for (const careerId of SUPPORTED) {
    assert.equal(futureOutlookSectionVisible("IE", careerId), true)
  }
  for (const careerId of UNSUPPORTED) {
    assert.equal(futureOutlookSectionVisible("IE", careerId), false, careerId)
  }
  assert.equal(isIrelandCareerFutureCareerId("nurse"), false)
})

test("P2.3 never gates the section on non-Ireland country codes", () => {
  for (const countryCode of ["CA", "AU", "US", "KR", "GB", "DE"]) {
    for (const careerId of SUPPORTED) {
      assert.equal(futureOutlookSectionVisible(countryCode, careerId), false)
    }
  }
  assert.equal(FUTURE_OUTLOOK_COUNTRY_CODE, "IE")
})

test("P2.3 cohort is exactly the six reviewed careers with no expansion", () => {
  assert.deepEqual([...IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS], SUPPORTED)
  assert.equal(new Set(IRELAND_CAREER_FUTURE_INTELLIGENCE.map((record) => record.careerId)).size, 6)
  for (const careerId of SUPPORTED) {
    assert.ok(getIrelandCareerFutureIntelligence(careerId), careerId)
  }
  assert.equal(getIrelandCareerFutureIntelligence("nurse"), null)
})

test("P2.3 renders all six signal slots in the same canonical order across every career", () => {
  assert.deepEqual([...FUTURE_OUTLOOK_SIGNAL_ORDER], [...CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS])
  for (const careerId of SUPPORTED) {
    const intelligence = getIrelandCareerFutureIntelligence(careerId)!
    assert.deepEqual(Object.keys(intelligence.signals), FUTURE_OUTLOOK_SIGNAL_ORDER)
    for (const signal of FUTURE_OUTLOOK_SIGNAL_ORDER) {
      assert.ok(futureOutlookSignalName(signal, "en").length > 0)
      assert.ok(futureOutlookSignalName(signal, "ko").length > 0)
    }
  }
})

test("P2.3 UI presentation derives from the P2.2 model, never from raw evidence values", () => {
  for (const careerId of SUPPORTED) {
    const intelligence = getIrelandCareerFutureIntelligence(careerId)!
    for (const signal of FUTURE_OUTLOOK_SIGNAL_ORDER) {
      const derived = intelligence.signals[signal]
      const provenance = getIrelandCareerFutureProvenance(careerId, signal)
      assert.ok(provenance.length >= 1, `${careerId}:${signal}`)
      for (const row of provenance) {
        assert.ok(row.evidenceKey.length > 0)
        assert.ok(row.title.length > 0)
        assert.ok(row.publisher.length > 0)
        assert.ok(row.url.startsWith("https://"))
        assert.ok(row.referencePeriodLabel.length > 0)
        assert.ok(row.geographyLabel.length > 0)
        const rawValueFieldNames = ["rawValue", "unit", "notes", "checkedDate", "missingReason"]
        for (const field of rawValueFieldNames) {
          assert.equal(field in row, false, `raw field leaked: ${field}`)
        }
      }
    }
  }
})

test("P2.3 unavailable signals stay visible with a neutral, explicit state", () => {
  for (const careerId of SUPPORTED) {
    const intelligence = getIrelandCareerFutureIntelligence(careerId)!
    for (const signal of ["stability", "ai_exposure", "skills_change"] as const) {
      const derived = intelligence.signals[signal]
      assert.equal(derived.status, "unavailable")
      const title = futureOutlookUnavailableTitle(derived.status, "en")
      assert.ok(title)
      assert.match(title, /Not enough verified evidence/i)
      assert.ok(derived.interpretation.length > 20)
      assert.equal(derived.displayValue, null)
    }
  }
})

test("P2.3 never fabricates an aggregate Future Score or numeric rating", () => {
  const collected: string[] = []
  for (const careerId of SUPPORTED) {
    const intelligence = getIrelandCareerFutureIntelligence(careerId)!
    for (const signal of Object.values(intelligence.signals)) {
      collected.push(signal.interpretation)
      if (signal.displayValue) collected.push(signal.displayValue)
    }
  }
  for (const locale of ["en", "ko"] as const) {
    const copy = futureOutlookSectionCopy(locale)
    collected.push(copy.eyebrow, copy.title, copy.description)
    const card = futureOutlookCardCopy(locale)
    collected.push(...Object.values(card))
    for (const status of ["available", "limited", "unavailable"] as const) collected.push(futureOutlookStatusLabel(status, locale))
    for (const direction of ["positive", "mixed", "negative", "neutral", "unknown"] as const) {
      const label = futureOutlookDirectionLabel(direction, locale)
      if (label) collected.push(label)
    }
    for (const confidence of ["verified", "estimated", "limited_evidence", "unavailable"] as const) collected.push(futureOutlookConfidenceLabel(confidence, locale))
    collected.push(futureOutlookUnavailableTitle("unavailable", locale) ?? "")
    collected.push(futureOutlookAiExposureBoundary(locale))
  }

  for (const text of collected) {
    assert.doesNotMatch(text, /\d+\s*\/\s*100/i, text)
    assert.doesNotMatch(text, /\d+\s*\/\s*10\b/i, text)
    assert.doesNotMatch(text, /\bstrong buy\b|\brecommended\b|\bgreat career\b/i, text)
    assert.doesNotMatch(text, /\b(?:8[0-9]|9[0-9])\s*(?:%|점|pts|score)\b/i, text)
  }

  for (const text of collected.filter((line) => /score/i.test(line))) {
    assert.match(text, /not a score|seventh score|total score|no score|or score/i)
  }
})

test("P2.3 CampCareer Score stays the only public score on the Career Page", () => {
  const allFutureCopy: string[] = []
  for (const locale of ["en", "ko"] as const) {
    const copy = futureOutlookSectionCopy(locale)
    allFutureCopy.push(copy.eyebrow, copy.title, copy.description)
    allFutureCopy.push(futureOutlookAiExposureBoundary(locale))
    allFutureCopy.push(...Object.values(futureOutlookCardCopy(locale)))
  }
  for (const text of allFutureCopy) {
    assert.doesNotMatch(text, /campcareer\s*score/i)
  }
})

test("P2.3 AI exposure copy is task exposure, never disappearance or layoff odds", () => {
  const boundaryEn = futureOutlookAiExposureBoundary("en")
  const boundaryKo = futureOutlookAiExposureBoundary("ko")
  assert.match(boundaryEn, /degree to which/i)
  assert.match(boundaryEn, /not a probability/i)
  assert.match(boundaryKo, /확률/i)

  for (const careerId of SUPPORTED) {
    const intelligence = getIrelandCareerFutureIntelligence(careerId)!
    const interpretation = intelligence.signals.ai_exposure.interpretation
    assert.doesNotMatch(interpretation, /job disappears|job disappearance|layoff prob|will be replaced|automation probability/i)
    assert.match(interpretation, /not a disappearance probability/i)
  }
})

test("P2.3 every signal exposes reference period and geography", () => {
  for (const careerId of SUPPORTED) {
    const intelligence = getIrelandCareerFutureIntelligence(careerId)!
    for (const signal of Object.values(intelligence.signals)) {
      assert.ok(signal.geography)
      assert.ok(signal.referencePeriod)
      assert.ok(signal.referencePeriod.label.length > 0)
      const meta = futureOutlookPeriodAndGeography(signal)
      assert.ok(meta)
      assert.ok(meta.length > 0)
    }
  }
})

test("P2.3 proxy and broader-group boundaries are surfaced, never hidden", () => {
  const closeProxies = ["cybersecurity-analyst", "data-engineer", "construction-manager"]
  for (const careerId of closeProxies) {
    const intelligence = getIrelandCareerFutureIntelligence(careerId)!
    assert.equal(intelligence.signals.demand.proxyDisclosure, "proxy")
    assert.ok(futureOutlookProxyNote(intelligence.signals.demand.proxyDisclosure, "en"))
    const provenance = getIrelandCareerFutureProvenance(careerId, "demand")
    assert.ok(provenance.every((row) => ["proxy", "broader_proxy"].includes(row.proxyDisclosure)))
  }

  const direct = getIrelandCareerFutureIntelligence("software-developer")!
  assert.equal(direct.signals.demand.proxyDisclosure, "exact")
  assert.equal(futureOutlookProxyNote(direct.signals.demand.proxyDisclosure, "en"), null)

  for (const careerId of SUPPORTED) {
    const derived = getIrelandCareerFutureIntelligence(careerId)!.signals.outlook
    assert.equal(derived.proxyDisclosure, "broader_proxy")
    assert.ok(futureOutlookProxyNote(derived.proxyDisclosure, "en"))
  }
})

test("P2.3 outlook renders as a plain, qualified direction word with a horizon", () => {
  for (const careerId of SUPPORTED) {
    const derived = getIrelandCareerFutureIntelligence(careerId)!.signals.outlook
    const direction = futureOutlookDirectionLabel(derived.direction, "en")
    assert.ok(direction)
    assert.ok(["Positive", "Mixed", "Negative", "Neutral"].includes(direction))
    assert.match(derived.displayValue ?? "", /Projected change/)
    assert.match(derived.displayValue ?? "", /2035/)
    assert.match(derived.interpretation, /directional|direction/i)
    assert.match(derived.interpretation, /not a guarantee|not a seventh score|not.*total score/i)
  }
})

test("P2.3 does not read current demand as vacancies or sector size as demand", () => {
  for (const careerId of SUPPORTED) {
    const intelligence = getIrelandCareerFutureIntelligence(careerId)!
    for (const signal of ["demand", "growth"] as const) {
      const text = `${intelligence.signals[signal].displayValue ?? ""} ${intelligence.signals[signal].interpretation}`
      assert.match(text, /not a current[- ]vacancy|not a forward projection|historical|not a job guarantee/i)
    }
  }
})

test("P2.3 scope stays confined to the Future outlook surface", () => {
  const copy: string[] = []
  for (const locale of ["en", "ko"] as const) {
    const copyEn = futureOutlookSectionCopy(locale)
    copy.push(copyEn.title, copyEn.description)
    for (const signal of CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS) {
      copy.push(futureOutlookSignalMeaning(signal))
      copy.push(...futureOutlookSignalDoesNotMean(signal))
      copy.push(futureOutlookSignalUserFacingBoundary(signal))
    }
    copy.push(futureOutlookAiExposureBoundary(locale))
  }
  for (const text of copy) {
    assert.doesNotMatch(text, /visa sponsorship|program listings|employer detail page|study programme|global jobs board/i)
  }
})

test("P2.3 label maps are total and never render blank content", () => {
  for (const locale of ["en", "ko"] as const) {
    for (const status of ["available", "limited", "unavailable"] as const) {
      assert.ok(futureOutlookStatusLabel(status, locale).length > 0)
    }
    for (const direction of ["positive", "mixed", "negative", "neutral"] as const) {
      assert.ok(futureOutlookDirectionLabel(direction, locale)!.length > 0)
    }
    assert.equal(futureOutlookDirectionLabel("unknown", locale), null)
    for (const confidence of ["verified", "estimated", "limited_evidence", "unavailable"] as const) {
      assert.ok(futureOutlookConfidenceLabel(confidence, locale).length > 0)
    }
    for (const careerId of SUPPORTED) {
      assert.equal(futureOutlookSectionVisible("IE", careerId), true)
    }
  }
  assert.equal(FUTURE_OUTLOOK_SIGNAL_ORDER.length, 6)
})