import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260809091007_australia_special_education_teacher_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Special Education Teacher maps to OSCA 251431 and ANZSCO 241511", () => {
  const career = getCanonicalCareer("special-education-teacher")
  const editorial = getOccupationEditorial("special-education-teacher")
  assert.ok(career)
  assert.equal(career.categoryId, "education")
  assert.ok(editorial)
  assert.match(migration, /OSCA 251431 Special Education Teacher/)
  assert.match(migration, /'ANZSCO','2022','241511'/)
  assert.match(editorial.overview, /Skill Level 1/i)
})

test("Australia Special Education Teacher excludes vision and deaf specialist occupations", () => {
  const editorial = getOccupationEditorial("special-education-teacher")
  assert.ok(editorial)
  assert.match(editorial.overview, /excludes Specialist Teachers \(Vision Impairment\) and Teachers of the Deaf/i)
  assert.match(migration, /classified separately/i)
})

test("Australia Special Education Teacher uses aligned six-digit employment but no inferred salary", () => {
  assert.match(migration, /'AU:special-education-teacher','2026-05-01',23000,null,null,null/)
  assert.match(migration, /'legacy_241511_profile'/)
  assert.match(migration, /'employment_total',23000/)
  assert.match(migration, /does not publish six-digit median earnings/i)
})

test("Australia Special Education Teacher preserves shortage and conservative broader demand scoring", () => {
  const australia = getOccupationEditorial("special-education-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /57,'2026-05-01',0\.59,5\.87,12\.64,20,0,5,0,13,0,5,10,2,55/)
  assert.match(migration, /national shortage occupation/i)
  assert.match(australia.scoreCaveat, /near-flat \+0\.59%/i)
})

test("Australia Special Education Teacher records AITSL migration and registration requirements", () => {
  const australia = getOccupationEditorial("special-education-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /ANZSCO 241511.*AITSL/i)
  assert.match(australia.registration, /state and territory teacher regulatory authorities/i)
})

test("Australia Special Education Teacher links direct special and inclusive education programs", () => {
  const australia = getOccupationEditorial("special-education-teacher")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /australian-catholic-university'\s+and course_code\s*=\s*'0102078'/)
  assert.match(migration, /flinders-university'\s+and course_code\s*=\s*'117254F'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:530'/)
  assert.doesNotMatch(migration, /'au-program:4371'/)
})

test("Australia Special Education Teacher regional rows do not infer shortage from national rating", () => {
  for (const region of ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]) {
    assert.match(migration, new RegExp(`'AU:special-education-teacher','${region}','2026-05-01',null`))
  }
})
