import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  degreeMatchBoundaryNote,
  degreeMatchCareerOutlook,
  degreeMatchConfidenceLabel,
  degreeMatchDegreeDetailPath,
  degreeMatchEducationDegrees,
  degreeMatchQualificationLabel,
  degreeMatchRegulationNote,
  degreeMatchRelationshipTypeLabel,
  degreeMatchReverseSectionCopy,
  degreeMatchSectionCopy,
  degreeMatchSectionVisible,
  degreeMatchStrengthLabel,
} from "@/lib/degree-match/ireland-degree-match-ui"
import {
  getIrelandCareerDegreeMatches,
  getIrelandDegreeCareerMatches,
  IRELAND_DEGREE_MATCH_MODEL,
} from "@/lib/degree-match/ireland-model"
import {
  IE_CAREER_COMPARE_IDS,
  type IrelandCareerCompareId,
} from "@/lib/ireland-career-comparison"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const SUPPORTED = [...IE_CAREER_COMPARE_IDS]
const UNSUPPORTED = ["nurse", "lawyer", "teacher", "bricklayer", "not-a-career"]

const relationDegree = new Map([
  ["software-developer", "computer-science"],
  ["cybersecurity-analyst", "cybersecurity"],
  ["data-engineer", "data-science"],
  ["civil-engineer", "civil-engineering"],
  ["construction-manager", "construction-management"],
  ["radiographer", "diagnostic-radiography"],
])

test("P3.3 1: Career → Degree UI renders only for the six Ireland relations", () => {
  for (const careerId of SUPPORTED) {
    assert.equal(degreeMatchSectionVisible("IE", careerId), true, `${careerId} section visible`)
    assert.equal(getIrelandCareerDegreeMatches(careerId).length, 1)
  }
  for (const code of ["CA", "AU", "US", "KR", "GB", "DE"]) {
    assert.equal(degreeMatchSectionVisible(code, "software-developer"), false, `never gated on ${code}`)
  }
  for (const careerId of UNSUPPORTED) assert.equal(degreeMatchSectionVisible("IE", careerId), false)
  const sections = read("src/app/(workspace)/career/career-core-sections.tsx")
  assert.ok(sections.includes("CareerDegreeMatchSection"), "career page renders the Degree Match section")
})

test("P3.3 2: UI consumes the P3.2 derived model, not raw P3.1 evidence", () => {
  const careerSection = read("src/app/(workspace)/career/career-degree-match-section.tsx")
  const educationSection = read("src/app/(workspace)/countries/ie/education/degree-match-section.tsx")
  const ui = read("src/lib/degree-match/ireland-degree-match-ui.ts")
  for (const source of [careerSection, educationSection, ui]) {
    assert.ok(source.includes("ireland-model"), "consumes the derived P3.2 model")
    assert.ok(!source.includes("ireland-evidence"), "never consumes raw P3.1 evidence")
  }
  assert.ok(careerSection.includes("getIrelandCareerDegreeMatches"))
  assert.ok(educationSection.includes("getIrelandDegreeCareerMatches"))
})

test("P3.3 3: relationship type, strength and confidence render distinctly", () => {
  const radiographer = getIrelandCareerDegreeMatches("radiographer")[0]
  const typeLabel = degreeMatchRelationshipTypeLabel(radiographer.relationshipType, "en")
  const strengthLabel = degreeMatchStrengthLabel(radiographer.relationshipStrength, "en")
  const confidenceLabel = degreeMatchConfidenceLabel(radiographer.confidence, "en")
  assert.equal(typeLabel, "Direct pathway")
  assert.equal(strengthLabel, "Strong relationship")
  assert.equal(confidenceLabel, "Verified evidence")
  assert.notEqual(typeLabel, strengthLabel)
  assert.notEqual(strengthLabel, confidenceLabel)
  assert.ok(degreeMatchSectionCopy("en").title.includes("What should I study"))
  assert.ok(degreeMatchSectionCopy("ko").title.includes("무엇을 공부"))
})

