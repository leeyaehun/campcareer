import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260809094635_australia_youth_worker_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Youth Worker maps to current OSCA 411733 and legacy ANZSCO 411716", () => {
  const career = getCanonicalCareer("youth-worker")
  const editorial = getOccupationEditorial("youth-worker")
  assert.ok(career)
  assert.equal(career.categoryId, "education")
  assert.ok(editorial)
  assert.match(migration, /OSCA 411733 Youth Worker/)
  assert.match(migration, /anzsco_v13 = '411716'/)
  assert.match(editorial.overview, /Residential Youth Worker and Youth Justice Worker/i)
})

test("Australia Youth Worker does not treat split legacy labour data as exact", () => {
  assert.match(migration, /'AU:youth-worker','2026-05-01',null,null,null,null/)
  assert.match(migration, /legacy_411716_context/)
  assert.match(migration, /employment_total',16200/)
  assert.match(migration, /also maps to current OSCA 411732 Youth Justice Worker/i)
})

test("Australia Youth Worker preserves national no-shortage with NT and WA shortages", () => {
  const australia = getOccupationEditorial("youth-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /'NT','2026-05-01',3/)
  assert.match(migration, /'WA','2026-05-01',3/)
  assert.match(australia.jobMarketNote, /Northern Territory and Western Australia/i)
})

test("Australia Youth Worker scores only broader growth and reviewed visa evidence", () => {
  const australia = getOccupationEditorial("youth-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /1247\.33333,'2026-05-01',-1\.76,6\.04,11\.89,0,0,5,0,15,0,5,10,5,40/)
  assert.match(australia.scoreCaveat, /1\.76% lower year on year/i)
})

test("Australia Youth Worker has no universal statutory registration", () => {
  const australia = getOccupationEditorial("youth-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /'AUD',false/)
  assert.match(australia.registration, /Working-with-children checks/i)
})

test("Australia Youth Worker links two direct degree routes dynamically", () => {
  const australia = getOccupationEditorial("youth-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /rmit-university'\s+and course_code\s*=\s*'098456B'/)
  assert.match(migration, /australian-catholic-university'\s+and course_code\s*=\s*'084316G'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:5708'/)
  assert.doesNotMatch(migration, /'au-program:584'/)
  assert.match(australia.entryPathway, /three-year undergraduate routes/i)
})
