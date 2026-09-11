import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) => {
  const normalized = sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()
  return `${sql}\n${normalized}`
}


const migration = readFileSync(new URL("../supabase/migrations/20260809123856_australia_web_designer_profile.sql", import.meta.url), "utf8")

const migrationSql = normalizeMigrationSql(migration)

test("Australia Web Designer uses exact OSCA 242133 scope", () => {
  const career = getCanonicalCareer("web-designer")
  const editorial = getOccupationEditorial("web-designer")
  assert.ok(career)
  assert.equal(career.categoryId, "design")
  assert.ok(editorial)
  assert.match(migrationSql, /OSCA 242133 Web Designer/i)
  assert.match(editorial.overview, /Web Developer as separate occupations/i)
})

test("Australia Web Designer uses exact legacy labour and broader vacancy context", () => {
  assert.match(migrationSql, /5300,null,null,null,1852,31,46,36,41/)
  assert.match(migrationSql, /441,'2026-05-01',-7\.68,9\.86,18\.96/)
  assert.match(migrationSql, /vacancy intensity and trend receive zero credit/i)
})

test("Australia Web Designer has NS shortage and current migration credit", () => {
  const australia = getOccupationEditorial("web-designer")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /VETASSESS assesses ANZSCO 232414 Web Designer as Group B/i)
  assert.match(migrationSql, /No Shortage nationally/i)
  assert.match(migrationSql, /0,0,5,0,13,0,5,10,3,36/)
})

test("Australia Web Designer links direct and related study routes dynamically", () => {
  assert.match(migrationSql, /course_code='103344H'/)
  assert.match(migrationSql, /course_code='080226G'/)
  assert.match(migrationSql, /case when institution_id='torrens-university' then 'direct' else 'related' end/)
  assert.match(migrationSql, /'au-program:'\|\|id::text/)
})
