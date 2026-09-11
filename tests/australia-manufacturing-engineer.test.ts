import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808150832_australia_manufacturing_engineer_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Manufacturing Engineer maps to the OSCA 243531 Industrial Engineer specialisation", () => {
  const career = getCanonicalCareer("manufacturing-engineer")
  const editorial = getOccupationEditorial("manufacturing-engineer")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "engineering")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /Manufacturing Engineer is an official specialisation of current OSCA 243531 Industrial Engineer/)
  assert.match(migration, /'AU:manufacturing-engineer'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2435'/)
  assert.match(migration, /'243531', 'Manufacturing Engineer', 'ANZSCO', '2022', '233511'/)
})

test("Australia Manufacturing Engineer keeps parent employment and broader earnings contextual", () => {
  assert.match(migration, /'AU:manufacturing-engineer', '2026-05-01', null, null, null, null/)
  assert.match(migration, /'parent_legacy_233511_context'/)
  assert.match(migration, /'employment_total', 4700/)
  assert.match(migration, /broader than the canonical Manufacturing Engineer specialisation/)
  assert.match(migration, /'broader_anzsco_2335_context'/)
  assert.match(migration, /'median_weekly_earnings_aud', 2614/)
  assert.match(migration, /median_salary_aud = null/)
})

test("Australia Manufacturing Engineer records parent national No Shortage and regional shortage", () => {
  const australia = getOccupationEditorial("manufacturing-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /parent OSCA 243531 Industrial Engineer as No Shortage nationally/)
  assert.match(migration, /ACT, Northern Territory, Queensland and South Australia are rated Shortage/)
  assert.match(australia.jobMarketNote, /ACT, Northern Territory, Queensland and South Australia/i)
})

test("Australia Manufacturing Engineer preserves CSOL caveat through Industrial Engineer", () => {
  const australia = getOccupationEditorial("manufacturing-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /ANZSCO 233511 Industrial Engineer/)
  assert.match(migration, /Manufacturing Engineer is not separately named on the CSOL/)
  assert.match(migration, /Engineers Australia as assessing authority/)
  assert.match(australia.registration, /not separately named on the Core Skills Occupation List/i)
})

test("Australia Manufacturing Engineer scores broader trend and growth conservatively", () => {
  assert.match(migration, /871\.33333, '2026-05-01', 7\.00/)
  assert.match(migration, /12\.71, 23\.07, 0, 0, 5, 5, 13, 0, 5, 10, 3, 41/)
  assert.match(migration, /positive broader trend receives partial credit/)
})

test("Australia Manufacturing Engineer stores regional shortage separately from broader vacancies", () => {
  const expected = new Map([
    ["ACT", ["3", "14.66667"]],
    ["NSW", ["null", "232.66667"]],
    ["NT", ["3", "7.66667"]],
    ["QLD", ["3", "194"]],
    ["SA", ["3", "66.33333"]],
    ["TAS", ["null", "12.33333"]],
    ["VIC", ["null", "177.66667"]],
    ["WA", ["null", "166"]],
  ])

  for (const [region, [shortage, vacancies]] of expected) {
    assert.match(
      migration,
      new RegExp(`'AU:manufacturing-engineer', '${region}', '2026-05-01', ${shortage}, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Manufacturing Engineer links active manufacturing study routes", () => {
  assert.match(migration, /'au-program:5783', 'direct'/)
  assert.match(migration, /'au-program:4587', 'graduate_entry'/)
  assert.match(migration, /'au-program:6784', 'graduate_entry'/)
  assert.match(migration, /RMIT — Bachelor of Engineering \(Advanced Manufacturing and Mechatronics\) \(Honours\)/)
  assert.match(migration, /La Trobe — Master of Manufacturing Engineering/)
})
