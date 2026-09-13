import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const reader = read("src/lib/cities/ireland-city-decision-connections.server.ts")
const cityRoute = read("src/app/(workspace)/cities/ie/[city]/page.tsx")
const dashboard = read("src/app/(workspace)/cities/ireland-city-dashboard.tsx")
const countryDashboard = read("src/app/(workspace)/countries/ireland-country-dashboard.tsx")
const relationGraph = read("supabase/migrations/20260912205454_ie_career_degree_graph_v1.sql")

test("Ireland City decision connections use the strict P1.3 and P1.4 readers without institution-by-institution relation reads", () => {
  assert.match(reader, /import "server-only"/)
  assert.match(reader, /getIrelandInstitutions\(\)/)
  assert.match(reader, /getIrelandCountryDegreeInstitutionConnections\(\)/)
  assert.match(reader, /Promise\.all/)
  assert.match(reader, /location\.city\.slug === citySlug/)
  assert.match(reader, /institutionSlugs\.has\(institution\.slug\)/)
  assert.match(reader, /return EMPTY_CONNECTIONS/)
  assert.doesNotMatch(reader, /getIrelandInstitutionCareerDegreeEvidence/)
  assert.doesNotMatch(reader, /city_programme_directory_ie_v1|colleges_ie|institution_detail_v1|program_count/)
})

test("Ireland City pages load decision connections alongside the existing City profile", () => {
  assert.match(cityRoute, /getIrelandCityDecisionConnections/)
  assert.match(cityRoute, /Promise\.all/)
  assert.match(cityRoute, /decisionConnections=\{decisionConnections\}/)
})

test("the reviewed graph exposes only Dublin and Galway City evidence in the current Ireland cohort", () => {
  for (const relation of [
    ["software-developer", "computer-science", "Dublin City University"],
    ["data-engineer", "data-science", "Dublin City University"],
    ["cybersecurity-analyst", "cybersecurity", "Technological University Dublin"],
    ["construction-manager", "construction-management", "Technological University Dublin"],
    ["radiographer", "diagnostic-radiography", "Trinity College Dublin"],
    ["civil-engineer", "civil-engineering", "University of Galway"],
  ]) {
    const [career, degree, institution] = relation
    assert.match(
      relationGraph,
      new RegExp(`'${career}','${degree}'[\\s\\S]*?'${institution}'`),
    )
  }
  assert.doesNotMatch(relationGraph, /'University College Cork'/)
  assert.doesNotMatch(relationGraph, /'University of Limerick'|'Mary Immaculate College'/)
})

test("City surfaces link verified institutions and reviewed Degree-to-Career evidence through canonical helpers", () => {
  assert.match(dashboard, /institutionDetailPath\("IE", institution\.slug\)/)
  assert.match(dashboard, /careerCanonicalPath\("IE", relation\.career\.careerId\)/)
  assert.match(dashboard, /institutionDetailPath\(relation\.institution\.countryCode, relation\.institution\.slug\)/)
  assert.match(dashboard, /Career-linked education evidence/)
  assert.match(dashboard, /Degree → Career/)
  assert.match(dashboard, /Reviewed evidence institution/)
  assert.match(dashboard, /careerDegreeEvidence\.length > 0/)
  assert.match(dashboard, /not programme listings or city-level availability claims/)
  assert.doesNotMatch(dashboard, /\/programs\/ie|programCount|Top careers|job demand|local salary/)
})

test("Country-to-City and City Compare continuations stay intact", () => {
  assert.match(countryDashboard, /ieCityPath\(city\)/)
  assert.match(countryDashboard, /buildCityCompareCanonicalHref\(\{ country: "IE" \}\)/)
  assert.match(dashboard, /href="\/countries\/ie"/)
  assert.match(dashboard, /buildCityCompareCanonicalHref\(\{ country: "IE", left: profile\.slug \}\)/)
})
