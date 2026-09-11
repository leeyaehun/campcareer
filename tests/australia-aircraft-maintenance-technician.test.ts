import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809140216_australia_aircraft_maintenance_technician_profile.sql", import.meta.url), "utf8")

test("Australia Aircraft Maintenance Technician preserves three current OSCA streams", () => {
  const career = getCanonicalCareer("aircraft-maintenance-technician")
  const editorial = getOccupationEditorial("aircraft-maintenance-technician")
  assert.ok(career)
  assert.equal(career.categoryId, "transport")
  assert.ok(editorial)
  assert.match(migration, /332131/)
  assert.match(migration, /Avionics/)
  assert.match(migration, /332132/)
  assert.match(migration, /Mechanical/)
  assert.match(migration, /332133/)
  assert.match(migration, /Structures/)
})

test("Australia Aircraft Maintenance Technician sums only exact stream employment", () => {
  assert.match(migration, /4350,null,null,null,1852,null,null,null,null/)
  assert.match(migration, /combined demographics and earnings are intentionally null/i)
})

test("Australia Aircraft Maintenance Technician has shortage and TRA CSOL credit", () => {
  const australia = getOccupationEditorial("aircraft-maintenance-technician")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /Part 66/i)
  assert.match(migration, /20,0,5,0,13,0,5,10,3,56/)
})

test("Australia Aircraft Maintenance Technician does not force unrelated CRICOS programs", () => {
  assert.doesNotMatch(migration, /country_occupation_program_links/)
  assert.match(migration, /Aeroskills qualifications/)
})
