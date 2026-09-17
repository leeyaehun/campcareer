import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

import { quickSearch, type QuickSearchGroupedResults } from "../src/lib/search/quick-search-index"
import { institutionExplorerViewName } from "../src/lib/institutions/institution-search"
import type { InstitutionSearchIndexEntry } from "../src/lib/search/institution-index.server"

const quickSearchIndex = fs.readFileSync("src/lib/search/quick-search-index.ts", "utf8")
const landingPage = fs.readFileSync("src/app/page.tsx", "utf8")
const searchRoute = fs.readFileSync("src/app/api/v1/quick-search/route.ts", "utf8")
const landingSearch = fs.readFileSync("src/components/search/landing-quick-search.tsx", "utf8")

const EMPTY_INSTITUTION_INDEX: InstitutionSearchIndexEntry[] = []

const MOCK_INSTITUTION_INDEX: InstitutionSearchIndexEntry[] = [
  { id: "1", slug: "australian-national-university", countryCode: "AU", name: "Australian National University" },
  { id: "2", slug: "university-of-melbourne", countryCode: "AU", name: "University of Melbourne" },
  { id: "3", slug: "university-of-toronto", countryCode: "CA", name: "University of Toronto" },
  { id: "4", slug: "seoul-national-university", countryCode: "KR", name: "Seoul National University" },
]

test("landing page search integration", () => {
  assert.match(landingPage, /LandingQuickSearch/)
  assert.match(landingPage, /Quick search/)
})

test("quick-search API route exists with force-dynamic", () => {
  assert.match(searchRoute, /force-dynamic/)
  assert.match(searchRoute, /quickSearch/)
  assert.match(searchRoute, /getInstitutionSearchIndex/)
  assert.match(searchRoute, /NextResponse\.json/)
  assert.match(searchRoute, /s-maxage=60/)
})

test("landing search component is a client component with combobox pattern", () => {
  assert.match(landingSearch, /"use client"/)
  assert.match(landingSearch, /role="combobox"/)
  assert.match(landingSearch, /ArrowUp/)
  assert.match(landingSearch, /ArrowDown/)
  assert.match(landingSearch, /quick-search/)
})

test("quick-search index does not reference maps or compare links", () => {
  assert.match(quickSearchIndex, /LAUNCH_COUNTRIES/)
  assert.match(quickSearchIndex, /CAREER_CATALOGUE/)
  assert.match(quickSearchIndex, /STUDY_CONCEPTS/)
  assert.ok(!quickSearchIndex.includes("/maps"), "quick-search index must not contain /maps links")
  assert.ok(!quickSearchIndex.includes("/compare"), "quick-search index must not contain /compare links")
})

test("quick-search groups cap results to 5 per group", () => {
  assert.match(quickSearchIndex, /GROUP_LIMIT/)
  assert.match(quickSearchIndex, /slice\(0, GROUP_LIMIT\)/)
})

test("quick-search with empty query returns no results", () => {
  const results = quickSearch("", EMPTY_INSTITUTION_INDEX)
  assert.deepEqual(results.countries, [])
  assert.deepEqual(results.majors, [])
  assert.deepEqual(results.careers, [])
  assert.deepEqual(results.institutions, [])
})

test("quick-search with whitespace-only query returns no results", () => {
  const results = quickSearch("   ", EMPTY_INSTITUTION_INDEX)
  assert.deepEqual(results.countries, [])
  assert.deepEqual(results.majors, [])
  assert.deepEqual(results.careers, [])
  assert.deepEqual(results.institutions, [])
})

test("quick-search matches countries by name", () => {
  const results = quickSearch("Australia", EMPTY_INSTITUTION_INDEX)
  assert.ok(results.countries.length > 0)
  const au = results.countries.find((c) => c.label === "Australia")
  assert.ok(au, "should find Australia")
  assert.equal(au.href, "/countries/au")
})

test("quick-search matches countries case-insensitively", () => {
  const results = quickSearch("korea", EMPTY_INSTITUTION_INDEX)
  assert.ok(results.countries.length > 0)
  const korea = results.countries.find((c) => c.label === "South Korea")
  assert.ok(korea, "should find South Korea")
  assert.equal(korea.href, "/countries/kr")
})

test("quick-search matches careers by label and labelKo", () => {
  const enResults = quickSearch("Software Developer", EMPTY_INSTITUTION_INDEX)
  assert.ok(enResults.careers.length > 0, "should find Software Developer career")
  assert.ok(enResults.careers.some((c) => c.label === "Software Developer"))

  const koResults = quickSearch("간호", EMPTY_INSTITUTION_INDEX)
  assert.ok(koResults.careers.length > 0, "should find Nursing by labelKo")
  assert.ok(koResults.careers.some((c) => c.label === "Registered Nurse"))
})

