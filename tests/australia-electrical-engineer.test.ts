import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808144927_australia_electrical_engineer_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Electrical Engineer maps to current OSCA 243331 and legacy ANZSCO 233311", () => {
  const career = getCanonicalCareer("electrical-engineer")
  const editorial = getOccupationEditorial("electrical-engineer")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "engineering")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:electrical-engineer'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2433'/)
  assert.match(migration, /'243331', 'Electrical Engineer', 'ANZSCO', '2022', '233311', 5, true/)
})

test("Australia Electrical Engineer keeps legacy 2333 labour observations contextual", () => {
  assert.match(migration, /'AU:electrical-engineer', '2026-05-01', null, null, null, null/)
  assert.match(migration, /'broader_anzsco_2333_context'/)
  assert.match(migration, /'employment_total', 33100/)
  assert.match(migration, /'median_weekly_earnings_aud', 2553/)
  assert.match(migration, /'median_hourly_earnings_aud', 67/)
  assert.match(migration, /current OSCA 243332 Rail Signalling Engineer also maps to legacy 233311/)
  assert.match(migration, /median_salary_aud = null/)
})

test("Australia Electrical Engineer records exact national shortage and CSOL authority", () => {
  const australia = getOccupationEditorial("electrical-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /records current OSCA 243331 Electrical Engineer as Shortage nationally/)
  assert.match(migration, /Engineers Australia \(EA\) is the assessing authority/)
  assert.match(australia.registration, /registration or licensing may be required/i)
  assert.match(australia.registration, /Engineers Australia/i)
})

test("Australia Electrical Engineer scores broader trend and growth conservatively", () => {
  assert.match(migration, /519\.33333, '2026-05-01', 4\.07/)
  assert.match(migration, /12\.04, 21\.80, 20, 0, 5, 5, 13, 0, 5, 10, 3, 61/)
  assert.match(migration, /vacancy numerator is broader than the exact current occupation/)
})

test("Australia Electrical Engineer preserves exact state shortage signals", () => {
  const shortageRegions = new Map([
    ["NSW", "127.33333"],
    ["NT", "8.66667"],
    ["SA", "32"],
    ["WA", "110.33333"],
  ])
  const noShortageRegions = new Map([
    ["ACT", "4.66667"],
    ["QLD", "138"],
    ["TAS", "7.33333"],
    ["VIC", "91"],
  ])

  for (const [region, vacancies] of shortageRegions) {
    assert.match(
      migration,
      new RegExp(`'AU:electrical-engineer', '${region}', '2026-05-01', 3, ${vacancies.replace(".", "\\.")}`),
    )
  }
  for (const [region, vacancies] of noShortageRegions) {
    assert.match(
      migration,
      new RegExp(`'AU:electrical-engineer', '${region}', '2026-05-01', null, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Electrical Engineer links active CRICOS study routes", () => {
  assert.match(migration, /'au-program:5787', 'direct'/)
  assert.match(migration, /'au-program:1610', 'graduate_entry'/)
  assert.match(migration, /'au-program:4968', 'graduate_entry'/)
  assert.match(migration, /RMIT — Bachelor of Engineering \(Electrical Engineering\) \(Honours\)/)
  assert.match(migration, /University of Queensland — Master of Electrical Engineering \(Professional\)/)
})
