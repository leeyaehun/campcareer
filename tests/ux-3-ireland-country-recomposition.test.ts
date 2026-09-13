import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { IE_CAREER_COMPARE_IDS } from "../src/lib/ireland-career-comparison"
import { PUBLISHED_IE_CITY_SLUGS } from "../src/lib/cities/city-routes"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const dashboard = read("src/app/(workspace)/countries/ireland-country-dashboard.tsx")
const countryPage = read("src/app/(workspace)/countries/ie/page.tsx")
const shell = read("src/app/(workspace)/countries/country-dashboard-shell.tsx")
const industries = read("src/app/(workspace)/countries/ireland-employment-ecosystem-section.tsx")

test("Ireland Country top area keeps practical facts and removes the verbose decision-context treatment", () => {
  assert.match(dashboard, /label="Visa pathways"/)
  assert.match(dashboard, /label="Salary range"/)
  assert.match(dashboard, /label="Living costs"/)
  assert.match(dashboard, /English-speaking higher education/)
  assert.match(dashboard, /Employment clusters/)
  assert.match(countryPage, /showSummary=\{false\}/)
  assert.match(shell, /showSummary = true/)
  assert.doesNotMatch(dashboard, /Ireland decision context|Explore reviewed career, education, city and employment context/)
})

test("Ireland Country local navigation is visibly clickable and points only to real sections or visas", () => {
  for (const anchor of ["#careers", "#education", "#cities", "#industries"]) {
    assert.ok(dashboard.includes(`"${anchor}"`))
  }
  assert.ok(dashboard.includes('href="/countries/ie/visas"'))
  assert.match(dashboard, /min-h-11/)
  assert.match(dashboard, /focus-visible:ring-4/)
})

test("Ireland Country separates study areas from institutions and keeps degree cards concise", () => {
  const degreeCard = dashboard.slice(dashboard.indexOf("function DegreeConnectionCard"), dashboard.indexOf("function InstitutionConnectionCard"))
  const institutionCard = dashboard.slice(dashboard.indexOf("function InstitutionConnectionCard"), dashboard.indexOf("function IrelandCareerCards"))

  assert.match(dashboard, /Study areas/)
  assert.match(dashboard, /Verified institutions/)
  assert.ok(dashboard.indexOf("Study areas") < dashboard.indexOf("Verified institutions"))
  assert.match(dashboard, /Academic year details/)
  assert.ok(dashboard.indexOf("Academic year details") > dashboard.indexOf("Study areas"))
  assert.match(degreeCard, /Related careers/)
  assert.doesNotMatch(degreeCard, /Evidence:|Reviewed evidence institution|career\.rationale|Compare/)
  assert.match(institutionCard, /<EntityCardLink href=\{detailPath\}/)
  assert.match(institutionCard, /location\.city\.name/)
  assert.doesNotMatch(institutionCard, /Open \{location\.city\.name\}|<Link|<a /)
})

test("Ireland Country keeps the reviewed cohorts and presents industry connections explicitly", () => {
  assert.equal(IE_CAREER_COMPARE_IDS.length, 6)
  assert.deepEqual(PUBLISHED_IE_CITY_SLUGS, ["dublin", "cork", "galway", "limerick"])
  assert.match(dashboard, /cities\.filter\(\(city\) => Boolean\(ieCityPath\(city\)\)\)/)
  assert.match(dashboard, /min-h-20/)
  assert.match(industries, /Related careers/)
  assert.match(industries, /careerCanonicalPath\("IE", connection\.careerId\)/)
  assert.doesNotMatch(dashboard, /\/degrees\//)
  assert.doesNotMatch(dashboard, /\/programs\/ie/)
})
