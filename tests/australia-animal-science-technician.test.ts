import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809112421_australia_animal_science_technician_profile.sql", import.meta.url), "utf8")

test("Australia Animal Science Technician uses related OSCA 311132 scope", () => {
  const career = getCanonicalCareer("animal-science-technician")
  const editorial = getOccupationEditorial("animal-science-technician")
  assert.ok(career)
  assert.equal(career.categoryId, "environment")
  assert.ok(editorial)
  assert.match(migration, /OSCA 311132 Animal Husbandry Technician/i)
  assert.match(editorial.overview, /closest non-clinical technical occupation/i)
})

test("Australia Animal Science Technician keeps Veterinary Technologist separate", () => {
  assert.match(migration, /Veterinary Technologist 269532 is clinical\/diagnostic/i)
  assert.match(migration, /not used as the primary mapping/i)
})

test("Australia Animal Science Technician keeps broader labour contextual", () => {
  assert.match(migration, /'AU:animal-science-technician','2026-05-01',null,null,null,null/)
  assert.match(migration, /'employment_total',2800/)
  assert.match(migration, /74,'2026-05-01',-14\.29,3\.21,8\.73/)
})

test("Australia Animal Science Technician has national No Shortage and partial migration credit", () => {
  const australia = getOccupationEditorial("animal-science-technician")?.countries.AU
  assert.ok(australia)
  assert.match(australia.scoreCaveat, /partial rather than full credit/i)
  assert.match(migration, /VETASSESS classifies it as Group C/i)
  assert.match(migration, /0,0,5,0,13,0,5,5,5,33/)
})

test("Australia Animal Science Technician links current study routes dynamically", () => {
  assert.match(migration, /course_code='068972G'/)
  assert.match(migration, /course_code='087886D'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:698'/)
  assert.doesNotMatch(migration, /'au-program:1505'/)
})