test("P3.3 4: no numeric Match Score exists in the UI surfaces", () => {
  for (const source of [
    read("src/lib/degree-match/ireland-degree-match-ui.ts"),
    read("src/app/(workspace)/career/career-degree-match-section.tsx"),
    read("src/app/(workspace)/countries/ie/education/degree-match-section.tsx"),
  ]) {
    assert.doesNotMatch(source, /% match|percentile|Best degree|Perfect fit|Recommended #1/i)
  }
  for (const result of IRELAND_DEGREE_MATCH_MODEL) {
    assert.equal("score" in result, false)
    assert.equal("percentage" in result, false)
  }
})

test("P3.3 5: Degree ≠ Programme boundary remains intact", () => {
  const boundary = degreeMatchBoundaryNote("en")
  assert.ok(boundary.includes("field of study"))
  assert.ok(boundary.includes("not a specific university programme"))
  for (const result of IRELAND_DEGREE_MATCH_MODEL) {
    assert.equal("programmeId" in result, false)
    assert.equal("institutionId" in result, false)
  }
  const careerSection = read("src/app/(workspace)/career/career-degree-match-section.tsx")
  assert.doesNotMatch(careerSection, /programmeId|institutionId|\/programs\//)
})

test("P3.3 6: Radiographer retains registration / professional requirement context", () => {
  const radiographer = getIrelandCareerDegreeMatches("radiographer")[0]
  assert.equal(radiographer.regulation.regulatedCareer, true)
  assert.equal(radiographer.regulation.registrationRequired, true)
  assert.equal(degreeMatchQualificationLabel(radiographer.additionalQualification.state, "en"), "Professional registration required in Ireland")
  assert.ok(degreeMatchRegulationNote("en"))
  const section = read("src/app/(workspace)/career/career-degree-match-section.tsx")
  assert.ok(section.includes("degreeMatchRegulationNote"), "regulation note rendered on cards")
  assert.ok(radiographer.regulation.summary.includes("does not grant permission to practise"))
})

test("P3.3 7: non-regulated tech Careers never imply a legally mandatory Degree", () => {
  for (const careerId of ["software-developer", "cybersecurity-analyst", "data-engineer"]) {
    const match = getIrelandCareerDegreeMatches(careerId)[0]
    assert.equal(match.regulation.regulatedCareer, false)
    assert.equal(match.regulation.registrationRequired, false)
    assert.ok(match.regulation.summary.includes("Not regulated"))
    const label = degreeMatchQualificationLabel(match.additionalQualification.state, "en").toLowerCase()
    assert.ok(label.includes("no verified mandatory"), `${careerId} qualification wording stays non-mandatory`)
    assert.ok(!label.includes("required to practise"), `${careerId} never implies a legal Degree`)
  }
})

test("P3.3 8: Degree → Career reverse journey uses the P3.2 reverse API", () => {
  for (const [careerId, degreeId] of relationDegree) {
    const fromDegree = getIrelandDegreeCareerMatches(degreeId)
    assert.equal(fromDegree.length, 1)
    assert.equal(fromDegree[0].careerId, careerId)
  }
  const educationSection = read("src/app/(workspace)/countries/ie/education/degree-match-section.tsx")
  assert.ok(educationSection.includes("getIrelandDegreeCareerMatches"))
  assert.equal(getIrelandDegreeCareerMatches("nonsense-degree").length, 0)
})

test("P3.3 9: Career links are canonical", () => {
  const educationSection = read("src/app/(workspace)/countries/ie/education/degree-match-section.tsx")
  assert.ok(educationSection.includes("careerCanonicalPath"), "education hub links via canonical resolver")
  assert.ok(!educationSection.includes("occupationCanonicalPath") && !educationSection.includes("careers?"))
  const careerSection = read("src/app/(workspace)/career/career-degree-match-section.tsx")
  assert.ok(careerSection.includes("degreeMatchDegreeDetailPath"), "career card links via the degree detail path")
})

test("P3.3 10: Country = IE context is preserved", () => {
  assert.equal(degreeMatchDegreeDetailPath("computer-science"), "/countries/ie/education#degree-computer-science")
  assert.equal(degreeMatchDegreeDetailPath("unrelated"), null)
  for (const result of IRELAND_DEGREE_MATCH_MODEL) assert.equal(result.countryCode, "IE")
  const educationPage = read("src/app/(workspace)/countries/ie/education/page.tsx")
  assert.ok(educationPage.includes('canonical: "/countries/ie/education"'), "education hub keeps its canonical path")
})

test("P3.3 11: P2 Future Intelligence remains a separate data source", () => {
  const outlook = degreeMatchCareerOutlook("software-developer", "en")
  assert.ok(outlook.some((part) => part.startsWith("Outlook:")))
  assert.ok(outlook.some((part) => part.startsWith("Demand:")))
  const ui = read("src/lib/degree-match/ireland-degree-match-ui.ts")
  assert.ok(ui.includes("career-future-intelligence-model"), "P2 read imports the P2 model")
  assert.ok(!ui.includes("IRELAND_CAREER_FUTURE_EVIDENCE"), "reads derived P2, never raw evidence")
})

test("P3.3 12: existing Career Future Outlook remains intact", () => {
  const careerPage = read("src/app/(workspace)/career/[country]/[career]/page.tsx")
  assert.ok(careerPage.includes("IrelandCareerFutureOutlook"), "career page still renders Future Outlook")
  assert.ok(!careerPage.includes(`dynamic = "force-static"`))
})

test("P3.3 13: existing Compare continuation remains intact", () => {
  const actions = read("src/app/(workspace)/career/career-result-actions.tsx")
  assert.ok(actions.includes("Compare"), "career page Compare action retained")
  const matrix = read("src/app/(workspace)/compare/ireland-careers-compare-matrix.tsx")
  assert.ok(matrix.includes("buildIrelandFutureCompareRows"), "compare matrix keeps future rows")
  assert.ok(matrix.includes("IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR"), "compare keeps pay proxy")
})

test("P3.3 14: no Career/Degree/Institution/Programme cohort expansion", () => {
  assert.equal(IRELAND_DEGREE_MATCH_MODEL.length, 6)
  assert.equal(degreeMatchEducationDegrees().length, 6)
  for (const careerId of UNSUPPORTED) {
    assert.equal(getIrelandCareerDegreeMatches(careerId).length, 0)
    assert.equal(degreeMatchSectionVisible("IE", careerId), false)
  }
  const educationSection = read("src/app/(workspace)/countries/ie/education/degree-match-section.tsx")
  assert.ok(educationSection.includes("IRELAND_DEGREE_MATCH_MODEL.map"), "one card per Degree model row")
  assert.ok(educationSection.includes("degree-${result.degreeId}"), "each Degree card carries a stable anchor")
})

test("P3.3 15: no new Programme publication or Programme routes", () => {
  const educationSection = read("src/app/(workspace)/countries/ie/education/degree-match-section.tsx")
  assert.doesNotMatch(educationSection, /href=["']\/programs/)
  assert.doesNotMatch(educationSection, /programme|program listing/i)
  const careerSection = read("src/app/(workspace)/career/career-degree-match-section.tsx")
  assert.doesNotMatch(careerSection, /href=["']\/programs/)
})

test("P3.3 16: mobile structure avoids horizontal overflow", () => {
  for (const source of [
    read("src/app/(workspace)/career/career-degree-match-section.tsx"),
    read("src/app/(workspace)/countries/ie/education/degree-match-section.tsx"),
  ]) {
    assert.ok(source.includes("flex-wrap"), "wraps instead of scrolling")
    assert.ok(source.includes("grid gap"), "stacked grid layout")
    assert.doesNotMatch(source, /overflow-x/ )
    assert.doesNotMatch(source, /grid-cols-\[|min-w-\[|table\b/)
  }
  const ui = read("src/lib/degree-match/ireland-degree-match-ui.ts")
  assert.doesNotMatch(ui, /min-w-\[|grid-cols-\[/)
})

test("P3.3 17: SEO / indexability contracts remain unchanged", () => {
  const careerPage = read("src/app/(workspace)/career/[country]/[career]/page.tsx")
  assert.ok(careerPage.includes("getIndexableCareerRoute"), "career robots still gated")
  assert.ok(careerPage.includes("canonical"), "Career canonical stays")
  const educationPage = read("src/app/(workspace)/countries/ie/education/page.tsx")
  assert.ok(educationPage.includes("robots: { index: true, follow: true }"), "education hub stays indexable")
  assert.ok(educationPage.includes('alternates: { canonical: "/countries/ie/education" }'))
  const sitemap = read("src/app/sitemap.ts")
  assert.ok(sitemap.includes("/countries/ie/education"), "education hub still in sitemap")
  assert.doesNotMatch(sitemap, /degree-match|degree=|\/degree\//)
  const docs = read("docs/P3_3_DEGREE_MATCH_UI.md")
  assert.ok(docs.includes("/degree/[slug]"), "degree-route decision documented")
  assert.ok(docs.includes("invent a Degree route"), "no invented Degree route documented")
})