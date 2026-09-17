import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const identity = read("supabase/migrations/20260808235000_fr_idex_university_identity_foundation.sql")
const locations = read("supabase/migrations/20260808235500_fr_idex_university_location_quality.sql")
const publication = read("supabase/migrations/20260809000000_fr_publication_read_models.sql")
const routes = read("src/lib/institutions/institution-search.ts")
const explorer = read("src/lib/institutions/institutions.server.ts")
const detail = read("src/lib/institutions/institution-detail.server.ts")
const ui = read("src/app/(workspace)/institutions/france-institution-detail.tsx")
const seo = read("src/lib/institutions/institution-seo-fr.ts")
const sitemap = read("src/app/sitemap.ts")

test("FR Tier A contains nine IdEx universities with official UAI identities", () => {
  for (const uai of ["0134009M", "0333298F", "0673021V", "0755890V", "0912408Y", "0756036D", "0383546Y", "0062205P", "0755976N"]) {
    assert.match(identity, new RegExp(uai))
  }
  assert.match(identity, /FR_UAI/)
  assert.match(identity, /institution_identity_fr_v1/)
  assert.match(identity, /ownership_type = excluded.ownership_type/)
  assert.match(identity, /Expected 9 FR UAI identities/)
})

test("FR registered locations are source-backed and do not invent coordinates", () => {
  assert.match(locations, /verified_official/)
  assert.match(locations, /ONISEP_UAI/)
  assert.match(locations, /campus_inventory_complete',false/)
  assert.match(locations, /coordinate_precision','not_asserted/)
  assert.match(locations, /Expected 9 FR IdEx locations/)
})

test("FR publication uses dedicated read models and pending programme semantics", () => {
  assert.match(publication, /institution_explorer_fr_v1/)
  assert.match(publication, /institution_detail_fr_v1/)
  assert.match(routes, /"FR"/)
  assert.match(routes, /institution_explorer_fr_v1/)
  assert.match(explorer, /institutionExplorerViewName\(countryCode\)/)
  assert.match(detail, /institution_detail_fr_v1/)
  assert.match(detail, /institution_identity_fr_v1/)
  assert.match(detail, /missing its official UAI identity/)
  assert.match(ui, /CampCareer has not published the France program catalogue yet/)
})

test("FR SEO publishes exactly nine canonical IdEx routes", () => {
  const seoRoutes = seo.match(/\["FR", "[a-z0-9-]+"\]/g) ?? []
  assert.equal(seoRoutes.length, 9)
  assert.match(seo, /universite-paris-saclay/)
  assert.match(seo, /sorbonne-universite/)
  assert.match(seo, /universite-grenoble-alpes/)
  assert.match(sitemap, /institutions\/fr/)
  assert.match(sitemap, /INDEXABLE_FR_INSTITUTION_PATHS/)
})
