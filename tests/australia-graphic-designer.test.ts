import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809121142_australia_graphic_designer_profile.sql", import.meta.url), "utf8")

test("Australia Graphic Designer uses exact current OSCA 242332 scope", () => {
  const career = getCanonicalCareer("graphic-designer")
  const editorial = getOccupationEditorial("graphic-designer")
  assert.ok(career)
  assert.equal(career.categoryId, "design")
  assert.ok(editorial)
  assert.match(migration, /Current OSCA 242332 is exact/i)
  assert.match(editorial.overview, /exact current OSCA occupation, 242332 Graphic Designer/i)
})

test("Australia Graphic Designer keeps partial ANZSCO labour contextual", () => {
  assert.match(migration, /'AU:graphic-designer','2026-05-01',null,null,null,null/)
  assert.match(migration, /'employment_total',27500/)
  assert.match(migration, /441,'2026-05-01',-7\.68,9\.86,18\.96/)
})

test("Australia Graphic Designer has national No Shortage and no current CSOL credit", () => {
  const australia = getOccupationEditorial("graphic-designer")?.countries.AU
  assert.ok(australia)
  assert.match(australia.scoreCaveat, /no visa credit/i)
  assert.match(migration, /does not list 232411/i)
  assert.match(migration, /0,0,5,0,13,0,5,0,5,28/)
})

test("Australia Graphic Designer links current programs dynamically", () => {
  assert.match(migration, /course_code='117452M'/)
  assert.match(migration, /course_code='079130D'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:5846'/)
  assert.doesNotMatch(migration, /'au-program:3502'/)
})
