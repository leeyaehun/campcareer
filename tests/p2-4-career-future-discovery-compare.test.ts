import assert from "node:assert/strict"
import test from "node:test"

import {
  buildIrelandFutureCompareRows,
  futureCompareCellText,
  futureCompareSectionVisible,
  FUTURE_OUTLOOK_SIGNAL_ORDER,
} from "@/lib/career-future-compare"
import {
  FUTURE_FILTER_COUNTRY_CODE,
  FUTURE_FILTER_GROUPS,
  futureFilterActiveNote,
  futureFilterGroupLabel,
  futureFilterHiddenCareerIds,
  futureFilterHiddenNote,
  futureFilterMatchCount,
  futureFilterMatchesCareer,
  futureFilterTokenLabel,
  FUTURE_FILTER_TOKENS,
  futurePreviewForCareer,
  parseFutureFilter,
} from "@/lib/career-future-discovery"
import { getIrelandCareerFutureIntelligence, IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS } from "@/lib/career-future-intelligence-model"
import { futureOutlookAiExposureBoundary, futureOutlookSignalName } from "@/lib/career-future-intelligence-ui"
import { IE_CAREER_COMPARE_IDS } from "@/lib/ireland-career-comparison"

const SUPPORTED = [...IE_CAREER_COMPARE_IDS]
const UNSUPPORTED = ["nurse", "lawyer", "teacher", "not-a-career", "bricklayer"]

function futureMatches(token: (typeof FUTURE_FILTER_TOKENS)[number]): string[] {
  return SUPPORTED.filter((careerId) => futureFilterMatchesCareer(careerId, token))
}

function futureCopyForScan(): string[] {
  const copy: string[] = []
  for (const token of FUTURE_FILTER_TOKENS) {
    copy.push(token)
    copy.push(futureFilterTokenLabel(token, "en"))
    copy.push(futureFilterTokenLabel(token, "ko"))
  }
  for (const locale of ["en", "ko"] as const) {
    for (const group of FUTURE_FILTER_GROUPS) {
      copy.push(futureFilterGroupLabel(group.key, locale))
    }
    copy.push(futureFilterActiveNote(locale))
  }
  for (const careerId of SUPPORTED) {
    for (const locale of ["en", "ko"] as const) {
      const preview = futurePreviewForCareer(careerId, locale)
      if (preview) copy.push(preview)
    }
  }
  return copy
}

test("P2.4 cohort is exactly the six reviewed Ireland careers with no expansion", () => {
  assert.equal(IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS.length, 6)
  assert.deepEqual([...IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS].sort(), [...SUPPORTED].sort())
  assert.equal(FUTURE_FILTER_COUNTRY_CODE, "IE")
})

test("P2.4 filters never apply to unsupported careers", () => {
  for (const careerId of UNSUPPORTED) {
    for (const token of FUTURE_FILTER_TOKENS) {
      assert.equal(futureFilterMatchesCareer(careerId, token), false, `${careerId}:${token}`)
    }
    assert.equal(futurePreviewForCareer(careerId, "en"), null, careerId)
  }
})

test("P2.4 filters consume derived P2.2 categories, never raw evidence", () => {
  for (const careerId of SUPPORTED) {
    const signals = getIrelandCareerFutureIntelligence(careerId)!.signals
    for (const token of FUTURE_FILTER_TOKENS) {
      const matches = futureFilterMatchesCareer(careerId, token)
      if (!matches) continue
      const signal = token.startsWith("outlook") ? signals.outlook : signals.demand
      if (token === "demand_limited_evidence") assert.equal(signal.status, "limited", `${careerId}:${token}`)
      else if (token.endsWith("_positive")) assert.equal(signal.direction, "positive", `${careerId}:${token}`)
      else if (token.endsWith("_mixed")) assert.equal(signal.direction, "mixed", `${careerId}:${token}`)
      else if (token.endsWith("_unavailable")) assert.equal(signal.status, "unavailable", `${careerId}:${token}`)
    }
  }
})