test("quick-search matches study fields by label and category", () => {
  const results = quickSearch("Nursing", EMPTY_INSTITUTION_INDEX)
  assert.ok(results.majors.length > 0, "should find Nursing study field")
  assert.ok(results.majors.some((m) => m.label === "Nursing"))
  assert.equal(results.majors.find((m) => m.label === "Nursing")?.href, "/careers?category=health")
})

test("quick-search matches study fields by Korean label", () => {
  const results = quickSearch("간호학", EMPTY_INSTITUTION_INDEX)
  assert.ok(results.majors.length > 0, "should find Nursing by Korean label")
  assert.ok(results.majors.some((m) => m.labelKo === "간호학"))
})

test("quick-search matches institutions by name", () => {
  const results = quickSearch("Melbourne", MOCK_INSTITUTION_INDEX)
  assert.ok(results.institutions.length > 0, "should find Melbourne institutions")
  const melb = results.institutions.find((i) => i.label === "University of Melbourne")
  assert.ok(melb, "should find University of Melbourne")
  assert.equal(melb.href, "/institutions/au/university-of-melbourne")
})

test("quick-search matches institutions across countries", () => {
  const results = quickSearch("University", MOCK_INSTITUTION_INDEX)
  assert.equal(results.institutions.length, 4, "should find all 4 universities")
})

test("quick-search ranks prefix matches above substring matches", () => {
  const results = quickSearch("Uni", MOCK_INSTITUTION_INDEX)
  assert.equal(results.institutions[0].label, "University of Melbourne")
  assert.equal(results.institutions[1].label, "University of Toronto")
  assert.ok(
    results.institutions.slice(2).every((i) => !i.label.startsWith("University")),
    "substring-only matches (Australian National University) must sort after prefix matches",
  )
})

test("quick-search groups returned are the expected 4 types", () => {
  const results = quickSearch("a", MOCK_INSTITUTION_INDEX)
  assert.ok(Array.isArray(results.countries))
  assert.ok(Array.isArray(results.majors))
  assert.ok(Array.isArray(results.careers))
  assert.ok(Array.isArray(results.institutions))
})

test("all 4 groups exist as keys in quickSearchGroupedResults type", () => {
  const results: QuickSearchGroupedResults = {
    query: "test",
    countries: [],
    majors: [],
    careers: [],
    institutions: [],
  }
  assert.deepEqual(Object.keys(results).sort(), ["careers", "countries", "institutions", "majors", "query"])
})

test("quick-search hrefs never reference maps or compare routes", () => {
  const results = quickSearch("A", MOCK_INSTITUTION_INDEX)
  const allHrefs = [
    ...results.countries.map((c) => c.href),
    ...results.majors.map((m) => m.href),
    ...results.careers.map((c) => c.href),
    ...results.institutions.map((i) => i.href),
  ]
  for (const href of allHrefs) {
    assert.ok(!href.startsWith("/maps"), `href ${href} must not reference /maps`)
    assert.ok(!href.startsWith("/compare"), `href ${href} must not reference /compare`)
  }
})

test("institutionExplorerViewName returns valid view names for all MVP countries", () => {
  const expectedViews = {
    UK: "institution_explorer_uk_v1",
    CA: "institution_explorer_ca_v1",
    NL: "institution_explorer_nl_v1",
    NZ: "institution_explorer_nz_v1",
    SG: "institution_explorer_sg_v1",
    DE: "institution_explorer_de_v1",
    FR: "institution_explorer_fr_v1",
    ES: "institution_explorer_es_v1",
    AE: "institution_explorer_ae_v1",
    US: "institution_explorer_us_tier_a_v1",
    BE: "institution_explorer_eu_fastpath_v1",
    CH: "institution_explorer_eu_fastpath_v1",
    SE: "institution_explorer_eu_fastpath_v1",
    DK: "institution_explorer_eu_fastpath_v1",
    FI: "institution_explorer_authority_fastpath_v1",
    NO: "institution_explorer_authority_fastpath_v1",
    JP: "institution_explorer_authority_fastpath_v1",
    KR: "institution_explorer_authority_fastpath_v1",
    AU: "institution_explorer_v1",
    IE: "institution_explorer_v1",
  } as const

  for (const [code, expectedView] of Object.entries(expectedViews)) {
    assert.equal(
      institutionExplorerViewName(code as "AU"),
      expectedView,
      `${code} should map to ${expectedView}`,
    )
  }
})
