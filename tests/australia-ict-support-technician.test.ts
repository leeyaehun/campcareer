import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808141654_australia_ict_support_technician_profile.sql", import.meta.url),
  "utf8",
)

test("Australia ICT Support Technician maps to current OSCA ICT Customer Support Officer", () => {
  const career = getCanonicalCareer("ict-support-technician")
  const editorial = getOccupationEditorial("ict-support-technician")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "technology")
  assert.equal(career.label, "ICT Support Technician")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:ict-support-technician'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '3142'/)
  assert.match(migration, /'314231', 'ICT Customer Support Officer', 'ANZSCO', '2022', '313112', null, true/)
})

test("Australia ICT Support Technician keeps exact 313112 employment but not broader earnings", () => {
  assert.match(
    migration,
    /'AU:ict-support-technician', '2026-05-01', 46200, null, null, null/,
  )
  assert.match(migration, /'exact_legacy_313112_context'/)
  assert.match(migration, /'employment_total', 46200/)
  assert.match(migration, /'broader_anzsco_3131_context'/)
  assert.match(migration, /'employment_total', 77900/)
  assert.match(migration, /'median_weekly_earnings_aud', 1687/)
  assert.match(migration, /'median_hourly_earnings_aud', 45/)
  assert.match(migration, /895, '2026-05-01', -0\.26/)
  assert.match(migration, /9\.39, 17\.44, 0, 0, 5, 0, 15, 0, 3, 10, 5, 38/)
})

test("Australia ICT Support Technician records no shortage and direct TRA-assessed CSOL status", () => {
  const editorial = getOccupationEditorial("ict-support-technician")
  const australia = editorial?.countries.AU

  assert.ok(australia)
  assert.match(migration, /No Shortage nationally and in every state and territory/)
  assert.match(migration, /Trades Recognition Australia \(TRA\) is the assessing authority/)
  assert.match(migration, /Certificate IV in Information Technology ICT40120 as an accepted qualification/)
  assert.match(australia.registration, /Trades Recognition Australia/)
  assert.match(australia.registration, /no single statutory national occupational registration or licence/i)
  assert.match(australia.entryPathway, /Skill Level 2/)
})

test("Australia ICT Support Technician stores broader 3131 regional vacancies without state shortage claims", () => {
  const expected = new Map([
    ["ACT", "50"],
    ["NSW", "299"],
    ["NT", "8.33333"],
    ["QLD", "171"],
    ["SA", "52"],
    ["TAS", "8.33333"],
    ["VIC", "221.33333"],
    ["WA", "85"],
  ])

  for (const [region, vacancies] of expected) {
    assert.match(
      migration,
      new RegExp(`'AU:ict-support-technician', '${region}', '2026-05-01', null, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia ICT Support Technician links vocational Skill Level 2 study routes", () => {
  assert.match(migration, /'au-program:18438', 'direct'/)
  assert.match(migration, /'au-program:18532', 'direct'/)
  assert.match(migration, /'au-program:15189', 'direct'/)
  assert.match(migration, /TAFE NSW — Certificate IV in Information Technology/)
  assert.match(migration, /RMIT — Associate Degree in Information Technology/)
})
