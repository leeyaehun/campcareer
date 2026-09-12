import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { IRELAND_VERIFIED_INSTITUTIONS } from "../src/lib/institutions/ireland-institution-contract"

function read(path: string) {
  return readFileSync(path, "utf8")
}

test("Ireland institution publication cohort is exactly the nine verified HEA-backed institutions", () => {
  assert.equal(IRELAND_VERIFIED_INSTITUTIONS.length, 9)
  assert.deepEqual(
    IRELAND_VERIFIED_INSTITUTIONS.map((institution) => institution.slug),
    [
      "dublin-city-university",
      "mary-immaculate-college",
      "rcsi-university-of-medicine-and-health-sciences",
      "technological-university-dublin",
      "trinity-college-dublin",
      "university-college-cork",
      "university-college-dublin",
      "university-of-galway",
      "university-of-limerick",
    ],
  )
})

test("Ireland Institution explorer and detail use only the verified city-institution foundation", () => {
  const search = read("src/lib/institutions/institution-search.ts")
  const explorer = read("src/lib/institutions/institutions.server.ts")
  const detail = read("src/lib/institutions/ireland-institution-detail.server.ts")

  assert.match(search, /"IE"/)
  assert.match(explorer, /city_institution_directory_ie_v1/)
  assert.match(explorer, /programCount: 0/)
  assert.match(detail, /city_institution_directory_ie_v1/)
  assert.match(detail, /status: "verified_official"/)
  assert.match(detail, /programCount: 0/)
  assert.doesNotMatch(detail, /institution_detail_v1/)
})

test("Ireland Country Intelligence links verified institution cards into public detail routes without bypassing the program gate", () => {
  const country = read("src/app/(workspace)/countries/ireland-country-dashboard.tsx")
  const explorerUi = read("src/app/(workspace)/institutions/institutions-explorer.tsx")
  const detailUi = read("src/app/(workspace)/institutions/institution-detail.tsx")
  const detailPage = read("src/app/(workspace)/institutions/[country]/[institution]/page.tsx")

  assert.match(country, /IRELAND_VERIFIED_INSTITUTIONS/)
  assert.match(country, /institutionDetailPath\("IE"/)
  assert.match(country, /Verified universities and colleges/)
  assert.match(explorerUi, /countryCode === "IE"/)
  assert.match(detailUi, /Program catalog pending verification/)
  assert.match(detailUi, /ieCityPath/)
  assert.match(detailPage, /getIrelandInstitutionDetail/)
  assert.match(detailPage, /INDEXABLE_IE_INSTITUTION_ROUTES/)
})

test("Ireland verified Institution routes are indexable and included in the sitemap", () => {
  const seo = read("src/lib/institutions/institution-seo-ie.ts")
  const sitemap = read("src/app/sitemap.ts")
  const countryPage = read("src/app/(workspace)/institutions/[country]/page.tsx")

  assert.match(seo, /INDEXABLE_IE_INSTITUTION_ROUTES/)
  assert.match(sitemap, /INDEXABLE_IE_INSTITUTION_PATHS/)
  assert.match(sitemap, /\/institutions\/ie/)
  assert.match(countryPage, /countryCode === "IE"/)
  assert.match(countryPage, /Higher Education Authority/)
})
