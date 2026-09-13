import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  institutionCountryPath,
  institutionDetailPath,
  normalizeInstitutionCountrySegment,
} from "../src/lib/institutions/institution-search"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const reader = read("src/lib/institutions/ireland-institutions.server.ts")
const seo = read("src/lib/institutions/institution-seo-ie.ts")
const countryPage = read("src/app/(workspace)/countries/ie/page.tsx")
const dashboard = read("src/app/(workspace)/countries/ireland-country-dashboard.tsx")
const explorer = read("src/app/(workspace)/institutions/ireland-institutions-explorer.tsx")
const detail = read("src/app/(workspace)/institutions/ireland-institution-detail.tsx")
const countryRoute = read("src/app/(workspace)/institutions/[country]/page.tsx")
const detailRoute = read("src/app/(workspace)/institutions/[country]/[institution]/page.tsx")
const sitemap = read("src/app/sitemap.ts")

test("Ireland institution read path is an explicit verified institution-location boundary", () => {
  assert.match(reader, /import "server-only"/)
  assert.match(reader, /city_institution_directory_ie_v1/)
  assert.match(reader, /city_directory_ie_v1/)
  assert.match(reader, /IE_PROVIDER_AUTHORITY = "Higher Education Authority"/)
  assert.match(reader, /IE_LOCATION_QUALITY = "verified_official"/)
  assert.match(reader, /IE_LINKAGE_BASIS = "verified_official_location"/)
  assert.match(reader, /verified_campus_location/)
  assert.match(reader, /verified_institution_location/)
  assert.match(reader, /programme_coverage_status !== "verification_pending"/)
  assert.match(reader, /ieCityPath\(slug\)/)
  assert.match(reader, /isIndexableIrelandInstitutionSlug\(slug\)/)
  assert.doesNotMatch(reader, /colleges_ie|institution_detail_v1|program_count|city_programme_directory_ie_v1/)
})

test("Ireland publishes only the audited nine-institution cohort on canonical routes", () => {
  assert.equal(normalizeInstitutionCountrySegment("ie"), "IE")
  assert.equal(institutionCountryPath("IE"), "/institutions/ie")
  assert.equal(institutionDetailPath("IE", "Trinity-College-Dublin"), "/institutions/ie/trinity-college-dublin")
  assert.equal((seo.match(/\["IE", "[a-z0-9-]+"\]/g) ?? []).length, 9)
  assert.match(seo, /trinity-college-dublin/)
  assert.match(seo, /university-of-galway/)
  assert.match(seo, /INDEXABLE_IE_INSTITUTION_PATHS/)
  assert.match(sitemap, /institutions\/ie/)
  assert.match(sitemap, /INDEXABLE_IE_INSTITUTION_PATHS/)
})

test("Country, explorer and detail surfaces preserve the programme gate while linking published cities", () => {
  assert.match(countryPage, /getIrelandInstitutions\(\)/)
  assert.match(countryPage, /Promise\.all/)
  assert.match(dashboard, /Education in Ireland/)
  assert.match(dashboard, /institutions\.map/)
  assert.match(dashboard, /institutionDetailPath\("IE", institution\.slug\)/)
  assert.match(dashboard, /location\.city\.name/)
  assert.doesNotMatch(dashboard, /Open \{location\.city\.name\}/)
  assert.doesNotMatch(dashboard, /profile\.majorInstitutions/)
  assert.match(dashboard, /Study areas/)
  assert.match(dashboard, /degreeConnections\.map/)

  assert.match(countryRoute, /countryCode === "IE"[\s\S]*IrelandInstitutionsExplorer/)
  assert.match(countryRoute, /IrelandInstitutionsExplorer/)
  assert.match(explorer, /HEA-recognised institution/)
  assert.match(explorer, /Programme listings are not published from this institution layer\./)
  assert.doesNotMatch(explorer, /programCount|\/programs\/ie/)

  assert.match(detailRoute, /countryCode === "IE"/)
  assert.match(detailRoute, /IrelandInstitutionDetailView/)
  assert.match(detail, /Verified programme listings are not yet published for this institution\./)
  assert.match(detail, /location\.city\.path/)
  assert.match(detail, /Official location evidence/)
  assert.doesNotMatch(detail, /programCount|\/programs\/ie|international eligibility is verified/)
})