test("P2.4 filter membership matches the derived model's known values", () => {
  assert.deepEqual([...futureMatches("demand_positive")].sort(), [...SUPPORTED].sort())
  assert.deepEqual([...futureMatches("demand_limited_evidence")].sort(), ["construction-manager", "cybersecurity-analyst", "data-engineer"].sort())
  assert.equal(futureMatches("demand_mixed").length, 0)
  assert.deepEqual([...futureMatches("outlook_positive")].sort(), [...SUPPORTED].sort())
  assert.equal(futureMatches("outlook_mixed").length, 0)
  assert.equal(futureMatches("outlook_unavailable").length, 0)
  assert.equal(futureFilterMatchCount("demand_limited_evidence"), 3)
  assert.equal(futureFilterMatchCount("outlook_unavailable"), 0)
})

test("P2.4 missing evidence is explicit, never negative or absent", () => {
  const hidden = futureFilterHiddenCareerIds("outlook_positive")
  assert.equal(hidden.length, 0)
  assert.equal(futureFilterHiddenCareerIds("outlook_unavailable").length, SUPPORTED.length)
  const unavailableCell = futureCompareCellText(getIrelandCareerFutureIntelligence("software-developer")!.signals.ai_exposure)
  const positiveCell = futureCompareCellText(getIrelandCareerFutureIntelligence("software-developer")!.signals.outlook)
  assert.match(unavailableCell, /Unavailable · Not enough verified evidence/)
  assert.doesNotMatch(unavailableCell, /negative|poor|bad|weak/i)
  assert.match(positiveCell, /Positive · Estimated evidence · Broader occupation-group proxy evidence/)
})

test("P2.4 deterministic, shareable filter query state", () => {
  for (const token of FUTURE_FILTER_TOKENS) {
    assert.equal(parseFutureFilter(token), token)
    assert.match(token, /^[a-z][a-z0-9_]{0,39}$/)
  }
  assert.equal(parseFutureFilter(undefined), null)
  assert.equal(parseFutureFilter(""), null)
  assert.equal(parseFutureFilter("demand_POSITIVE"), null)
  assert.equal(parseFutureFilter("demand-positive"), null)
  assert.equal(parseFutureFilter("outlook_positive "), null)
  assert.equal(parseFutureFilter("demand_positive,outlook_positive"), null)
})

