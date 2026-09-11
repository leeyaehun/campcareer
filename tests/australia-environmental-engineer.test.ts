import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) => {
  const normalized = sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()
  return `${sql}\n${normalized}`
}


const migration = normalizeMigrationSql(readFileSync(
  new URL("../supabase/migrations/20260808205624_australia_environmental_engineer_profile.sql", import.meta.url),
  "utf8",
))

test("Australia Environmental Engineer maps exactly to OSCA 243935 and legacy ANZSCO 233915", () => {
  const career = getCanonicalCareer("environmental-engineer")
  const editorial = getOccupationEditorial("environmental-engineer")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "engineering")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /Current OSCA 243935 Environmental Engineer/)
  assert.match(migration, /'AU:environmental-engineer'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2439'/)
  assert.match(migration, /'243935', 'Environmental Engineer', 'ANZSCO', '2022', '233915'/)
})

test("Australia Environmental Engineer keeps exact six-digit employment and demographics", () => {
  assert.match(migration, /'AU:environmental-engineer', '2026-05-01', 1600, null, null, null/)
  assert.match(migration, /1852, 18, 36, 36, 42, 350/)
  assert.match(migration, /'exact_legacy_233915_context'/)
  assert.match(migration, /directly title- and scope-aligned with current OSCA 243935/)
  assert.match(migration, /'broader_anzsco_2339_context'/)
  assert.match(migration, /'median_weekly_earnings_aud', 2649/)
})

test("Australia Environmental Engineer records national and all-state shortage", () => {
  const australia = getOccupationEditorial("environmental-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /Environmental Engineer as Shortage nationally and in all eight states and territories/)
  assert.match(australia.jobMarketNote, /Shortage nationally and in all eight states and territories/i)
})

test("Australia Environmental Engineer preserves CSOL and Engineers Australia evidence", () => {
  const australia = getOccupationEditorial("environmental-engineer")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /current CSOL includes 233915/)
  assert.match(migration, /Engineers Australia \(EA\) is the assessing authority/)
  assert.match(australia.registration, /Core Skills Occupation List/i)
  assert.match(australia.registration, /Engineers Australia/i)
})

test("Australia Environmental Engineer scores national shortage and positive broader trend conservatively", () => {
  assert.match(migration, /350, '2026-05-01', 11\.23/)
  assert.match(migration, /12\.41, 22\.96, 20, 0, 5, 5, 13, 0, 5, 10, 3, 61/)
  assert.match(migration, /Vacancy intensity is not scored because the vacancy numerator is broader/)
})

test("Australia Environmental Engineer stores shortage in all eight regions", () => {
  const expected = new Map([
    ["ACT", "5.66667"],
    ["NSW", "98"],
    ["NT", "8"],
    ["QLD", "80.66667"],
    ["SA", "24.33333"],
    ["TAS", "2.66667"],
    ["VIC", "88.33333"],
    ["WA", "42.33333"],
  ])

  for (const [region, vacancies] of expected) {
    assert.match(
      migration,
      new RegExp(`'AU:environmental-engineer', '${region}', '2026-05-01', 3, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Environmental Engineer links verified RMIT study routes without generated IDs", () => {
  assert.match(migration, /course_code = '110998M'/)
  assert.match(migration, /course_code = '087983C'/)
  assert.match(migration, /'au-program:'\s*\|\|\s*id::text,\s*'direct'/)
  assert.match(migration, /'au-program:' \|\| id::text, 'graduate_entry'/)
  assert.match(migration, /RMIT — Bachelor of Engineering \(Environmental Engineering\) \(Honours\)/)
  assert.match(migration, /RMIT — Master of Engineering \(Environmental Engineering\)/)
  assert.match(migration, /official_url_status = 'verified'/)
})
