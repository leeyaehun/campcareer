import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808130439_australia_database_administrator_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Database Administrator maps exactly to OSCA 271231 and ANZSCO 262111", () => {
  const career = getCanonicalCareer("database-administrator")
  const editorial = getOccupationEditorial("database-administrator")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "technology")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:database-administrator'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2712'/)
  assert.match(migration, /'271231', 'Database Administrator', 'ANZSCO', '2022', '262111', null, true/)
})

test("Australia Database Administrator retains exact six-digit employment but not broader earnings", () => {
  assert.match(migration, /'AU:database-administrator', '2026-05-01', 5900, null, null, null/)
  assert.match(migration, /'exact_legacy_262111_context'/)
  assert.match(migration, /'employment_total', 5900/)
  assert.match(migration, /'part_time_share_pct', 18/)
  assert.match(migration, /'female_share_pct', 39/)
  assert.match(migration, /'median_age', 44/)
  assert.match(migration, /'broader_anzsco_2621_context'/)
  assert.match(migration, /'median_weekly_earnings_aud', 2461/)
  assert.match(migration, /570, '2026-05-01', -6\.56/)
  assert.match(migration, /14\.01, 24\.04, 0, 0, 5, 0, 10, 0, 5, 10, 4, 34/)
})

test("Australia Database Administrator keeps 2025 no-shortage separate from CSOL eligibility", () => {
  const editorial = getOccupationEditorial("database-administrator")
  const australia = editorial?.countries.AU

  assert.ok(australia)
  assert.match(migration, /records current OSCA 271231 Database Administrator as No Shortage nationally/)
  assert.match(migration, /current CSOL includes 262111 and ACS is the assessing authority/)
  assert.match(australia.registration, /no single statutory national occupational registration or licence/i)
  assert.match(australia.jobMarketNote, /No Shortage nationally/)
})

test("Australia Database Administrator stores broader 2621 regional vacancies without state shortage claims", () => {
  const expected = new Map([
    ["ACT", "59.66667"],
    ["NSW", "168"],
    ["NT", "5.66667"],
    ["QLD", "109.33333"],
    ["SA", "38.66667"],
    ["TAS", "5.66667"],
    ["VIC", "130"],
    ["WA", "53"],
  ])

  for (const [region, vacancies] of expected) {
    assert.match(
      migration,
      new RegExp(`'AU:database-administrator', '${region}', '2026-05-01', null, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Database Administrator links representative CRICOS IT and information-systems routes", () => {
  assert.match(migration, /'au-program:3843', 'direct'/)
  assert.match(migration, /'au-program:257', 'graduate_entry'/)
  assert.match(migration, /'au-program:4678', 'graduate_entry'/)
  assert.match(migration, /ACS — IT occupations and ANZSCO codes/)
  assert.match(migration, /ACS — Accredited courses/)
})