test("P2.4 no numeric Future Score, rating or ranking copy anywhere", () => {
  const copy = futureCopyForScan()
  for (const careerId of SUPPORTED) {
    const intelligence = getIrelandCareerFutureIntelligence(careerId)!
    for (const signal of FUTURE_OUTLOOK_SIGNAL_ORDER) {
      copy.push(futureCompareCellText(intelligence.signals[signal]))
      copy.push(intelligence.signals[signal].interpretation)
    }
  }
  for (const text of copy) {
    assert.doesNotMatch(text, /\d+\s*\/\s*100/i, text)
    assert.doesNotMatch(text, /\d+\s*\/\s*10\b/i, text)
    assert.doesNotMatch(text, /\b(?:best|winner|#1|top ranked|rank[ed]*)\b/i, text)
  }
})

test("P2.4 result-card preview is a concise Outlook + Demand line", () => {
  for (const careerId of SUPPORTED) {
    const en = futurePreviewForCareer(careerId, "en")
    const ko = futurePreviewForCareer(careerId, "ko")
    assert.ok(en, careerId)
    assert.ok(ko, careerId)
    assert.match(en, /^Outlook: Positive · Demand: Positive$/)
    assert.match(ko, /^전망: 긍정 · 수요: 긍정$/)
    assert.doesNotMatch(en, /AI exposure:/)
  }
  for (const careerId of UNSUPPORTED) {
    assert.equal(futurePreviewForCareer(careerId, "en"), null)
  }
})

test("P2.4 hidden-career note copy keeps hides visible, never silent", () => {
  assert.match(futureFilterActiveNote("en"), /Future outlook filter active/)
  assert.match(futureFilterActiveNote("ko"), /향후 전망 필터/)
  assert.match(futureFilterHiddenNote(2, "en") ?? "", /Hiding 2/)
  assert.match(futureFilterHiddenNote(1, "en") ?? "", /career\b/)
  assert.equal(futureFilterHiddenNote(0, "en"), null)
  assert.equal(futureFilterHiddenNote(0, "ko"), null)
})

test("P2.4 Compare Future outlook section renders all six rows in canonical order", () => {
  const rows = buildIrelandFutureCompareRows(["software-developer", "civil-engineer"])
  assert.equal(rows.length, 6)
  assert.deepEqual(rows.map((row) => row.signal), [...FUTURE_OUTLOOK_SIGNAL_ORDER])
  assert.deepEqual(rows.map((row) => row.label), FUTURE_OUTLOOK_SIGNAL_ORDER.map((signal) => futureOutlookSignalName(signal, "en")))
  for (const row of rows) {
    assert.equal(row.values.length, 2)
  }
  assert.equal(futureCompareSectionVisible(["software-developer"]), true)
})

test("P2.4 Compare cells consume derived model values and boundaries", () => {
  const rows = buildIrelandFutureCompareRows(["software-developer", "cybersecurity-analyst", "construction-manager"])
  const bySignal = new Map(rows.map((row) => [row.signal, row.values]))
  assert.equal(bySignal.get("demand")![0], "Positive · Verified evidence")
  assert.match(bySignal.get("demand")![1], /Positive · Estimated evidence · Nearby occupation-group proxy evidence/)
  assert.equal(bySignal.get("stability")![0], "Unavailable · Not enough verified evidence")
  assert.equal(bySignal.get("ai_exposure")![1], "Unavailable · Not enough verified evidence")
  assert.equal(bySignal.get("skills_change")![2], "Unavailable · Not enough verified evidence")
  assert.match(bySignal.get("outlook")![0], /Broader occupation-group proxy evidence/)
})

test("P2.4 unsupported careers can never enter Compare rows", () => {
  assert.deepEqual(buildIrelandFutureCompareRows(["nurse", "teacher"]), [])
  assert.equal(futureCompareSectionVisible(["nurse", "teacher"]), false)
  const mixed = buildIrelandFutureCompareRows(["software-developer", "teacher"])
  assert.equal(mixed.length, 6)
  for (const row of mixed) assert.equal(row.values.length, 1)
})

test("P2.4 Pay rows are untouched by the Future section", () => {
  const rows = buildIrelandFutureCompareRows(["software-developer", "radiographer"])
  for (const row of rows) {
    assert.doesNotMatch(row.label, /pay/i)
    for (const value of row.values) {
      assert.doesNotMatch(value, /€|salary|per hour|proxy per hour/i)
    }
  }
})

test("P2.4 AI exposure stays task exposure, never job-loss odds", () => {
  const boundary = futureOutlookAiExposureBoundary("en")
  assert.match(boundary, /degree to which/)
  assert.match(boundary, /not a probability/)
  const rows = buildIrelandFutureCompareRows(["software-developer"])
  const aiRow = rows.find((row) => row.signal === "ai_exposure")!
  for (const value of aiRow.values) {
    assert.doesNotMatch(value, /job disappears|layoff prob|will be replaced|automation probability/i)
  }
})

test("P2.4 future copy never names a competing public Career score", () => {
  for (const text of futureCopyForScan()) {
    assert.doesNotMatch(text, /job market score|career opportunity score|careermarketresults/i)
  }
})

test("P2.4 label maps are total and render in both locales", () => {
  for (const group of FUTURE_FILTER_GROUPS) {
    assert.ok(futureFilterGroupLabel(group.key, "en").length > 0)
    assert.ok(futureFilterGroupLabel(group.key, "ko").length > 0)
    for (const chip of group.tokens) {
      assert.ok(futureFilterTokenLabel(chip.token, "en").length > 0)
      assert.ok(futureFilterTokenLabel(chip.token, "ko").length > 0)
    }
  }
})