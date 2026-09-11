import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) =>
  sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()


const migration = readFileSync(
  new URL("../supabase/migrations/20260809090539_australia_primary_school_teacher_profile.sql", import.meta.url),
  "utf8",
)

const migrationSql = normalizeMigrationSql(migration)

test("Australia Primary School Teacher maps exactly to current OSCA 251231 and ANZSCO 241213", () => {
  const career = getCanonicalCareer("primary-school-teacher")
  const editorial = getOccupationEditorial("primary-school-teacher")
  assert.ok(career)
  assert.equal(career.categoryId, "education")
  assert.ok(editorial)
  assert.match(migrationSql, /OSCA 251231 Primary School Teacher/)
  assert.match(migrationSql, /anzsco_v13 = '241213'/)
  assert.match(migrationSql, /'ANZSCO','2022','241213'/)
  assert.doesNotMatch(migrationSql, /anzsco_v13 = '241211'/)
})

test("Australia Primary School Teacher keeps broader 2412 labour data contextual", () => {
  assert.match(migrationSql, /'AU:primary-school-teacher','2026-05-01',null,null,null,null/)
  assert.match(migrationSql, /'employment_total',165900/)
  assert.match(migrationSql, /'median_weekly_earnings_aud',2226/)
  assert.match(migrationSql, /context only/i)
})

test("Australia Primary School Teacher preserves shortage and conservative demand scoring", () => {
  const australia = getOccupationEditorial("primary-school-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migrationSql, /476,'2026-05-01',-8\.11,5\.46,11\.71,20,0,5,0,13,0,5,10,2,55/)
  assert.match(migrationSql, /national shortage occupation/i)
  assert.match(australia.scoreCaveat, /8\.11% year on year/i)
})

test("Australia Primary School Teacher records AITSL migration and registration requirements", () => {
  const australia = getOccupationEditorial("primary-school-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migrationSql, /ANZSCO 241213.*AITSL/i)
  assert.match(australia.registration, /state and territory teacher regulatory authorities/i)
})

test("Australia Primary School Teacher links verified initial-teacher-education routes without generated ids", () => {
  const australia = getOccupationEditorial("primary-school-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migrationSql, /deakin-university'\s+and course_code\s*=\s*'118365B'/)
  assert.match(migrationSql, /rmit-university'\s+and course_code\s*=\s*'113707C'/)
  assert.match(migrationSql, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migrationSql, /'au-program:4006'/)
  assert.doesNotMatch(migrationSql, /'au-program:5814'/)
  assert.match(australia.entryPathway, /VIT-accredited/i)
})

test("Australia Primary School Teacher regional rows do not infer shortage from national rating", () => {
  for (const region of ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]) {
    assert.match(migrationSql, new RegExp(`'AU:primary-school-teacher','${region}','2026-05-01',null`))
  }
})
