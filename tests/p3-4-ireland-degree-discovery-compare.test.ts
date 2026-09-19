import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  getIrelandDegreeCareerMatches,
  getIrelandCareerDegreeMatches,
  IRELAND_DEGREE_MATCH_MODEL,
  IRELAND_DEGREE_MATCH_MODEL_DEGREE_IDS,
} from "@/lib/degree-match/ireland-model"
import { buildIrelandDegreeDiscovery } from "@/lib/degree-match/ireland-degree-discovery"
import {
  buildIrelandDegreeCompareHref,
  IRELAND_DEGREE_COMPARE_IDS,
  IRELAND_DEGREE_COMPARE_LABELS,
  normalizeIrelandDegreeIds,
  parseIrelandDegreeComparisonState,
  replaceIrelandDegreeAtIndex,
} from "@/lib/degree-match/ireland-degree-comparison"
import {
  degreeMatchDegreeDetailPath,
} from "@/lib/degree-match/ireland-degree-match-ui"
import { IE_CAREER_COMPARE_IDS } from "@/lib/ireland-career-comparison"
import { COMPARE_MODE_NAV_ITEMS, resolveCompareModeType } from "@/lib/compare-navigation"
import { canonicalCompareModeFromLegacyType } from "@/lib/compare-routes"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const RELATION_DEGREES = [
  "computer-science",
  "cybersecurity",
  "data-science",
  "civil-engineering",
  "construction-management",
  "diagnostic-radiography",
] as const

test("P3.4 1: Degree discovery returns exactly the six-cohort Degrees", () => {
  const entries = buildIrelandDegreeDiscovery("en")
  assert.equal(entries.length, 6)
  assert.deepEqual(
    entries.map((entry) => entry.degreeId),
    IRELAND_DEGREE_MATCH_MODEL_DEGREE_IDS,
  )
  for (const degreeId of RELATION_DEGREES) {
    const entry = entries.find((item) => item.degreeId === degreeId)
    assert.ok(entry, `${degreeId} present in discovery`)
    assert.equal(entry.careers.length, 1)
  }
  assert.equal(buildIrelandDegreeDiscovery("en").length, 6)
  assert.equal(buildIrelandDegreeDiscovery("ko").length, 6)
})

test("P3.4 2: Degree discovery consumes the P3.2 derived model, never raw P3.1 evidence", () => {
  const discovery = read("src/lib/degree-match/ireland-degree-discovery.ts")
  const explorer = read("src/app/(workspace)/countries/ie/degrees/degrees-explorer.tsx")
  const page = read("src/app/(workspace)/countries/ie/degrees/page.tsx")
  for (const source of [discovery, explorer, page]) {
    assert.ok(source.includes("ireland-degree-discovery") || source.includes("ireland-model"))
    assert.ok(!source.includes("ireland-evidence"), "never reads raw P3.1 evidence")
  }
  const entries = buildIrelandDegreeDiscovery("en")
  for (const entry of entries) {
    assert.equal("score" in entry, false)
    assert.equal("percentage" in entry, false)
    for (const career of entry.careers) {
      assert.equal("evidenceReferences" in career, false)
    }
  }
})

test("P3.4 3: bidirectional Degree ↔ Career consistency holds", () => {
  for (const careerId of IE_CAREER_COMPARE_IDS) {
    const match = getIrelandCareerDegreeMatches(careerId)[0]
    const reverse = getIrelandDegreeCareerMatches(match.degreeId)
    assert.equal(reverse.length, 1)
    assert.equal(reverse[0].careerId, careerId)
  }
  const entries = buildIrelandDegreeDiscovery("en")
  for (const entry of entries) {
    for (const career of entry.careers) {
      const modelMatch = getIrelandCareerDegreeMatches(career.careerId)[0]
      assert.equal(modelMatch.degreeId, entry.degreeId, `${career.careerId} maps to ${entry.degreeId}`)
    }
  }
})

test("P3.4 4: Country context = IE is preserved across discovery and Compare", () => {
  for (const result of IRELAND_DEGREE_MATCH_MODEL) assert.equal(result.countryCode, "IE")
  for (const entry of buildIrelandDegreeDiscovery("en")) {
    assert.equal(entry.educationPath, degreeMatchDegreeDetailPath(entry.degreeId))
    assert.ok(entry.educationPath.startsWith("/countries/ie/"))
  }
  const supported = parseIrelandDegreeComparisonState(new URLSearchParams("type=degree&country=IE&degrees=computer-science,data-science"))
  assert.equal(supported.contextState, "supported")
  assert.equal(supported.countryCode, "IE")
  const unsupported = parseIrelandDegreeComparisonState(new URLSearchParams("type=degree&country=AU&degrees=computer-science,data-science"))
  assert.equal(unsupported.contextState, "unsupported")
})

