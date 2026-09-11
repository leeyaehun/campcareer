import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) =>
  sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()


const migration = readFileSync(
  new URL("../supabase/migrations/20260809090746_australia_secondary_school_teacher_profile.sql", import.meta.url),
  "utf8",
)

const migrationSql = normalizeMigrationSql(migration)

test("Australia Secondary School Teacher maps exactly to current OSCA 251331 and ANZSCO 241411", () => {
  const career = getCanonicalCareer("secondary-school-teacher")
  const editorial = getOccupationEditorial("secondary-school-teacher")
  assert.ok(career)
  assert.equal(career.categoryId, "education")
  assert.ok(editorial)
  assert.match(migrationSql, /OSCA 251331 Secondary School Teacher/)
  assert.match(migrationSql, /anzsco_v13 = '241411'/)
  assert.match(migrationSql, /'ANZSCO','2022','241411'/)
  assert.match(migrationSql, /anzsco_v13_code = '241411'/)
})

test("Australia Secondary School Teacher corrects the stale 241311 staging mapping", () => {
  assert.match(migrationSql, /anzsco_v13_code = '241311'/)
  assert.match(migrationSql, /corrects the pre-existing staging value 241311 to 241411/i)
})

test("Australia Secondary School Teacher keeps broader 2414 labour data contextual", () => {
  assert.match(migrationSql, /'AU:secondary-school-teacher','2026-05-01',null,null,null,null/)
  assert.match(migrationSql, /'employment_total',161400/)
  assert.match(migrationSql, /'median_weekly_earnings_aud',2322/)
  assert.match(migrationSql, /context only/i)
})

test("Australia Secondary School Teacher preserves shortage and conservative demand scoring", () => {
  const australia = getOccupationEditorial("secondary-school-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migrationSql, /762\.33333,'2026-05-01',-10\.73,5\.45,11\.68,20,0,5,0,13,0,5,10,2,55/)
  assert.match(migrationSql, /national shortage occupation/i)
  assert.match(australia.scoreCaveat, /10\.73% year on year/i)
})

test("Australia Secondary School Teacher records AITSL migration and teacher-registration requirements", () => {
  const australia = getOccupationEditorial("secondary-school-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migrationSql, /ANZSCO 241411.*AITSL/i)
  assert.match(australia.registration, /state and territory teacher regulatory authorities/i)
})

test("Australia Secondary School Teacher links verified undergraduate and graduate-entry routes", () => {
  const australia = getOccupationEditorial("secondary-school-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migrationSql, /the-university-of-notre-dame-australia'\s+and course_code\s*=\s*'116885E'/)
  assert.match(migrationSql, /rmit-university'\s+and course_code\s*=\s*'113706D'/)
  assert.match(migrationSql, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migrationSql, /'au-program:18605'/)
  assert.doesNotMatch(migrationSql, /'au-program:5813'/)
})

test("Australia Secondary School Teacher regional rows do not infer shortage from national rating", () => {
  for (const region of ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]) {
    assert.match(migrationSql, new RegExp(`'AU:secondary-school-teacher','${region}','2026-05-01',null`))
  }
})
