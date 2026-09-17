import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const readRepoFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const identity = readRepoFile("supabase/migrations/20260808225000_nz_university_identity_foundation.sql")
const locations = readRepoFile("supabase/migrations/20260808225500_nz_university_location_quality.sql")
const publication = readRepoFile("supabase/migrations/20260808230000_nz_publication_read_models.sql")
const searchRoutes = readRepoFile("src/lib/institutions/institution-search.ts")
const explorerServer = readRepoFile("src/lib/institutions/institutions.server.ts")
const detailServer = readRepoFile("src/lib/institutions/institution-detail.server.ts")
const explorerUi = readRepoFile("src/app/(workspace)/institutions/institutions-explorer.tsx")
const detailUi = readRepoFile("src/app/(workspace)/institutions/new-zealand-institution-detail.tsx")
const detailPage = readRepoFile("src/app/(workspace)/institutions/[country]/[institution]/page.tsx")
const countryPage = readRepoFile("src/app/(workspace)/institutions/[country]/page.tsx")
const seo = readRepoFile("src/lib/institutions/institution-seo-nz.ts")
const sitemap = readRepoFile("src/app/sitemap.ts")

test("NZ Tier A foundation contains eight current universities with official NZQA provider numbers", () => {
  for (const providerNumber of ["7001", "7002", "7003", "7004", "7005", "7006", "7007", "7008"]) {
    assert.match(identity, new RegExp(`'${providerNumber}'`))
  }
  assert.match(identity, /'NZ_MOE_PROVIDER_NUMBER'/)
  assert.match(identity, /'university'/)
  assert.match(identity, /'public'/)
  assert.match(identity, /institution_identity_nz_v1/)
  assert.match(identity, /Expected 8 NZ provider identities/)
})

test("NZ location layer publishes registry-backed cities without invented coordinates", () => {
  assert.match(locations, /verified_registry_city/)
  assert.match(locations, /nzqa-head-office-city/)
  assert.match(locations, /coordinate_precision', 'not_asserted'/)
  assert.match(locations, /institution_location_nz_v1/)
  assert.match(locations, /Expected 8 NZ registry locations across 8 universities/)
  assert.match(locations, /must not assert unverified precise coordinates/)
})

test("NZ publication read models expose eight details while the program catalogue remains pending", () => {
  assert.match(publication, /institution_explorer_nz_v1/)
  assert.match(publication, /institution_detail_nz_v1/)
  assert.match(publication, /Expected NZ identity\/explorer\/detail counts 8\/8\/8/)
  assert.match(publication, /programme catalogue pending/)
})

test("NZ routes use dedicated read models and fail closed without NZQA identity", () => {
  assert.match(searchRoutes, /"NZ"/)
  assert.match(searchRoutes, /institution_explorer_nz_v1/)
  assert.match(explorerServer, /institutionExplorerViewName\(countryCode\)/)
  assert.match(detailServer, /institution_detail_nz_v1/)
  assert.match(detailServer, /institution_identity_nz_v1/)
  assert.match(detailServer, /missing its official NZQA provider identity/)
})

test("NZ UI clearly distinguishes registry identity from the not-yet-published program catalogue", () => {
  assert.match(explorerUi, /countryCode === "NZ"/)
  assert.match(explorerUi, /Program catalog pending/)
  assert.match(detailUi, /NZQA provider number/)
  assert.match(detailUi, /CampCareer has not published the New Zealand program catalogue yet/)
  assert.match(detailUi, /does not infer a complete campus inventory or precise coordinates/)
  assert.match(detailPage, /NewZealandInstitutionDetailView/)
  assert.match(countryPage, /New Zealand catalogue is verified/)
})

test("NZ Tier A SEO inventory contains exactly eight canonical institution routes", () => {
  const routes = seo.match(/\["NZ", "[a-z0-9-]+"\]/g) ?? []
  assert.equal(routes.length, 8)
  assert.match(seo, /university-of-auckland/)
  assert.match(seo, /auckland-university-of-technology/)
  assert.match(seo, /victoria-university-of-wellington/)
  assert.match(sitemap, /institutions\/nz/)
  assert.match(sitemap, /INDEXABLE_NZ_INSTITUTION_PATHS/)
})
