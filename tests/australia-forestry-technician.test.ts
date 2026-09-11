import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809103215_australia_forestry_technician_profile.sql", import.meta.url), "utf8")

test("Australia Forestry Technician is scoped within current OSCA 311535", () => {
  const career = getCanonicalCareer("forestry-technician")
  const editorial = getOccupationEditorial("forestry-technician")
  assert.ok(career)
  assert.equal(career.categoryId, "environment")
  assert.ok(editorial)
  assert.match(migration, /current OSCA 311535 Life Science Technician/i)
  assert.match(editorial.overview, /no longer names Forestry Technician as a standalone occupation/i)
})

test("Australia Forestry Technician records ANZSCO 311413 as broader mapping, not exact labour", () => {
  assert.match(migration, /'ANZSCO','2022','311413'/)
  assert.match(migration, /employment_total',2500/)
  assert.match(migration, /broader than forestry/i)
  assert.match(migration, /'AU:forestry-technician','2026-05-01',null,null,null,null/)
})

test("Australia Forestry Technician has no shortage or current CSOL credit", () => {
  const australia = getOccupationEditorial("forestry-technician")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /0,0,5,0,15,0,5,0,5,30/)
  assert.match(australia.scoreCaveat, /No Shortage nationally/i)
  assert.match(australia.scoreCaveat, /not Life Science Technician 311413/i)
})

test("Australia Forestry Technician preserves broader 3114 demand as context", () => {
  assert.match(migration, /139\.33333,'2026-05-01',7\.45,3\.30,8\.60/)
  assert.match(migration, /no exact vacancy credit/i)
})

test("Australia Forestry Technician links RMIT diploma routes dynamically", () => {
  assert.match(migration, /course_code in \('104848J','112044A'\)/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:15093'/)
  assert.doesNotMatch(migration, /'au-program:15182'/)
})
