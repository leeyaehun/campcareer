import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const careersPage = read("src/app/(workspace)/countries/ie/careers/page.tsx")
const educationPage = read("src/app/(workspace)/countries/ie/education/page.tsx")
const citiesPage = read("src/app/(workspace)/countries/ie/cities/page.tsx")
const countryDashboard = read("src/app/(workspace)/countries/ireland-country-dashboard.tsx")
const sitemap = read("src/app/sitemap.ts")
const sitemapSegments = read("src/lib/sitemap-segments.ts")

test("Ireland P1 intelligence hubs are canonical, indexable and source-backed by reviewed readers", () => {
  for (const [source, canonical] of [
    [careersPage, "/countries/ie/careers"],
    [educationPage, "/countries/ie/education"],
    [citiesPage, "/countries/ie/cities"],
  ]) {
    assert.ok(source.includes(`alternates: { canonical: "${canonical}" }`))
    assert.match(source, /robots: \{ index: true, follow: true \}/)
  }

  assert.match(careersPage, /IE_CAREER_COMPARE_IDS\.map/)
  assert.match(careersPage, /getIrelandCountryDegreeInstitutionConnections/)
  assert.match(careersPage, /getIrelandEmploymentEcosystem/)
  assert.match(educationPage, /getIrelandCountryDegreeInstitutionConnections/)
  assert.match(educationPage, /getIrelandInstitutions/)
  assert.match(citiesPage, /PUBLISHED_IE_CITY_SLUGS\.map/)
  assert.match(citiesPage, /getIeCityProfile/)
})

test("Ireland education hub preserves the programme publication gate", () => {
  assert.match(educationPage, /Exact public programme listings remain gated until current programme-level eligibility is verified/)
  assert.doesNotMatch(educationPage, /\/programs\/ie/)
  assert.doesNotMatch(careersPage, /\/programs\/ie/)
  assert.doesNotMatch(citiesPage, /\/programs\/ie/)
})

test("Ireland Country hub links to all three canonical intelligence hubs", () => {
  for (const path of [
    "/countries/ie/careers",
    "/countries/ie/education",
    "/countries/ie/cities",
  ]) {
    assert.ok(countryDashboard.includes(`href="${path}"`))
  }
})

test("Ireland intelligence hubs are published in the main and segmented sitemap contracts", () => {
  for (const path of [
    "/countries/ie/careers",
    "/countries/ie/education",
    "/countries/ie/cities",
  ]) {
    assert.ok(sitemap.includes(path))
  }

  assert.match(sitemapSegments, /pathname === `\/countries\/\$\{code\}`/)
  assert.match(sitemapSegments, /pathname\.startsWith\(`\/countries\/\$\{code\}\/`\)/)
  assert.match(sitemapSegments, /careers\|education\|cities\|visas/)
})
