import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808142857_australia_civil_engineer_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Civil Engineer maps to current OSCA 243231 and legacy ANZSCO 233211", () => {
  const career = getCanonicalCareer("civil-engineer")
  const editorial = getOccupationEditorial("civil-engineer")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "engineering")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:civil-engineer'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2432'/)
  assert.match(migration, /'243231', 'Civil Engineer', 'ANZSCO', '2022', '233211', 5, true/)
})

test("Australia Civil Engineer keeps legacy labour observations contextual", () => {
  assert.match(migration, /'AU:civil-engineer', '2026-05-01', null, null, null, null/)
  assert.match(migration, /'legacy_233211_context'/)
  assert.match(migration, /'employment_total', 29400/)
  assert.match(migration, /Legacy 233211 also corresponds to current OSCA 243236 Water Engineer/)
  assert.match(migration, /'broader_anzsco_2332_context'/)
  assert.match(migration, /'employment_total', 76800/)
  assert.match(migration, /'median_weekly_earnings_aud', 2217/)
  assert.match(migration, /median_salary_aud = null/)
})

test("Australia Civil Engineer records exact 2025 shortage and current CSOL authority", () => {
  const australia = getOccupationEditorial("civil-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /records current OSCA 243231 Civil Engineer as Shortage nationally and in all eight states and territories/)
  assert.match(migration, /Engineers Australia \(EA\) is the assessing authority/)
  assert.match(australia.registration, /registration or licensing may be required/i)
  assert.match(australia.registration, /Engineers Australia/i)
})

test("Australia Civil Engineer scores broader trend and growth conservatively", () => {
  assert.match(migration, /2235, '2026-05-01', 3\.94/)
  assert.match(migration, /11\.58, 20\.99, 20, 0, 5, 5, 13, 0, 5, 10, 3, 61/)
  assert.match(migration, /vacancy numerator is broader than the exact current occupation/)
})

test("Australia Civil Engineer preserves shortage and broader vacancies by region", () => {
  const expected = new Map([
    ["ACT", "36.33333"],
    ["NSW", "642.33333"],
    ["NT", "28.66667"],
    ["QLD", "621.33333"],
    ["SA", "148"],
    ["TAS", "17.66667"],
    ["VIC", "357.66667"],
    ["WA", "383"],
  ])

  for (const [region, vacancies] of expected) {
    assert.match(
      migration,
      new RegExp(`'AU:civil-engineer', '${region}', '2026-05-01', 3, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Civil Engineer links current active CRICOS study routes", () => {
  assert.match(migration, /'au-program:5789', 'direct'/)
  assert.match(migration, /'au-program:1609', 'graduate_entry'/)
  assert.match(migration, /'au-program:4967', 'graduate_entry'/)
  assert.match(migration, /RMIT — Bachelor of Engineering \(Civil and Infrastructure\) \(Honours\)/)
  assert.match(migration, /University of Queensland — Master of Civil Engineering \(Professional\)/)
})
