import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809123705_australia_architect_profile.sql", import.meta.url), "utf8")

test("Australia Architect uses exact OSCA 241131 scope", () => {
  const career = getCanonicalCareer("architect")
  const editorial = getOccupationEditorial("architect")
  assert.ok(career)
  assert.equal(career.categoryId, "design")
  assert.ok(editorial)
  assert.match(migration, /OSCA 241131 Architect/i)
  assert.match(editorial.overview, /professional registration is required/i)
})

test("Australia Architect preserves exact labour and broader vacancy scope", () => {
  assert.match(migration, /19300,null,null,null,1852,19,34,40,44/)
  assert.match(migration, /455\.66667,'2026-05-01',13\.16,10\.26,19\.20/)
  assert.match(migration, /vacancy intensity and trend receive zero credit/i)
})

test("Australia Architect has registration and current migration credit", () => {
  const australia = getOccupationEditorial("architect")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /Architects Registration Boards/i)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /0,0,5,0,10,0,5,10,1,31/)
})

test("Australia Architect links current professional study routes dynamically", () => {
  assert.match(migration, /course_code='060829B'/)
  assert.match(migration, /course_code='061906G'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
})
