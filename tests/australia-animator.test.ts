import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809122016_australia_animator_profile.sql", import.meta.url), "utf8")

test("Australia Animator uses exact current OSCA 242331 scope", () => {
  const career = getCanonicalCareer("animator")
  const editorial = getOccupationEditorial("animator")
  assert.ok(career)
  assert.equal(career.categoryId, "design")
  assert.ok(editorial)
  assert.match(migration, /Current OSCA 242331 Animator or Visual Effects Artist is exact/i)
  assert.match(editorial.overview, /exact current OSCA occupation, 242331 Animator or Visual Effects Artist/i)
})

test("Australia Animator keeps multiple ANZSCO correspondences contextual", () => {
  assert.match(migration, /232411 Graphic Designer, 232412 Illustrator and 232413 Multimedia Designer/i)
  assert.match(migration, /'AU:animator','2026-05-01',null,null,null,null/)
  assert.match(migration, /'employment_total',3400/)
  assert.match(migration, /441,'2026-05-01',-7\.68,9\.86,18\.96/)
})

test("Australia Animator has national No Shortage and partial Illustrator migration credit", () => {
  const australia = getOccupationEditorial("animator")?.countries.AU
  assert.ok(australia)
  assert.match(australia.scoreCaveat, /partial visa credit/i)
  assert.match(migration, /VETASSESS lists Animator as a suitable occupation under Illustrator/i)
  assert.match(migration, /0,0,5,0,13,0,5,5,5,33/)
})

test("Australia Animator links current animation programs dynamically", () => {
  assert.match(migration, /course_code='079976B'/)
  assert.match(migration, /course_code='092511D'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:5652'/)
  assert.doesNotMatch(migration, /'au-program:3610'/)
})
