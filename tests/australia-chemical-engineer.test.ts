import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808201853_australia_chemical_engineer_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Chemical Engineer maps exactly to OSCA 243131 and legacy ANZSCO 233111", () => {
  const career = getCanonicalCareer("chemical-engineer")
  const editorial = getOccupationEditorial("chemical-engineer")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "engineering")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /Exact current occupation: OSCA 243131 Chemical Engineer/)
  assert.match(migration, /'AU:chemical-engineer'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2431'/)
  assert.match(migration, /'243131', 'Chemical Engineer', 'ANZSCO', '2022', '233111'/)
})

test("Australia Chemical Engineer keeps exact six-digit employment and removes estimated salary", () => {
  assert.match(migration, /median_salary_aud = null/)
  assert.match(migration, /'AU:chemical-engineer', '2026-05-01', 3100, null, null, null/)
  assert.match(migration, /1852, 13, 23, 38, 43, 37\.66667/)
  assert.match(migration, /'exact_legacy_233111_context'/)
  assert.match(migration, /directly title- and scope-aligned with current OSCA 243131/)
  assert.match(migration, /'broader_anzsco_2331_context'/)
  assert.match(migration, /'median_weekly_earnings_aud', 2849/)
  assert.match(migration, /'median_hourly_earnings_aud', 75/)
})

test("Australia Chemical Engineer records national No Shortage and NT Queensland shortage", () => {
  const australia = getOccupationEditorial("chemical-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /Chemical Engineer as No Shortage nationally/)
  assert.match(migration, /Northern Territory and Queensland are rated Shortage/)
  assert.match(australia.jobMarketNote, /Northern Territory and Queensland/i)
})

test("Australia Chemical Engineer preserves CSOL and Engineers Australia evidence", () => {
  const australia = getOccupationEditorial("chemical-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /current CSOL includes 233111/)
  assert.match(migration, /Engineers Australia \(EA\) is the assessing authority/)
  assert.match(australia.registration, /Core Skills Occupation List/i)
  assert.match(australia.registration, /Engineers Australia/i)
})

test("Australia Chemical Engineer scores negative broader vacancy trend conservatively", () => {
  assert.match(migration, /37\.66667, '2026-05-01', -24\.16/)
  assert.match(migration, /13\.15, 23\.18, 0, 0, 5, 0, 13, 0, 5, 10, 3, 36/)
  assert.match(migration, /negative broader trend receives no vacancy-trend credit/)
})

test("Australia Chemical Engineer stores regional shortage separately from broader vacancies", () => {
  const expected = new Map([
    ["ACT", ["null", "0.66667"]],
    ["NSW", ["null", "8.33333"]],
    ["NT", ["3", "1.33333"]],
    ["QLD", ["3", "4.66667"]],
    ["SA", ["null", "5.33333"]],
    ["TAS", ["null", "0"]],
    ["VIC", ["null", "10"]],
    ["WA", ["null", "7.33333"]],
  ])

  for (const [region, [shortage, vacancies]] of expected) {
    assert.match(
      migration,
      new RegExp(`'AU:chemical-engineer', '${region}', '2026-05-01', ${shortage}, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Chemical Engineer links verified accredited study routes", () => {
  assert.match(migration, /'au-program:5791', 'direct'/)
  assert.match(migration, /'au-program:1608', 'graduate_entry'/)
  assert.match(migration, /RMIT — Bachelor of Engineering \(Chemical Engineering\) \(Honours\)/)
  assert.match(migration, /UQ — Master of Chemical Engineering \(Professional\)/)
  assert.match(migration, /official_url_status = 'verified'/)
})
