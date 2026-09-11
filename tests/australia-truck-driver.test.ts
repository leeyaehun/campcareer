import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809135501_australia_truck_driver_profile.sql", import.meta.url), "utf8")

test("Australia Truck Driver preserves the current OSCA split", () => {
  const career = getCanonicalCareer("truck-driver")
  const editorial = getOccupationEditorial("truck-driver")
  assert.ok(career)
  assert.equal(career.categoryId, "transport")
  assert.ok(editorial)
  assert.match(migration, /713131/)
  assert.match(migration, /Truck Driver \(General\)/)
  assert.match(migration, /713231/)
  assert.match(migration, /Articulated Truck Driver/)
  assert.match(migration, /713232/)
  assert.match(migration, /Tanker Truck Driver/)
})

test("Australia Truck Driver uses legacy labour without inventing salary", () => {
  assert.match(migration, /148400,null,null,null,1852,16,4,48,50/)
  assert.match(migration, /2724\.33333,'2026-05-01',-0\.07,0\.61,4\.04/)
})

test("Australia Truck Driver uses mixed shortage and no CSOL credit", () => {
  const australia = getOccupationEditorial("truck-driver")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /heavy-vehicle driver licence/i)
  assert.match(migration, /mixed umbrella receives partial shortage credit/i)
  assert.match(migration, /15,0,5,0,15,0,0,0,5,40/)
})

test("Australia Truck Driver does not force a CRICOS program link", () => {
  assert.doesNotMatch(migration, /country_occupation_program_links/)
  assert.match(migration, /Service NSW — Heavy vehicle licence/)
})
