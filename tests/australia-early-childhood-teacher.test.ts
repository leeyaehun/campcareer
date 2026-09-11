import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) =>
  sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()


const migration = normalizeMigrationSql(readFileSync(
  new URL("../supabase/migrations/20260809090328_australia_early_childhood_teacher_profile.sql", import.meta.url),
  "utf8",
))

test("Australia Early Childhood Teacher maps exactly to current OSCA 251131", () => {
  const career = getCanonicalCareer("early-childhood-teacher")
  const editorial = getOccupationEditorial("early-childhood-teacher")
  assert.ok(career)
  assert.equal(career.categoryId, "education")
  assert.ok(editorial)
  assert.match(migration, /OSCA 251131 Early Childhood \(Pre-primary School\) Teacher/)
  assert.match(migration, /'251131', 'Early Childhood \(Pre-primary School\) Teacher'/)
  assert.match(migration, /'ANZSCO', '2022', '241111'/)
  assert.match(editorial.overview, /Skill Level 1/i)
})

test("Australia Early Childhood Teacher does not treat broader 2411 labour data as exact", () => {
  assert.match(migration, /'AU:early-childhood-teacher', '2026-05-01', null, null, null, null/)
  assert.match(migration, /'employment_total', 71900/)
  assert.match(migration, /'median_weekly_earnings_aud', 1906/)
  assert.match(migration, /context only/i)
})

test("Australia Early Childhood Teacher preserves shortage and conservative demand scoring", () => {
  const australia = getOccupationEditorial("early-childhood-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /1072\.66667, '2026-05-01', -21\.87/)
  assert.match(migration, /5\.72, 12\.08, 20, 0, 5, 0, 13, 0, 5, 10, 2, 55/)
  assert.match(migration, /national shortage occupation/i)
  assert.match(australia.scoreCaveat, /21\.87% year on year/i)
})

test("Australia Early Childhood Teacher uses ACECQA migration and registration evidence", () => {
  const australia = getOccupationEditorial("early-childhood-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /ANZSCO 241111.*ACECQA/i)
  assert.match(migration, /registration or licensing is required/i)
  assert.match(australia.registration, /state, territory and employment setting/i)
})

test("Australia Early Childhood Teacher links verified Deakin initial-teacher-education routes", () => {
  const australia = getOccupationEditorial("early-childhood-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /deakin-university' and course_code = '102806B'/)
  assert.match(migration, /deakin-university' and course_code = '114296J'/)
  assert.match(migration, /'au-program:' \|\| id::text/)
  assert.doesNotMatch(migration, /'au-program:3952'/)
  assert.doesNotMatch(migration, /'au-program:3992'/)
  assert.match(australia.entryPathway, /ACECQA/i)
})

test("Australia Early Childhood Teacher does not fabricate regional shortage from national rating", () => {
  for (const region of ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]) {
    assert.match(migration, new RegExp(`'AU:early-childhood-teacher', '${region}', '2026-05-01', null`))
  }
})
