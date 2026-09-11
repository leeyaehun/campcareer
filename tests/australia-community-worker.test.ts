import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260809095008_australia_community_worker_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Community Worker maps exactly to OSCA 411232 Community Support Worker", () => {
  const career = getCanonicalCareer("community-worker")
  const editorial = getOccupationEditorial("community-worker")
  assert.ok(career)
  assert.equal(career.categoryId, "education")
  assert.ok(editorial)
  assert.match(migration, /OSCA 411232 Community Support Worker/)
  assert.match(editorial.overview, /Community Worker and Community Services Worker as alternative titles/i)
  assert.match(editorial.overview, /Skill Level 2/i)
})

test("Australia Community Worker preserves the unusual official 411512 correspondence without inventing labour data", () => {
  assert.match(migration, /anzsco_v13 = '411512'/)
  assert.match(migration, /does not provide a clean Australian JSA labour-market series/i)
  assert.match(migration, /'AU:community-worker','2026-05-01',null,null,null,null,1852,null,null,null,null,\s*null,null,null,null,null/)
  assert.match(migration, /Legacy ANZSCO 411711 Community Worker was reorganised/i)
})

test("Australia Community Worker preserves national no-shortage with NT and WA shortages", () => {
  const australia = getOccupationEditorial("community-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /'NT','2026-05-01',3,null/)
  assert.match(migration, /'WA','2026-05-01',3,null/)
  assert.match(australia.jobMarketNote, /Northern Territory and Western Australia/i)
})

test("Australia Community Worker uses a conservative no-labour no-visa score", () => {
  const australia = getOccupationEditorial("community-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /0,0,5,0,15,0,0,0,5,25/)
  assert.match(migration, /does not include OSCA 411232/i)
  assert.match(australia.scoreCaveat, /no aligned current labour series or reviewed CSOL pathway/i)
})

test("Australia Community Worker links current diploma and bachelor routes dynamically", () => {
  const australia = getOccupationEditorial("community-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /torrens-university' and course_code = '111741F'/)
  assert.match(migration, /tafe-nsw' and course_code = '118878K'/)
  assert.match(migration, /duration_years = 1\.0/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.match(australia.entryPathway, /one-year international vocational route/i)
})

test("Australia Community Worker records no universal statutory registration", () => {
  const australia = getOccupationEditorial("community-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /'AUD',false/)
  assert.match(australia.registration, /NDIS worker screening/i)
})
