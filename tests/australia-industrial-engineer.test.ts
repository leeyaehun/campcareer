import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808183629_australia_industrial_engineer_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Industrial Engineer maps exactly to OSCA 243531 and legacy ANZSCO 233511", () => {
  const career = getCanonicalCareer("industrial-engineer")
  const editorial = getOccupationEditorial("industrial-engineer")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "engineering")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /Exact current occupation: OSCA 243531 Industrial Engineer/)
  assert.match(migration, /'AU:industrial-engineer'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2435'/)
  assert.match(migration, /'243531', 'Industrial Engineer', 'ANZSCO', '2022', '233511'/)
})

test("Australia Industrial Engineer keeps exact six-digit employment and demographics", () => {
  assert.match(migration, /'AU:industrial-engineer', '2026-05-01', 4700, null, null, null/)
  assert.match(migration, /1852, 11, 18, 39, 42, 871\.33333/)
  assert.match(migration, /'exact_legacy_233511_context'/)
  assert.match(migration, /directly title- and scope-aligned with current OSCA 243531/)
  assert.match(migration, /'broader_anzsco_2335_context'/)
  assert.match(migration, /'median_weekly_earnings_aud', 2614/)
})

test("Australia Industrial Engineer records national No Shortage and regional shortages", () => {
  const australia = getOccupationEditorial("industrial-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /Industrial Engineer as No Shortage nationally/)
  assert.match(migration, /ACT, Northern Territory, Queensland and South Australia are rated Shortage/)
  assert.match(australia.jobMarketNote, /ACT, Northern Territory, Queensland and South Australia/i)
})

test("Australia Industrial Engineer preserves CSOL and Engineers Australia evidence", () => {
  const australia = getOccupationEditorial("industrial-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /current CSOL includes 233511/)
  assert.match(migration, /Engineers Australia \(EA\) is the assessing authority/)
  assert.match(australia.registration, /Core Skills Occupation List/i)
  assert.match(australia.registration, /Engineers Australia/i)
})

test("Australia Industrial Engineer scores broader vacancy trend conservatively", () => {
  assert.match(migration, /871\.33333, '2026-05-01', 7\.00/)
  assert.match(migration, /12\.71, 23\.07, 0, 0, 5, 5, 13, 0, 5, 10, 3, 41/)
  assert.match(migration, /Vacancy intensity is not scored because the vacancy numerator is broader/)
})

test("Australia Industrial Engineer stores regional shortage separately from broader vacancies", () => {
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
      new RegExp(`'AU:industrial-engineer', '${region}', '2026-05-01', ${shortage}, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Industrial Engineer links verified Curtin study routes", () => {
  assert.match(migration, /'au-program:7664', 'direct'/)
  assert.match(migration, /'au-program:7752', 'graduate_entry'/)
  assert.match(migration, /Curtin — Industrial and Systems Engineering Major \(BEng Hons\)/)
  assert.match(migration, /Curtin — Master of Science \(Industrial Engineering\)/)
  assert.match(migration, /official_url_status = 'verified'/)
})
