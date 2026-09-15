import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS,
} from "@/lib/career-future-intelligence-contract"
import {
  buildIrelandFutureCompareRows,
  futureCompareSectionVisible,
} from "@/lib/career-future-compare"
import {
  FUTURE_FILTER_COUNTRY_CODE,
  FUTURE_FILTER_TOKENS,
  futurePreviewForCareer,
  parseFutureFilter,
} from "@/lib/career-future-discovery"
import {
  getIrelandCareerFutureIntelligence,
  getIrelandCareerFutureProvenance,
  IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS,
  isIrelandCareerFutureCareerId,
} from "@/lib/career-future-intelligence-model"
import {
  futureOutlookAiExposureBoundary,
  futureOutlookSectionVisible,
  futureOutlookSignalName,
  futureOutlookUnavailableTitle,
  FUTURE_OUTLOOK_SIGNAL_ORDER,
} from "@/lib/career-future-intelligence-ui"
import {
  IE_CAREER_COMPARE_IDS,
  IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR,
  type IrelandCareerCompareId,
} from "@/lib/ireland-career-comparison"
import { IRELAND_CAREER_FUTURE_EVIDENCE, IRELAND_FUTURE_CAREER_IDS } from "@/data/ireland-career-future-evidence"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const SUPPORTED = [...IE_CAREER_COMPARE_IDS]
const UNSUPPORTED = ["nurse", "lawyer", "teacher", "bricklayer", "not-a-career"]

test("P2.5 cohort 1: exactly six Careers, one source of truth, no expansion", () => {
  assert.equal(IE_CAREER_COMPARE_IDS.length, 6)
  assert.equal(new Set(IE_CAREER_COMPARE_IDS).size, 6)
  assert.deepEqual([...IRELAND_CAREER_FUTURE_MODEL_CAREER_IDS], [...IE_CAREER_COMPARE_IDS])
  assert.deepEqual([...IRELAND_FUTURE_CAREER_IDS], [...IE_CAREER_COMPARE_IDS])
  for (const id of UNSUPPORTED) assert.equal(isIrelandCareerFutureCareerId(id), false)
})

test("P2.5 signals 2: exactly six signal keys, consistent across contract, order and model", () => {
  assert.equal(CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS.length, 6)
  assert.equal(new Set(CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS).size, 6)
  assert.deepEqual([...FUTURE_OUTLOOK_SIGNAL_ORDER], [...CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS])
  for (const id of SUPPORTED) {
    const record = getIrelandCareerFutureIntelligence(id)
    assert.ok(record)
    assert.deepEqual(Object.keys(record.signals).sort(), [...CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS].sort())
  }
})

test("P2.5 traceability 3: derived signals and provenance stay linked to raw evidence", () => {
  const evidenceByCareer = new Map(IRELAND_CAREER_FUTURE_EVIDENCE.map((record) => [record.careerId, record]))
  for (const id of SUPPORTED) {
    const record = evidenceByCareer.get(id)
    assert.ok(record, `raw evidence exists for ${id}`)
    const rawKeys = new Set(record.rawEvidence.map((entry) => entry.evidenceKey))
    const derived = getIrelandCareerFutureIntelligence(id)
    assert.ok(derived)
    for (const key of CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS) {
      const signal = derived.signals[key]
      for (const evidenceKey of signal.evidenceKeys) {
        assert.ok(rawKeys.has(evidenceKey), `${id}.${key} evidenceKey ${evidenceKey} resolves to raw evidence`)
      }
    }
    const outlookKeys = derived.signals.outlook.evidenceKeys
    assert.ok(outlookKeys.includes(derived.signals.demand.evidenceKeys[0]), "outlook retains demand reference")
    assert.ok(outlookKeys.includes(derived.signals.growth.evidenceKeys[0]), "outlook retains growth reference")
    for (const key of CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS) {
      const provenance = getIrelandCareerFutureProvenance(id, key)
      for (const row of provenance) {
        assert.ok(rawKeys.has(row.evidenceKey), `provenance ${row.evidenceKey} for ${id}.${key} resolves`)
      }
    }
  }
})

test("P2.5 4: no numeric Future Score anywhere in the model", () => {
  for (const id of SUPPORTED) {
    const record = IRELAND_CAREER_FUTURE_EVIDENCE.find((candidate) => candidate.careerId === id)
    assert.ok(record)
    assert.equal(record.normalizedSignals, null)
    const derived = getIrelandCareerFutureIntelligence(id)
    assert.ok(derived)
    for (const key of CAREER_FUTURE_INTELLIGENCE_SIGNAL_KEYS) {
      const value = derived.signals[key].displayValue
      assert.ok(value === null || typeof value === "string", `${id}.${key} displayValue is never numeric`)
    }
  }
})