test("P3.4 5: no numeric Match Score, ranking or match-percentage anywhere in P3.4", () => {
  for (const source of [
    read("src/app/(workspace)/compare/degrees-compare-matrix.tsx"),
    read("src/app/(workspace)/countries/ie/degrees/degrees-explorer.tsx"),
    read("src/app/(workspace)/countries/ie/degrees/page.tsx"),
    read("src/lib/degree-match/ireland-degree-discovery.ts"),
    read("src/lib/degree-match/ireland-degree-comparison.ts"),
  ]) {
    assert.doesNotMatch(source, /% match|percentile|Best degree|Perfect fit|Recommended #1|match.?score/i)
  }
  const matrix = read("src/app/(workspace)/compare/degrees-compare-matrix.tsx")
  assert.doesNotMatch(matrix, /salaryRange|formatMoneyRange|€\d|per hour|earnings/i)
  assert.ok(matrix.includes("renders no Degree score or ranking"))
})

test("P3.4 6: Degree Compare rows carry Careers, relationship, confidence, qualification and regulation", () => {
  const matrix = read("src/app/(workspace)/compare/degrees-compare-matrix.tsx")
  for (const label of [
    "Related careers",
    "Relationship type",
    "Relationship strength",
    "Evidence confidence",
    "Additional qualification",
    "Regulation / professional requirement",
    "Career future (related Career, not the Degree)",
  ]) {
    assert.ok(matrix.includes(label), `compare matrix renders ${label}`)
  }
})

test("P3.4 7: Career Future metrics stay labelled as belonging to the related Career", () => {
  const matrix = read("src/app/(workspace)/compare/degrees-compare-matrix.tsx")
  assert.ok(matrix.includes("Career future outlook (related Career)"))
  assert.ok(matrix.includes("Career demand (related Career)"))
  assert.ok(matrix.includes("describe the related Career"))
  const entry = buildIrelandDegreeDiscovery("en").find((item) => item.degreeId === "computer-science")
  assert.ok(entry, "computer-science discovery entry")
  const outlook = entry.careers[0].careerOutlookLabels
  assert.ok(outlook.some((part) => part.startsWith("Outlook:")))
  assert.ok(outlook.some((part) => part.startsWith("Demand:")))
  assert.ok(!outlook.some((part) => /score|salary|income/i.test(part)))
  const explored = read("src/app/(workspace)/countries/ie/degrees/degrees-explorer.tsx")
  assert.ok(explored.includes("careerOutlookLabels"))
})

test("P3.4 8: Degree ≠ Programme — no Programme identity and no Programme publication", () => {
  for (const source of [
    read("src/app/(workspace)/compare/degrees-compare-matrix.tsx"),
    read("src/app/(workspace)/countries/ie/degrees/degrees-explorer.tsx"),
    read("src/app/(workspace)/countries/ie/degrees/page.tsx"),
    read("src/lib/degree-match/ireland-degree-discovery.ts"),
  ]) {
    assert.doesNotMatch(source, /programmeId|institutionId|program listing/i)
    assert.doesNotMatch(source, /href=["']\/programs/)
  }
  const entry = buildIrelandDegreeDiscovery("en").find((item) => item.degreeId === "computer-science")
  assert.ok(entry, "computer-science discovery entry")
  assert.ok(entry.degreeLabel.includes("Computer Science"), "compares canonical Degrees, not university Programmes")
})

test("P3.4 9: Degree Compare supports exactly the six Degrees and rejects everything else", () => {
  assert.equal(IRELAND_DEGREE_COMPARE_IDS.length, 6)
  const supported = new Set(IRELAND_DEGREE_COMPARE_IDS)
  for (const degreeId of RELATION_DEGREES) assert.ok(supported.has(degreeId))
  assert.deepEqual(normalizeIrelandDegreeIds(["data-science", "nonsense", "computer-science"]), ["data-science", "computer-science"])
  assert.deepEqual(normalizeIrelandDegreeIds("computer-science,data-science,civil-engineering"), ["computer-science", "data-science"])
  for (const degreeId of ["nurse", "business", "law", "not-a-degree"]) {
    assert.equal(normalizeIrelandDegreeIds(degreeId).length, 0)
  }
})

test("P3.4 10: Degree Compare URL is deterministic and restores on reload", () => {
  assert.equal(
    buildIrelandDegreeCompareHref(["data-science", "computer-science"]),
    "/compare?type=degree&country=IE&degrees=computer-science%2Cdata-science",
  )
  assert.equal(buildIrelandDegreeCompareHref(["computer-science", "computer-science"]), "/compare?type=degree&country=IE&degrees=computer-science")
  assert.equal(buildIrelandDegreeCompareHref([]), "/compare?type=degree&country=IE")
  for (const degreeId of IRELAND_DEGREE_COMPARE_IDS) {
    assert.equal(typeof IRELAND_DEGREE_COMPARE_LABELS[degreeId], "string")
    assert.ok(IRELAND_DEGREE_COMPARE_LABELS[degreeId].length > 0)
  }
})

test("P3.4 11: duplicate Degree selection is rejected and slots replace correctly", () => {
  const current = normalizeIrelandDegreeIds(["computer-science", "data-science"])
  assert.deepEqual(replaceIrelandDegreeAtIndex(current, 0, "data-science"), ["computer-science", "data-science"])
  assert.deepEqual(replaceIrelandDegreeAtIndex(current, 0, "cybersecurity"), ["cybersecurity", "data-science"])
  assert.deepEqual(replaceIrelandDegreeAtIndex(current, 1, "nonsense"), current)
  assert.deepEqual(replaceIrelandDegreeAtIndex(current, 1, null), ["computer-science"])
  assert.deepEqual(replaceIrelandDegreeAtIndex(current, 0, "civil-engineering"), ["civil-engineering", "data-science"])
})

test("P3.4 12: existing Compare modes stay intact (Programs, Countries, Cities, Careers)", () => {
  assert.deepEqual(
    COMPARE_MODE_NAV_ITEMS.map((item) => item.type),
    ["program", "country", "city", "career", "degree"],
  )
  assert.equal(resolveCompareModeType("career"), "career")
  assert.equal(resolveCompareModeType("city"), "city")
  assert.equal(resolveCompareModeType("country"), "country")
  assert.equal(resolveCompareModeType("program"), "program")
  assert.equal(canonicalCompareModeFromLegacyType("degree"), "degrees")
  assert.equal(canonicalCompareModeFromLegacyType("career"), "careers")
})

test("P3.4 13: Diagnostic Radiography keeps registration / professional boundary", () => {
  const entry = buildIrelandDegreeDiscovery("en").find((item) => item.degreeId === "diagnostic-radiography")
  assert.ok(entry, "diagnostic-radiography discovery entry")
  const career = entry.careers[0]
  assert.equal(career.regulatedCareer, true)
  assert.ok(career.regulationSummary.includes("CORU"))
  assert.ok(career.regulationSummary.includes("does not grant permission to practise"))
  const match = getIrelandCareerDegreeMatches("radiographer")[0]
  assert.equal(match.additionalQualification.state, "professional_registration_required")
  assert.equal(match.regulation.registrationRequired, true)
})

test("P3.4 14: non-regulated tech Degrees never imply a mandatory legal Degree", () => {
  for (const degreeId of ["computer-science", "cybersecurity", "data-science"]) {
    const entry = buildIrelandDegreeDiscovery("en").find((item) => item.degreeId === degreeId)
    assert.ok(entry, `${degreeId} discovery entry`)
    const career = entry.careers[0]
    assert.equal(career.regulatedCareer, false)
    assert.ok(career.regulationSummary.includes("Not regulated"))
  }
  const softwareEntry = buildIrelandDegreeDiscovery("en").find((item) => item.degreeId === "computer-science")
  assert.ok(softwareEntry, "computer-science discovery entry")
  const software = softwareEntry.careers[0]
  assert.ok(software.qualificationLabel === null || software.qualificationLabel.includes("No verified mandatory"))
})

test("P3.4 15: mobile structure avoids horizontal overflow", () => {
  const matrix = read("src/app/(workspace)/compare/degrees-compare-matrix.tsx")
  const explorer = read("src/app/(workspace)/countries/ie/degrees/degrees-explorer.tsx")
  assert.ok(matrix.includes("md:hidden"), "mobile matrix renders stacked cards")
  assert.ok(matrix.includes("hidden md:block"), "desktop table is hidden on mobile")
  assert.ok(explorer.includes("flex-wrap"), "discovery controls wrap instead of scrolling")
  assert.ok(explorer.includes("grid gap"), "discovery list is a stacked grid")
  assert.ok(explorer.includes("min-w-0"), "list and inspector cards keep their tracks shrinkable")
  assert.ok(explorer.includes("lg:grid-cols-[minmax(0,1fr)_360px]"), "master-detail kicks in only at desktop width")
  assert.doesNotMatch(explorer, /overflow-x/)
  assert.doesNotMatch(matrix, /overflow-x|min-w-\[48|grid-cols-\[/)
  assert.ok(matrix.includes("break-words"))
})

test("P3.4 16: filter / query states of the Degrees surface are noindex", () => {
  const page = read("src/app/(workspace)/countries/ie/degrees/page.tsx")
  assert.ok(page.includes("hasDegreeFilters"))
  assert.ok(page.includes("index: false, follow: false"))
  assert.ok(page.includes('alternates: { canonical: "/countries/ie/degrees" }'))
  const explorer = read("src/app/(workspace)/countries/ie/degrees/degrees-explorer.tsx")
  assert.ok(explorer.includes("filter_apply"), "reuses the generic filter event")
  assert.ok(explorer.includes("router.replace"))
})

test("P3.4 17: Degree Compare stays noindex / nofollow with a single canonical", () => {
  const comparePage = read("src/app/(workspace)/compare/page.tsx")
  assert.ok(comparePage.includes('robots: { index: false, follow: false }'))
  assert.ok(comparePage.includes('canonical: "/compare"'))
  assert.ok(comparePage.includes("DegreesCompare"))
  assert.ok(comparePage.includes("buildIrelandDegreeCompareHref"))
  const sitemap = read("src/app/sitemap.ts")
  assert.doesNotMatch(sitemap, /\/compare/)
})

test("P3.4 18: the base Degrees discovery surface is indexable and sitemapped", () => {
  const sitemap = read("src/app/sitemap.ts")
  assert.ok(sitemap.includes("/countries/ie/degrees"))
  assert.doesNotMatch(sitemap, /\/compare|degree-match|degree=|degrees=|\/degree\//)
  assert.ok(read("src/app/(workspace)/countries/ie/degrees/page.tsx").includes("{ index: true, follow: true }"))
})

test("P3.4 19: no Degree/Future/cohort expansion", () => {
  assert.equal(IRELAND_DEGREE_MATCH_MODEL.length, 6)
  assert.equal(IRELAND_DEGREE_COMPARE_IDS.length, 6)
  assert.equal(buildIrelandDegreeDiscovery("en").length, 6)
  const future = read("src/app/(workspace)/compare/degrees-compare-matrix.tsx")
  assert.doesNotMatch(future, /Degree Future|Degree Score|Degree Demand|AI Risk/)
  assert.ok(!future.includes("buildIrelandFutureCompareRows"), "Career compare stay separate")
})

test("P3.4 20: Education / Institution continuation uses verified anchors only", () => {
  const entry = buildIrelandDegreeDiscovery("en").find((item) => item.degreeId === "computer-science")
  assert.ok(entry, "computer-science discovery entry")
  assert.equal(entry.educationPath, "/countries/ie/education#degree-computer-science")
  const explorer = read("src/app/(workspace)/countries/ie/degrees/degrees-explorer.tsx")
  assert.ok(explorer.includes("educationPath"))
  assert.doesNotMatch(explorer, /institutions\?|programs\?/)
  const educationPage = read("src/app/(workspace)/countries/ie/education/page.tsx")
  assert.ok(educationPage.includes("getIrelandCountryDegreeInstitutionConnections"), "institution evidence stays verified-source backed")
})

test("P3.4 21: Career → Degree → Career flow reaches canonical Career Pages", () => {
  const explorer = read("src/app/(workspace)/countries/ie/degrees/degrees-explorer.tsx")
  assert.ok(explorer.includes("careerPath"))
  const entry = buildIrelandDegreeDiscovery("en").find((item) => item.degreeId === "civil-engineering")
  assert.ok(entry, "civil-engineering discovery entry")
  assert.ok(entry.careers[0].careerPath.includes("/career/"))
  const careerSection = read("src/app/(workspace)/career/career-core-sections.tsx")
  assert.ok(careerSection.includes("CareerDegreeMatchSection"), "Career Page still renders its Degree Match block")
  assert.doesNotMatch(explorer, /occupationCanonicalPath/)
})

test("P3.4 22: Compare header documents the Degrees mode", () => {
  const header = read("src/app/(workspace)/compare/compare-mode-navigation.tsx")
  assert.ok(header.includes("degree: { en: \"Compare degrees\""))
  assert.ok(header.includes('activeType === "career" || activeType === "city" || activeType === "degree"'))
  assert.ok(header.includes('(searchParams.get("degrees") ?? "")'))
  const mode = read("src/app/(workspace)/compare/[mode]/page.tsx")
  assert.ok(mode.includes("mode === \"degrees\""))
  assert.ok(mode.includes("buildDegreeCompareCanonicalHref"))
})