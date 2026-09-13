import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  buildIrelandCareerCompareHref,
  IE_CAREER_COMPARE_IDS,
  normalizeIrelandCareerIds,
} from "../src/lib/ireland-career-comparison"
import { resolveCareerCompareHref } from "../src/lib/workspace/career-compare-context"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const comparePage = read("src/app/(workspace)/compare/page.tsx")
const countryDashboard = read("src/app/(workspace)/countries/ireland-country-dashboard.tsx")
const institutionDetail = read("src/app/(workspace)/institutions/ireland-institution-detail.tsx")
const cityDashboard = read("src/app/(workspace)/cities/ireland-city-dashboard.tsx")
const sitemap = read("src/app/sitemap.ts")

test("every reviewed Ireland Career enters the shared, reconstructable Career Compare flow", () => {
  for (const careerId of IE_CAREER_COMPARE_IDS) {
    assert.equal(resolveCareerCompareHref("IE", careerId), buildIrelandCareerCompareHref([careerId]))
  }
  assert.equal(resolveCareerCompareHref("IE", "accountant"), null)
  assert.deepEqual(
    normalizeIrelandCareerIds("radiographer,software-developer,architect,software-developer"),
    ["radiographer", "software-developer"],
  )
  assert.equal(
    buildIrelandCareerCompareHref(["radiographer", "software-developer"]),
    buildIrelandCareerCompareHref(["software-developer", "radiographer"]),
  )
})

test("Ireland Country and Degree relationships launch only the existing Career Compare", () => {
  assert.match(countryDashboard, /buildIrelandCareerCompareHref/)
  assert.match(countryDashboard, /connection\.careers\.map\(\(career\) => career\.careerId\)/)
  assert.match(countryDashboard, /Compare Ireland careers/)
  assert.doesNotMatch(countryDashboard, /Degree Compare|Compare degrees|\/degrees/)
  assert.doesNotMatch(countryDashboard, /\/programs\/ie/)
})

test("only reviewed multi-Career Institution evidence can preselect Career Compare", () => {
  assert.match(institutionDetail, /normalizeIrelandCareerIds\(careerDegreeEvidence\.map/)
  assert.match(institutionDetail, /compareCareerIds\.length >= IE_CAREER_COMPARE_MIN_CAREERS/)
  assert.match(institutionDetail, /buildIrelandCareerCompareHref\(compareCareerIds\)/)
  assert.match(institutionDetail, /Compare these careers/)
  assert.doesNotMatch(institutionDetail, /Institution Compare|Compare institutions|\/programs\/ie/)
})

test("City Compare and Compare SEO boundaries remain unchanged", () => {
  assert.match(cityDashboard, /buildCityCompareCanonicalHref\(\{ country: "IE", left: profile\.slug \}\)/)
  assert.match(cityDashboard, /Compare \{profile\.name\}/)
  assert.match(comparePage, /robots: \{ index: false, follow: false \}/)
  assert.doesNotMatch(sitemap, /\/compare/)
})
