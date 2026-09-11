import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808143957_australia_mechanical_engineer_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Mechanical Engineer maps to OSCA 243532 and ANZSCO 233512", () => {
  const career = getCanonicalCareer("mechanical-engineer")
  const editorial = getOccupationEditorial("mechanical-engineer")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "engineering")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:mechanical-engineer'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2435'/)
  assert.match(migration, /'243532', 'Mechanical Engineer', 'ANZSCO', '2022', '233512'/)
})

test("Australia Mechanical Engineer retains exact employment but not broader earnings", () => {
  assert.match(migration, /'AU:mechanical-engineer', '2026-05-01', 22900, null, null, null/)
  assert.match(migration, /'exact_legacy_233512_context'/)
  assert.match(migration, /'employment_total', 22900/)
  assert.match(migration, /'broader_anzsco_2335_context'/)
  assert.match(migration, /'median_weekly_earnings_aud', 2614/)
  assert.match(migration, /median_salary_aud = null/)
})

test("Australia Mechanical Engineer records national No Shortage with NT SA WA regional shortage", () => {
  const australia = getOccupationEditorial("mechanical-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /No Shortage nationally/)
  assert.match(migration, /NT, South Australia and Western Australia are rated Shortage/)
  assert.match(australia.jobMarketNote, /Northern Territory, South Australia and Western Australia/i)
  assert.match(migration, /Engineers Australia \(EA\) is the assessing authority/)
})

test("Australia Mechanical Engineer scores broader trend and growth conservatively", () => {
  assert.match(migration, /871\.33333, '2026-05-01', 7\.00/)
  assert.match(migration, /12\.71, 23\.07, 0, 0, 5, 5, 13, 0, 5, 10, 3, 41/)
  assert.match(migration, /vacancy numerator is broader than the exact occupation/)
})

test("Australia Mechanical Engineer stores exact regional shortage separately from broader vacancies", () => {
  const expected = new Map([
    ["ACT", ["null", "14.66667"]],
    ["NSW", ["null", "232.66667"]],
    ["NT", ["3", "7.66667"]],
    ["QLD", ["null", "194"]],
    ["SA", ["3", "66.33333"]],
    ["TAS", ["null", "12.33333"]],
    ["VIC", ["null", "177.66667"]],
    ["WA", ["3", "166"]],
  ])

  for (const [region, [shortage, vacancies]] of expected) {
    assert.match(
      migration,
      new RegExp(`'AU:mechanical-engineer', '${region}', '2026-05-01', ${shortage}, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Mechanical Engineer links active CRICOS study routes", () => {
  assert.match(migration, /'au-program:5785', 'direct'/)
  assert.match(migration, /'au-program:1612', 'graduate_entry'/)
  assert.match(migration, /'au-program:4970', 'graduate_entry'/)
  assert.match(migration, /RMIT — Bachelor of Engineering \(Mechanical Engineering\) \(Honours\)/)
  assert.match(migration, /University of Queensland — Master of Mechanical Engineering \(Professional\)/)
})
