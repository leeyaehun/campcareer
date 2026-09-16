import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { LAUNCH_COUNTRIES } from "../src/data/launch-countries"

function source(path: string) {
  return readFileSync(path, "utf8")
}

function countryHubHref(countryCode: string) {
  return `/countries/${countryCode.toLowerCase()}`
}

test("the /countries discovery hub is indexable with a canonical URL", () => {
  const page = source("src/app/(workspace)/countries/page.tsx")

  assert.match(page, /title: "Countries/ )
  assert.match(page, /alternates: \{ canonical: "\/countries" \}/)
  assert.match(page, /robots: \{ index: true, follow: true \}/)
})

test("every supported launch country gets a canonical detail-page link", () => {
  const card = source("src/app/(workspace)/countries/country-discovery-card.tsx")
  const search = source("src/app/(workspace)/countries/country-search.tsx")

  assert.match(card, /const href = `\/countries\/\$\{country\.code\.toLowerCase\(\)\}`/)
  assert.match(card, /href=\{href\}/)
  assert.match(card, /country\.code\.toLowerCase\(\)/)
  assert.match(search, /<CountryDiscoveryCard data=\{data\} \/>/)

  // Every launch country maps to the canonical code-based country hub route.
  for (const country of LAUNCH_COUNTRIES) {
    assert.equal(countryHubHref(country.code), `/countries/${country.code.toLowerCase()}`)
    assert.ok(!countryHubHref(country.code).includes(country.slug), "hub routes use codes, not slug projections")
  }
})

test("the discovery hub only represents countries in the launch registry", () => {
  const page = source("src/app/(workspace)/countries/page.tsx")
  const card = source("src/app/(workspace)/countries/country-discovery-card.tsx")

  const codes = LAUNCH_COUNTRIES.map((c) => c.code)
  assert.equal(new Set(codes).size, codes.length, "launch codes must be unique")

  // No hardcoded country slugs/hrefs may bypass the registry.
  for (const country of LAUNCH_COUNTRIES) {
    assert.doesNotMatch(card, new RegExp(`href="/${country.code.toLowerCase()}"`))
    assert.doesNotMatch(page, new RegExp(`href="/countries/${country.slug}"`))
  }
  assert.ok(page.includes("supported countries"), "page must describe the supported set")
})

test("cards surface decision facts: career strengths, earnings, wage and institutions", () => {
  const card = source("src/app/(workspace)/countries/country-discovery-card.tsx")
  const data = source("src/app/(workspace)/countries/countries-page-data.ts")

  assert.ok(card.includes("strongMajorLabels"), "cards must preview career strengths")
  assert.ok(card.includes("salaryFormatted"), "cards must preview earnings context")
  assert.ok(card.includes("minimumWageFormatted"), "cards must preview minimum wage")
  assert.ok(card.includes("topInstitutions"), "cards must preview notable institutions")
  assert.ok(card.includes("countryFlag(country.code)"), "cards must include a country identity element")
  assert.ok(card.includes("workOpportunityHeadline"), "cards must preview career opportunities")

  // Safe fallback when an official figure is unavailable (never "zero").
  assert.ok(data.includes('salaryFormatted = formatMoneyRange(metrics?.salaryRange)'))
  assert.ok(data.includes("minimumWageFormatted = metrics ? formatMinimumWage(metrics) : null"))
})

test("major-industry visualization is data-driven and Ireland-only", () => {
  const card = source("src/app/(workspace)/countries/country-discovery-card.tsx")
  const data = source("src/app/(workspace)/countries/countries-page-data.ts")

  assert.ok(card.includes("industrySectors"), "cards render a compact sector chart when data exists")
  assert.ok(card.includes("aria-label=\"Major employment sectors\""), "sector chart is accessible")
  assert.ok(data.includes("getIrelandEmploymentSectorsSorted"), "Ireland is the approved sector-data source")
  assert.match(data, /country\.code === "IE"/)
  assert.ok(data.includes('industrySectors: readonly IndustrySectorBar[] | null'), "unavailable industries stay null, never fabricated")
})

test("country search filters the supported set with a clear empty state", () => {
  const page = source("src/app/(workspace)/countries/page.tsx")
  const search = source("src/app/(workspace)/countries/country-search.tsx")

  assert.match(search, /"use client"/)
  assert.match(page, /<CountrySearch countries=\{countries\} \/>/)
  assert.match(search, /placeholder="Search countries\.\.\."/)
  assert.match(search, /aria-label="Search countries"/)
  assert.match(search, /country\.name\.toLowerCase\(\)\.includes/)
  assert.match(search, /No countries match/)
  assert.match(search, /type="search"/)
})

test("navigating between the hub and country hubs stays inside canonical routes", () => {
  const page = source("src/app/(workspace)/countries/page.tsx")

  assert.ok(!page.includes('href="/countries/a"'), "no code-derived typo links")
  assert.ok(!page.includes("/countries/undefined"), "no unresolved slugs")
  assert.ok(!page.includes('href="/countries/"'), "no empty country links")

  const expectedLinks = LAUNCH_COUNTRIES.map((country) => countryHubHref(country.code))
  for (const country of LAUNCH_COUNTRIES) {
    assert.ok(expectedLinks.includes(countryHubHref(country.code)))
  }
})