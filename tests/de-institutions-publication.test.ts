import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const identity = read("supabase/migrations/20260808233000_de_excellence_university_identity_foundation.sql")
const locations = read("supabase/migrations/20260808233500_de_excellence_university_location_quality.sql")
const publication = read("supabase/migrations/20260808234000_de_publication_read_models.sql")
const routes = read("src/lib/institutions/institution-search.ts")
const explorer = read("src/lib/institutions/institutions.server.ts")
const detail = read("src/lib/institutions/institution-detail.server.ts")
const ui = read("src/app/(workspace)/institutions/germany-institution-detail.tsx")
const seo = read("src/lib/institutions/institution-seo-de.ts")
const sitemap = read("src/app/sitemap.ts")

test("DE Tier A contains twelve continuing Excellence university entities without inventing a national ID", () => {
  const domains = identity.match(/\('[a-z0-9.-]+', '[a-z0-9-]+', '[^']+', 'https:\/\//g) ?? []
  assert.equal(domains.length, 12)
  assert.match(identity, /DE_HRK_VERIFIED_DOMAIN/)
  assert.match(identity, /Germany has no single common UKPRN\/UEN-like national identifier used here/)
  assert.match(identity, /regulatory number/)
  assert.match(identity, /ownership_type = null/)
  assert.match(identity, /Expected 12 DE Tier A university entities/)
})

test("DE location layer publishes twelve city-level rows without campus precision", () => {
  assert.match(locations, /verified_official_city/)
  assert.match(locations, /DFG_EXCELLENCE_STRATEGY/)
  assert.match(locations, /campus_inventory_complete', false/)
  assert.match(locations, /coordinate_precision', 'not_asserted'/)
  assert.match(locations, /Expected 12 DE city locations across 12 institutions/)
})

test("DE publication uses dedicated read models and catalogue-pending semantics", () => {
  assert.match(publication, /institution_explorer_de_v1/)
  assert.match(publication, /institution_detail_de_v1/)
  assert.match(routes, /"DE"/)
  assert.match(routes, /institution_explorer_de_v1/)
  assert.match(explorer, /institutionExplorerViewName\(countryCode\)/)
  assert.match(detail, /institution_detail_de_v1/)
  assert.match(detail, /missing its HRK-verified official domain identity/)
  assert.match(ui, /CampCareer has not published the Germany program catalogue yet/)
})

test("DE SEO publishes exactly twelve canonical Tier A routes", () => {
  const seoRoutes = seo.match(/\["DE", "[a-z0-9-]+"\]/g) ?? []
  assert.equal(seoRoutes.length, 12)
  assert.match(seo, /rwth-aachen-university/)
  assert.match(seo, /technical-university-of-munich/)
  assert.match(seo, /university-of-tuebingen/)
  assert.match(sitemap, /institutions\/de/)
  assert.match(sitemap, /INDEXABLE_DE_INSTITUTION_PATHS/)
})
