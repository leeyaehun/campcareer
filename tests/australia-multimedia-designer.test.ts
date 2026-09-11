import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) =>
  sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()

const migration = normalizeMigrationSql(readFileSync(new URL("../supabase/migrations/20260809121638_australia_multimedia_designer_profile.sql", import.meta.url), "utf8"))

test("Australia Multimedia Designer uses exact current OSCA 242131 scope", () => {
  const career = getCanonicalCareer("multimedia-designer")
  const editorial = getOccupationEditorial("multimedia-designer")
  assert.ok(career)
  assert.equal(career.categoryId, "design")
  assert.ok(editorial)
  assert.match(migration, /Current OSCA 242131 Multimedia Designer is exact/i)
  assert.match(editorial.overview, /exact current OSCA occupation, 242131 Multimedia Designer/i)
})

test("Australia Multimedia Designer preserves split ANZSCO correspondence", () => {
  assert.match(migration, /232413 Multimedia Designer and 261211 Multimedia Specialist/i)
  assert.match(migration, /'AU:multimedia-designer','2026-05-01',null,null,null,null/)
  assert.match(migration, /'employment_total',4600/)
  assert.match(migration, /'employment_total',1100/)
})

test("Australia Multimedia Designer keeps broader labour contextual and migration partial", () => {
  const australia = getOccupationEditorial("multimedia-designer")?.countries.AU
  assert.ok(australia)
  assert.match(australia.scoreCaveat, /partial visa credit/i)
  assert.match(migration, /441,'2026-05-01',-7\.68,9\.86,18\.96/)
  assert.match(migration, /0,0,5,0,13,0,5,5,5,33/)
})

test("Australia Multimedia Designer links current study routes dynamically", () => {
  assert.match(migration, /course_code='080226G'/)
  assert.match(migration, /course_code='077339C'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:5658'/)
  assert.doesNotMatch(migration, /'au-program:2296'/)
})
