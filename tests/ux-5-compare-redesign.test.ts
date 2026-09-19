import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  COMPARE_MODE_NAV_ITEMS,
  resolveCompareModeType,
} from "../src/lib/compare-navigation"
import {
  IE_CAREER_COMPARE_IDS,
  IE_CAREER_COMPARE_MAX_CAREERS,
  IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR,
  buildIrelandCareerCompareHref,
  normalizeIrelandCareerIds,
} from "../src/lib/ireland-career-comparison"
import {
  buildCountryCompareHref,
  completeCountryCodes,
  parseCountryComparisonState,
  slotsFromCountryCodes,
} from "../src/lib/country-comparison"
import { getCompareAnalyticsDetails } from "../src/components/analytics/decision-session-tracker"
import { CORE_ANALYTICS_EVENTS } from "../src/lib/analytics"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const nav = read("src/app/(workspace)/compare/compare-mode-navigation.tsx")
const page = read("src/app/(workspace)/compare/page.tsx")
const irelandMatrix = read("src/app/(workspace)/compare/ireland-careers-compare-matrix.tsx")
const irelandCitiesMatrix = read("src/app/(workspace)/compare/ireland-cities-compare-matrix.tsx")
const countriesMatrix = read("src/app/(workspace)/compare/countries-compare-matrix.tsx")
const programsMatrix = read("src/app/(workspace)/compare/programs-compare-matrix.tsx")
const careersMatrix = read("src/app/(workspace)/compare/careers-compare-matrix.tsx")
const citySelector = read("src/app/(workspace)/compare/city-compare-selector.tsx")
const decisionTracker = read("src/components/analytics/decision-session-tracker.tsx")

test("Compare exposes exactly the five supported modes via canonical href builders", () => {
  assert.deepEqual(
    COMPARE_MODE_NAV_ITEMS.map((item) => item.type),
    ["program", "country", "city", "career", "degree"],
  )
  assert.equal(new Set(COMPARE_MODE_NAV_ITEMS.map((item) => item.href)).size, 5)
  assert.ok(COMPARE_MODE_NAV_ITEMS.every((item) => item.href.startsWith("/compare?")))
  assert.ok(!COMPARE_MODE_NAV_ITEMS.some((item) => ["institution", "employer", "industry"].includes(item.type)))
})

