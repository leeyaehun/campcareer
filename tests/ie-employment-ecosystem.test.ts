import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  IRELAND_EMPLOYMENT_ECOSYSTEM,
  assertIrelandEmploymentEcosystem,
  isReviewedIrelandEmploymentCareer,
} from "../src/lib/employment/ireland-employment-ecosystem-data"
import { IE_CAREER_COMPARE_IDS } from "../src/lib/ireland-career-comparison"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const reader = read("src/lib/employment/ireland-employment-ecosystem.server.ts")
const countryPage = read("src/app/(workspace)/countries/ie/page.tsx")
const countrySection = read("src/app/(workspace)/countries/ireland-employment-ecosystem-section.tsx")
const careerRead = read("src/lib/workspace/career-market-read.ts")
const careerCore = read("src/app/(workspace)/career/career-core-sections.tsx")

test("Ireland P1.6 publishes only the reviewed Industry → Career cohort", () => {
  assert.doesNotThrow(() => assertIrelandEmploymentEcosystem(IRELAND_EMPLOYMENT_ECOSYSTEM))
  assert.deepEqual(
    IRELAND_EMPLOYMENT_ECOSYSTEM.industries.map((industry) => industry.id),
    ["ie-ict", "ie-construction", "ie-healthcare"],
  )

  const mappedCareers = IRELAND_EMPLOYMENT_ECOSYSTEM.industries.flatMap((industry) => industry.careers)
  assert.deepEqual(
    [...new Set(mappedCareers.map((connection) => connection.careerId))].sort(),
    [...IE_CAREER_COMPARE_IDS].sort(),
  )
  for (const connection of mappedCareers) {
    assert.equal(isReviewedIrelandEmploymentCareer(connection.careerId), true)
    assert.ok(connection.rationale)
    assert.match(connection.evidence.url, /^https:\/\//)
    assert.match(connection.evidence.checkedAt, /^2026-09-\d{2}$/)
  }
})

test("selected Ireland employers have official presence and Career evidence without inferred cities", () => {
  assert.deepEqual(
    IRELAND_EMPLOYMENT_ECOSYSTEM.employers.map((employer) => employer.id),
    ["ie:microsoft", "ie:sisk", "ie:hse"],
  )

  for (const employer of IRELAND_EMPLOYMENT_ECOSYSTEM.employers) {
    assert.ok(employer.name)
    assert.match(employer.irelandPresence.url, /^https:\/\//)
    assert.match(employer.careersUrl, /^https:\/\//)
    assert.ok(employer.careers.length > 0)
    for (const connection of employer.careers) {
      assert.equal(isReviewedIrelandEmploymentCareer(connection.careerId), true)
      assert.match(connection.evidence.url, /^https:\/\//)
      assert.ok(connection.rationale.includes("not a vacancy claim"))
    }
  }

  const employerCities = IRELAND_EMPLOYMENT_ECOSYSTEM.employers.flatMap((employer) => employer.cities)
  assert.deepEqual(employerCities.map((city) => city.citySlug), ["dublin"])
  assert.match(employerCities[0]!.rationale, /location context only/)
  assert.match(employerCities[0]!.evidence.url, /^https:\/\//)
})

test("P1.6 keeps opportunities evergreen-only and rejects the legacy job table as public truth", () => {
  assert.equal(IRELAND_EMPLOYMENT_ECOSYSTEM.opportunities.kind, "evergreen_employer_context_only")
  assert.deepEqual(IRELAND_EMPLOYMENT_ECOSYSTEM.opportunities.publishedOpportunities, [])
  assert.match(IRELAND_EMPLOYMENT_ECOSYSTEM.opportunities.rationale, /no verified Ireland rows or expiry-safe employer identity model/)
  assert.doesNotMatch(reader, /career_foundation_job_opportunities/)
  assert.doesNotMatch(reader, /supabase/)
})

test("Ireland Country and Career surfaces consume the server-only model without Programme or hiring claims", () => {
  assert.match(reader, /import "server-only"/)
  assert.match(reader, /getIrelandEmploymentEcosystem = cache/)
  assert.match(reader, /getIrelandCareerEmploymentContext = cache/)
  assert.match(countryPage, /getIrelandEmploymentEcosystem\(\)/)
  assert.match(countryPage, /Promise\.all/)
  assert.match(countrySection, /<h2[^>]*>Industries<\/h2>/)
  assert.match(countrySection, /careerCanonicalPath\("IE", connection\.careerId\)/)
  assert.match(countrySection, /Related careers/)
  assert.match(careerRead, /country === "IE" \? getIrelandCareerEmploymentContext\(careerId\) : Promise\.resolve\(null\)/)
  assert.match(careerCore, /Selected employers relevant to this career/)
  assert.match(careerCore, /href={industry\.evidence\.url}/)
  assert.match(careerCore, /does not indicate current hiring, salary or visa sponsorship/)
  assert.doesNotMatch(countrySection, /\/programs\/ie/)
  assert.doesNotMatch(careerCore, /Programme.*employment ecosystem/i)
})
