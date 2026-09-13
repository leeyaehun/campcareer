import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { PUBLISHED_IE_CITY_SLUGS } from "../src/lib/cities/city-routes"
import { INDEXABLE_IE_INSTITUTION_ROUTES } from "../src/lib/institutions/institution-seo-ie"
import type { IrelandInstitution } from "../src/lib/institutions/ireland-institutions.server"
import {
  filterIrelandPublicSearchEntries,
  irelandPublicSearchEntries,
} from "../src/lib/search/ireland-public-entity-search"
import { IE_CAREER_COMPARE_IDS } from "../src/lib/ireland-career-comparison"
import { careerCanonicalPath } from "../src/lib/workspace/occupation-routes"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

function fixtureInstitution(slug: string, index: number): IrelandInstitution {
  return {
    id: `institution-${index}`,
    countryCode: "IE",
    slug,
    name: `Verified institution ${index}`,
    websiteUrl: `https://institution-${index}.example.edu`,
    providerAuthority: "Higher Education Authority",
    providerSourceUrl: "https://hea.ie",
    locations: [{
      id: `location-${index}`,
      name: `Campus ${index}`,
      city: { id: "dublin", name: "Dublin", slug: "dublin", path: "/cities/ie/dublin" },
      region: "Leinster",
      addressLine: null,
      postalCode: null,
      sourceUrl: "https://hea.ie",
    }],
  }
}

const verifiedInstitutions = INDEXABLE_IE_INSTITUTION_ROUTES.map(([, slug], index) => fixtureInstitution(slug, index + 1))

test("Ireland public Search contains only the existing public country, Career, City and Institution destinations", () => {
  const entries = irelandPublicSearchEntries(verifiedInstitutions)

  assert.deepEqual(entries.filter((entry) => entry.type === "country").map((entry) => entry.href), ["/countries/ie"])
  assert.deepEqual(
    entries.filter((entry) => entry.type === "career").map((entry) => entry.careerId).sort(),
    [...IE_CAREER_COMPARE_IDS].sort(),
  )
  assert.deepEqual(
    entries.filter((entry) => entry.type === "city").map((entry) => entry.href).sort(),
    PUBLISHED_IE_CITY_SLUGS.map((slug) => `/cities/ie/${slug}`).sort(),
  )
  assert.deepEqual(
    entries.filter((entry) => entry.type === "institution").map((entry) => entry.href).sort(),
    INDEXABLE_IE_INSTITUTION_ROUTES.map(([, slug]) => `/institutions/ie/${slug}`).sort(),
  )
})

test("Ireland public Search uses canonical routes and keeps deferred or route-less entities out", () => {
  const software = filterIrelandPublicSearchEntries("software engineer", verifiedInstitutions)
  assert.deepEqual(software.map((entry) => entry.href), [careerCanonicalPath("IE", "software-developer")])

  assert.deepEqual(filterIrelandPublicSearchEntries("accountant", verifiedInstitutions), [])
  assert.deepEqual(filterIrelandPublicSearchEntries("kilkenny", verifiedInstitutions), [])
  assert.deepEqual(filterIrelandPublicSearchEntries("computer science", verifiedInstitutions), [])
  assert.deepEqual(filterIrelandPublicSearchEntries("microsoft", verifiedInstitutions), [])
  assert.deepEqual(
    filterIrelandPublicSearchEntries("construction", verifiedInstitutions).map((entry) => entry.type),
    ["career"],
  )
})

test("exact public entity names rank before broader partial matches", () => {
  const dublin = filterIrelandPublicSearchEntries("dublin", verifiedInstitutions)
  assert.equal(dublin[0]?.type, "city")
  assert.equal(dublin[0]?.href, "/cities/ie/dublin")
})

test("Career Search keeps Ireland country selections inside the public Career route inventory", () => {
  const explorer = read("src/app/(workspace)/occupation/occupation-explorer.tsx")
  const careersPage = read("src/app/(workspace)/careers/page.tsx")
  const sitemap = read("src/app/sitemap.ts")

  assert.match(explorer, /getIndexableCareerRoute\(countryCode, career\.id\)/)
  assert.match(careersPage, /searchIrelandPublicEntities\(q\)/)
  assert.match(careersPage, /IrelandPublicSearchResults/)
  assert.match(careersPage, /robots: \{ index: isBaseBrowse, follow: true \}/)
  assert.doesNotMatch(sitemap, /\/careers\?/)
})

test("the Ireland Search reader delegates institutions to the existing verified reader", () => {
  const reader = read("src/lib/search/ireland-public-entity-search.server.ts")

  assert.match(reader, /getIrelandInstitutions/)
  assert.doesNotMatch(reader, /supabaseAdmin|city_institution_directory_ie_v1/)
})
