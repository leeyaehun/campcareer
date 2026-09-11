import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260809090746_australia_secondary_school_teacher_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Secondary School Teacher maps exactly to current OSCA 251331 and ANZSCO 241411", () => {
  const career = getCanonicalCareer("secondary-school-teacher")
  const editorial = getOccupationEditorial("secondary-school-teacher")
  assert.ok(career)
  assert.equal(career.categoryId, "education")
  assert.ok(editorial)
  assert.match(migration, /OSCA 251331 Secondary School Teacher/)
  assert.match(migration, /anzsco_v13 = '241411'/)
  assert.match(migration, /'ANZSCO','2022','241411'/)
  assert.match(migration, /anzsco_v13_code = '241411'/)
})

test("Australia Secondary School Teacher corrects the stale 241311 staging mapping", () => {
  assert.match(migration, /anzsco_v13_code = '241311'/)
  assert.match(migration, /corrects the pre-existing staging value 241311 to 241411/i)
})

test("Australia Secondary School Teacher keeps broader 2414 labour data contextual", () => {
  assert.match(migration, /'AU:secondary-school-teacher','2026-05-01',null,null,null,null/)
  assert.match(migration, /'employment_total',161400/)
  assert.match(migration, /'median_weekly_earnings_aud',2322/)
  assert.match(migration, /context only/i)
})

test("Australia Secondary School Teacher preserves shortage and conservative demand scoring", () => {
  const australia = getOccupationEditorial("secondary-school-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /762\.33333,'2026-05-01',-10\.73,5\.45,11\.68,20,0,5,0,13,0,5,10,2,55/)
  assert.match(migration, /national shortage occupation/i)
  assert.match(australia.scoreCaveat, /10\.73% year on year/i)
})

test("Australia Secondary School Teacher records AITSL migration and teacher-registration requirements", () => {
  const australia = getOccupationEditorial("secondary-school-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /ANZSCO 241411.*AITSL/i)
  assert.match(australia.registration, /state and territory teacher regulatory authorities/i)
})

test("Australia Secondary School Teacher links verified undergraduate and graduate-entry routes", () => {
  const australia = getOccupationEditorial("secondary-school-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /the-university-of-notre-dame-australia'\s+and course_code\s*=\s*'116885E'/)
  assert.match(migration, /rmit-university'\s+and course_code\s*=\s*'113706D'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:18605'/)
  assert.doesNotMatch(migration, /'au-program:5813'/)
})

test("Australia Secondary School Teacher regional rows do not infer shortage from national rating", () => {
  for (const region of ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]) {
    assert.match(migration, new RegExp(`'AU:secondary-school-teacher','${region}','2026-05-01',null`))
  }
})