test("P2.5 5: missing evidence remains unavailable, never zero or negative", () => {
  for (const id of SUPPORTED) {
    const derived = getIrelandCareerFutureIntelligence(id)
    assert.ok(derived)
    for (const key of ["stability", "ai_exposure", "skills_change"] as const) {
      const signal = derived.signals[key]
      assert.equal(signal.status, "unavailable", `${id}.${key} status unavailable`)
      assert.equal(signal.direction, "unknown", `${id}.${key} direction unknown`)
      assert.equal(signal.confidence, "unavailable", `${id}.${key} confidence unavailable`)
      assert.equal(signal.displayValue, null, `${id}.${key} no fallback value`)
    }
    const raw = IRELAND_CAREER_FUTURE_EVIDENCE.find((candidate) => candidate.careerId === id)
    assert.ok(raw)
    for (const entry of raw.rawEvidence.filter((item) => item.signal === "stability" || item.signal === "ai_exposure" || item.signal === "skills_change")) {
      assert.equal(entry.availability, "missing")
      assert.equal(entry.rawValue, null)
      assert.ok(entry.missingReason?.trim(), `${id} missing evidence carries a reason`)
    }
  }
  assert.equal(futureOutlookUnavailableTitle("unavailable", "en"), "Not enough verified evidence")
})

test("P2.5 6: proxy evidence remains explicit through the derived model", () => {
  const demandExpected = new Map<IrelandCareerCompareId, string>([
    ["software-developer", "exact"],
    ["civil-engineer", "exact"],
    ["radiographer", "exact"],
    ["cybersecurity-analyst", "proxy"],
    ["data-engineer", "proxy"],
    ["construction-manager", "proxy"],
  ])
  for (const id of SUPPORTED) {
    const derived = getIrelandCareerFutureIntelligence(id)
    assert.ok(derived)
    const demandDisclosure = derived.signals.demand.proxyDisclosure !== "none"
    assert.ok(demandDisclosure, `${id} demand carries a disclosure`)
    const raw = IRELAND_CAREER_FUTURE_EVIDENCE.find((candidate) => candidate.careerId === id)
    assert.ok(raw)
    const growthRaw = raw.rawEvidence.find((entry) => entry.signal === "growth")
    assert.ok(growthRaw)
    const expectedProxy = demandExpected.get(id) === "proxy"
    if (expectedProxy) {
      assert.ok(["proxy", "broader_proxy"].includes(derived.signals.demand.proxyDisclosure), `${id} demand proxy is labelled`)
      assert.notEqual(growthRaw.occupation?.relation, "exact", `${id} growth is not exact`)
    } else {
      assert.equal(derived.signals.demand.proxyDisclosure, "exact", `${id} demand is direct`)
    }
  }
  for (const id of ["cybersecurity-analyst", "data-engineer", "construction-manager"] as const) {
    const derived = getIrelandCareerFutureIntelligence(id)
    assert.ok(derived)
    assert.ok(["proxy", "broader_proxy"].includes(derived.signals.growth.proxyDisclosure), `${id} growth carries a proxy disclosure`)
  }
})

test("P2.5 7: Career detail integration exists and gates on IE cohort", () => {
  const page = read("src/app/(workspace)/career/[country]/[career]/page.tsx")
  assert.ok(page.includes("IrelandCareerFutureOutlook"), "career page renders the Future outlook section")
  for (const id of SUPPORTED) {
    assert.equal(futureOutlookSectionVisible("IE", id), true, `future section visible for ${id}`)
  }
  for (const code of ["CA", "AU", "US", "KR", "GB", "DE"]) {
    assert.equal(futureOutlookSectionVisible(code, "software-developer"), false, `never gated on ${code}`)
  }
  for (const id of UNSUPPORTED) assert.equal(futureOutlookSectionVisible("IE", id), false)
})

test("P2.5 8: Ireland discovery integration exists with deterministic filters", () => {
  const explorer = read("src/app/(workspace)/occupation/occupation-explorer.tsx")
  assert.ok(explorer.includes("futureFilterActiveNote"), "explorer imports the future filter")
  assert.ok(explorer.includes("parseFutureFilter"), "explorer parses the future query param")
  assert.equal(FUTURE_FILTER_COUNTRY_CODE, "IE")
  for (const id of SUPPORTED) {
    assert.ok(futurePreviewForCareer(id, "en"), `preview present for ${id}`)
  }
  for (const id of UNSUPPORTED) assert.equal(futurePreviewForCareer(id, "en"), null, `${id} never previews`)
  for (const token of FUTURE_FILTER_TOKENS) {
    assert.equal(parseFutureFilter(token), token, `${token} round-trips`)
  }
  assert.equal(parseFutureFilter("demand_POSITIVE"), null)
  assert.equal(parseFutureFilter("demand_positive,outlook_positive"), null)
  assert.equal(parseFutureFilter("future=bogus"), null)
  assert.equal(parseFutureFilter(null), null)
  assert.equal(parseFutureFilter(undefined), null)
})

