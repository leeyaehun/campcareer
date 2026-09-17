import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const identity = read("supabase/migrations/20260808231000_sg_autonomous_university_identity_foundation.sql")
const locations = read("supabase/migrations/20260808231500_sg_autonomous_university_location_quality.sql")
const publication = read("supabase/migrations/20260808232000_sg_publication_read_models.sql")
const routes = read("src/lib/institutions/institution-search.ts")
const explorer = read("src/lib/institutions/institutions.server.ts")
const explorerSearch = read("src/lib/institutions/institution-search.ts")
const detail = read("src/lib/institutions/institution-detail.server.ts")
const ui = read("src/app/(workspace)/institutions/singapore-institution-detail.tsx")
const seo = read("src/lib/institutions/institution-seo-sg.ts")
const sitemap = read("src/app/sitemap.ts")

test("SG Tier A contains six MOE autonomous universities with UEN identity", () => {
  for (const uen of ["200604346E", "200604393R", "200000267Z", "200913519C", "200917667D", "200504979Z"]) assert.match(identity, new RegExp(uen))
  assert.match(identity, /'SG_UEN'/)
  assert.match(identity, /institution_identity_sg_v1/)
  assert.match(identity, /ownership_type = null/)
})

test("SG official locations preserve address precision without invented coordinates", () => {
  for (const address of ["21 Lower Kent Ridge Road", "50 Nanyang Avenue", "81 Victoria Street", "8 Somapah Road", "1 Punggol Coast Road", "463 Clementi Road"]) assert.match(locations, new RegExp(address))
  assert.match(locations, /verified_official/)
  assert.match(locations, /coordinate_precision', 'not_asserted'/)
  assert.match(locations, /institution_location_sg_v1/)
})

test("SG publication uses dedicated read models and pending programme semantics", () => {
  assert.match(publication, /institution_explorer_sg_v1/)
  assert.match(publication, /institution_detail_sg_v1/)
  assert.match(routes, /"SG"/)
  assert.match(explorerSearch, /institution_explorer_sg_v1/)
  assert.match(explorer, /institutionExplorerViewName\(countryCode\)/)
  assert.match(detail, /institution_detail_sg_v1/)
  assert.match(detail, /institution_identity_sg_v1/)
  assert.match(detail, /missing its official UEN identity/)
  assert.match(ui, /CampCareer has not published the Singapore program catalogue yet/)
})

test("SG SEO publishes exactly six canonical institution routes", () => {
  const seoRoutes = seo.match(/\["SG", "[a-z0-9-]+"\]/g) ?? []
  assert.equal(seoRoutes.length, 6)
  assert.match(sitemap, /institutions\/sg/)
  assert.match(sitemap, /INDEXABLE_SG_INSTITUTION_PATHS/)
})