test("Compare headers name each real mode instead of internal context jargon", () => {
  assert.match(nav, /program: \{ en: "Compare programs"/)
  assert.match(nav, /country: \{ en: "Compare countries"/)
  assert.match(nav, /city: \{ en: "Compare cities"/)
  assert.match(nav, /career: \{ en: "Compare careers"/)
  assert.match(nav, /degree: \{ en: "Compare degrees"/)
  assert.doesNotMatch(nav, /Compare country context|Compare city context/)
})

test("CountryPill is only rendered in Career and City modes, never in Country or Program", () => {
  assert.match(nav, /const showCountry = activeType === "career" \|\| activeType === "city"/)
  assert.match(nav, /\{showCountry \? \(/)
  assert.doesNotMatch(nav, /activeType === "program" \|\| activeType === "career" \|\| activeType === "city"/)
})

test("Compare surfaces carry no product-strategy or secondary-action copy", () => {
  const surfaces = [nav, page, irelandMatrix, irelandCitiesMatrix, countriesMatrix, programsMatrix, careersMatrix, citySelector]
  for (const surface of surfaces) {
    assert.doesNotMatch(surface, /SECONDARY ACTION|secondary action|Compare a decision, not everything|supporting tool|primary decision surface/)
  }
})

test("Country Compare columns are country-only and drop the city selector", () => {
  assert.doesNotMatch(countriesMatrix, /Choose city|City for /)
  assert.match(countriesMatrix, /COUNTRY_COMPARE_CATALOG\.map/)
  assert.match(countriesMatrix, /<option value="">Choose country<\/option>/)
  assert.match(countriesMatrix, /getRegisteredNurseCountryShell/)
})

test("Country Compare URLs use a canonical, deterministic countries list", () => {
  assert.equal(
    buildCountryCompareHref(["IE", "AU"]),
    "/compare?type=country&goal=registered-nurse&profile=starting-from-scratch&countries=AU,IE",
  )
  assert.match(countriesMatrix, /buildCountryCompareHref\(completeCountryCodes\(nextSlots\)\)/)
})

test("Country Compare needs two countries and stays capped at three", () => {
  assert.equal(completeCountryCodes(slotsFromCountryCodes(["AU"])).length, 1)
  assert.equal(completeCountryCodes(slotsFromCountryCodes(["AU", "IE"])).length, 2)
  const parsed = parseCountryComparisonState(
    new URLSearchParams("goal=registered-nurse&profile=starting-from-scratch&countries=AU,IE,UK,DE"),
  )
  assert.deepEqual(parsed.countries, ["AU", "IE", "UK"])
  assert.ok(countriesMatrix.includes("Select two countries to start comparing"))
})

test("Ireland Career Compare cohort is exactly the six reviewed MVP careers in cohort order", () => {
  assert.deepEqual(IE_CAREER_COMPARE_IDS, [
    "software-developer",
    "cybersecurity-analyst",
    "data-engineer",
    "civil-engineer",
    "construction-manager",
    "radiographer",
  ])
})

test("Ireland Career Compare is fixed to empty / one / two states via a two-career cap", () => {
  assert.equal(IE_CAREER_COMPARE_MAX_CAREERS, 2)
  assert.deepEqual(
    normalizeIrelandCareerIds("software-developer,radiographer,civil-engineer,software-developer,architect"),
    ["software-developer", "radiographer"],
  )
  assert.doesNotMatch(irelandMatrix, /Optional third career/)
})

test("Ireland Career Compare URLs are reconstructable and cohort-deterministic", () => {
  assert.equal(
    buildIrelandCareerCompareHref(["civil-engineer", "software-developer"]),
    "/compare?type=career&country=IE&profile=ireland-career-mvp-v1&careers=software-developer%2Ccivil-engineer",
  )
})

test("Ireland Career Compare shows the two required career selectors", () => {
  assert.match(irelandMatrix, /Career \{index \+ 1\}/)
  assert.match(irelandMatrix, /Choose career \$\{index \+ 1\}/)
  assert.match(irelandMatrix, /Array\.from\(\{ length: 2 \}/)
  assert.doesNotMatch(irelandMatrix, /Array\.from\(\{ length: 3 \}/)
})

test("Ireland Career Compare Pay is the €32.99/hour CSO proxy, not an abstract score", () => {
  assert.equal(IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR, "€32.99/hour")
  assert.match(irelandMatrix, /IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR/)
  assert.match(irelandMatrix, /const payProxy = IE_CAREER_COMPARE_PAY_PROXY_PER_HOUR/)
  assert.match(irelandMatrix, /label="Pay" values=\{selected\.map\(\(\) => payProxy\)\}/)
  assert.doesNotMatch(irelandMatrix, /\$\{item\.score\.pay\}\/10/)
  assert.match(irelandMatrix, /same broad official\s+Professional-occupations proxy/)
})

test("Ireland Career Compare renders side-by-side on desktop and stacked on mobile", () => {
  assert.match(irelandMatrix, /hidden md:block/)
  assert.match(irelandMatrix, /md:hidden/)
  assert.doesNotMatch(irelandMatrix, /min-w-\[48rem\]/)
  assert.match(irelandMatrix, /className="table-fixed"/)
})

test("City Compare owns city selection with clearly labelled first/second controls", () => {
  assert.match(citySelector, /First city/)
  assert.match(citySelector, /Second city/)
  assert.match(citySelector, /aria-label="Swap compared cities"/)
  assert.ok(irelandCitiesMatrix.includes("<CityCompareSelector"))
  assert.ok(irelandCitiesMatrix.includes('countryCode="IE"'))
})

test("Ireland City Compare shortlist is the four Tier A cities", () => {
  const routes = read("src/lib/cities/city-routes.ts")
  assert.match(routes, /PUBLISHED_IE_CITY_SLUGS = \["dublin", "cork", "galway", "limerick"\] as const/)
})

test("Program Compare keeps the global Australian Nursing cohort with the Ireland gate closed", () => {
  assert.match(page, /country !== "AU" \|\| field !== "nursing"/)
  assert.match(page, /label="Compare Australian Nursing programs"/)
  assert.match(programsMatrix, /CompareShell/)
})

test("Compare remains noindex while the canonical stays at /compare", () => {
  assert.match(page, /robots: \{ index: false, follow: false \}/)
  assert.match(page, /alternates: \{ canonical: "\/compare" \}/)
})

test("Compare analytics contract is preserved across the redesigned modes", () => {
  assert.ok(CORE_ANALYTICS_EVENTS.includes("compare_add"))
  assert.ok(CORE_ANALYTICS_EVENTS.includes("compare_view"))
  assert.ok(CORE_ANALYTICS_EVENTS.includes("compare_complete"))
  assert.deepEqual(
    getCompareAnalyticsDetails(new URLSearchParams("type=country&countries=AU,IE,UK")),
    { comparison_category: "country", entity_count: 3 },
  )
  assert.match(decisionTracker, /countDelimitedValues\(searchParams\.get\("countries"\)\)/)
  assert.match(careersMatrix, /comparison_category: "career"/)
  assert.match(irelandMatrix, /comparison_category: "career"/)
  assert.match(countriesMatrix, /comparison_category: "country"/)
})

test("Country, Program and City Compare selectors share the campcareer visual tokens", () => {
  for (const surface of [countriesMatrix, programsMatrix, citySelector]) {
    assert.match(surface, /border-campcareer-border/)
    assert.match(surface, /bg-campcareer-surface/)
  }
  assert.match(nav, /rounded-cc-control/)
  assert.match(nav, /border-campcareer-border/)
  assert.doesNotMatch(countriesMatrix, /#[0-9a-fA-F]{6}/)
  assert.doesNotMatch(citySelector, /#[0-9a-fA-F]{6}/)
})

test("compare mode dispatcher still resolves only the five supported types", () => {
  assert.equal(resolveCompareModeType("program"), "program")
  assert.equal(resolveCompareModeType("country"), "country")
  assert.equal(resolveCompareModeType("city"), "city")
  assert.equal(resolveCompareModeType("career"), "career")
  assert.equal(resolveCompareModeType("degree"), "degree")
  assert.equal(resolveCompareModeType("cities"), "unsupported")
})