test("P2.5 9: Ireland Career Compare integration exists with six Future rows", () => {
  const matrix = read("src/app/(workspace)/compare/ireland-careers-compare-matrix.tsx")
  assert.ok(matrix.includes("buildIrelandFutureCompareRows"), "matrix imports future rows")
  assert.ok(matrix.includes("futureOutlookAiExposureBoundary"), "matrix renders the AI exposure boundary")
  const rows = buildIrelandFutureCompareRows(["software-developer", "civil-engineer"])
  assert.equal(rows.length, 6)
  const signalLabels = FUTURE_OUTLOOK_SIGNAL_ORDER.map((key) => futureOutlookSignalName(key, "en"))
  assert.deepEqual(rows.map((row) => row.label), signalLabels)
  assert.deepEqual(rows.map((row) => row.signal), [...FUTURE_OUTLOOK_SIGNAL_ORDER])
  assert.equal(futureCompareSectionVisible(["software-developer", "radiographer"]), true)
  assert.equal(futureCompareSectionVisible(["nurse", "lawyer"]), false)
  assert.equal(buildIrelandFutureCompareRows(["nurse", "lawyer"]).length, 0)
})

test("P2.5 10: AI exposure boundary remains intact", () => {
  const boundary = futureOutlookAiExposureBoundary("en")
  assert.ok(boundary.includes("not a probability of job loss"))
  assert.ok(boundary.includes("degree to which"))
  assert.ok(!boundary.includes("will disappear"))
  assert.ok(!boundary.includes("automation odds"))
})

test("P2.5 11: Pay evidence remains unchanged", () => {
  assert.equal(IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR, "€32.99/hour")
  const matrix = read("src/app/(workspace)/compare/ireland-careers-compare-matrix.tsx")
  assert.ok(matrix.includes("IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR"), "matrix still renders the pay proxy")
  assert.ok(matrix.includes("item.score.total}/100"), "CampCareer Score row still rendered")
  const futureRows = buildIrelandFutureCompareRows([...SUPPORTED])
  const labels = new Set(futureRows.map((row) => row.label))
  assert.ok(!labels.has("Pay"), "Future rows never introduce a Pay row")
  assert.ok(!labels.has("CampCareer Score"), "Future rows never introduce a Score row")
})

test("P2.5 12: SEO/noindex contracts remain intact", () => {
  const careers = read("src/app/(workspace)/careers/page.tsx")
  assert.ok(careers.includes("robots: { index: isBaseBrowse, follow: true }"), "careers base indexable, query states noindex")
  const compare = read("src/app/(workspace)/compare/page.tsx")
  assert.ok(compare.includes("robots: { index: false, follow: false }"), "compare stays noindex/nofollow")
  const compareMode = read("src/app/(workspace)/compare/[mode]/page.tsx")
  assert.ok(compareMode.includes("index: false, follow: false"), "compare mode stays noindex")
  const sitemap = read("src/app/sitemap.ts")
  assert.ok(sitemap.includes("${SITE_URL}/careers`"), "sitemap keeps the plain careers route")
  assert.ok(!sitemap.includes("?future="), "no Future query permutations in sitemap")
  assert.ok(!sitemap.includes("careers?country"), "no careers query permutations in sitemap")
  assert.ok(!sitemap.includes("/compare"), "compare absent from sitemap")
})

test("P2.5 13: CampCareer Score unchanged", () => {
  const score = read("src/lib/campcareer-score.ts")
  assert.ok(score.includes('"campcareer-score-v1"'), "score version constant unchanged")
  const careerPage = read("src/app/(workspace)/career/[country]/[career]/page.tsx")
  assert.ok(careerPage.includes("CampCareerScoreHero"), "score hero still on the Career Page")
  const derived = getIrelandCareerFutureIntelligence("software-developer")
  assert.ok(derived)
  assert.ok(Object.keys(derived).every((key) => key !== "score"), "future model never carries a score")
  assert.ok(Object.keys(derived.signals).every((key) => key !== "score"), "signals never carry a score")
})

test("P2.5 14: no Career/Employer/Programme expansion from P2", () => {
  assert.equal(IRELAND_CAREER_FUTURE_EVIDENCE.length, 6)
  assert.equal(buildIrelandFutureCompareRows(["software-developer", "civil-engineer", "nurse"]).length, 6)
  const matrix = read("src/app/(workspace)/compare/ireland-careers-compare-matrix.tsx")
  assert.ok(matrix.includes("IE_CAREER_COMPARE_IDS.map"), "compare options derive only from the six")
  const explorer = read("src/app/(workspace)/occupation/occupation-explorer.tsx")
  assert.ok(explorer.includes("FUTURE_FILTER_COUNTRY_CODE"), "future filter gates on IE only")
})