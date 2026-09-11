import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) => {
  const normalized = sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()
  return `${sql}\n${normalized}`
}

const migration = normalizeMigrationSql(readFileSync(new URL("../supabase/migrations/20260809123200_australia_interior_designer_profile.sql", import.meta.url), "utf8"))

test("Australia Interior Designer uses exact OSCA 242431 scope", () => {
  const career = getCanonicalCareer("interior-designer")
  const editorial = getOccupationEditorial("interior-designer")
  assert.ok(career)
  assert.equal(career.categoryId, "design")
  assert.ok(editorial)
  assert.match(migration, /OSCA 242431 Interior Designer/i)
  assert.match(editorial.overview, /Interior Decorator separate/i)
})

test("Australia Interior Designer keeps broader labour contextual", () => {
  assert.match(migration, /'AU:interior-designer','2026-05-01',null,null,null,null/)
  assert.match(migration, /244\.33333,'2026-05-01',36\.75,11\.05,20\.02/)
  assert.match(migration, /no intensity or trend credit/i)
})

test("Australia Interior Designer has NS shortage and exact migration path", () => {
  const australia = getOccupationEditorial("interior-designer")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /VETASSESS assesses ANZSCO 232511 Interior Designer as Group B/i)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /0,0,5,0,13,0,5,10,3,36/)
})

test("Australia Interior Designer links current study routes dynamically", () => {
  assert.match(migration, /course_code='083945G'/)
  assert.match(migration, /course_code='071631C'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
})
