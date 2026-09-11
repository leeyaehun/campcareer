import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808125154_australia_cloud_engineer_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Cloud Engineer maps exactly to OSCA 273331", () => {
  const career = getCanonicalCareer("cloud-engineer")
  const editorial = getOccupationEditorial("cloud-engineer")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "technology")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:cloud-engineer'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2733'/)
  assert.match(migration, /'273331', 'Cloud Engineer', 'ANZSCO', '2022', '261313', 5, true/)
})

test("Australia Cloud Engineer removes the old estimated salary and keeps broader 2613 metrics contextual", () => {
  assert.match(migration, /median_salary_aud = null/)
  assert.match(migration, /'AU:cloud-engineer', '2026-05-01', null, null, null, null/)
  assert.match(migration, /'broader_anzsco_2613_context'/)
  assert.match(migration, /'employment_total', 203200/)
  assert.match(migration, /'median_weekly_earnings_aud', 2537/)
  assert.match(migration, /3392, '2026-05-01', -9\.86/)
  assert.match(migration, /15\.69, 26\.67, 20, 0, 5, 0, 10, 0, 5, 10, 4, 54/)
})

test("Australia Cloud Engineer records exact 2025 shortage without overclaiming migration title", () => {
  const editorial = getOccupationEditorial("cloud-engineer")
  const australia = editorial?.countries.AU

  assert.ok(australia)
  assert.match(migration, /records current OSCA 273331 Cloud Engineer as Shortage nationally/)
  assert.match(migration, /The current legal CSOL lists ANZSCO 261313 with ACS rather than Cloud Engineer as a separate title/)
  assert.match(australia.registration, /no single statutory national occupational registration or licence/i)
  assert.match(australia.scoreCaveat, /exact 2025 national shortage signal/i)
})

test("Australia Cloud Engineer preserves verified regional shortage and broader vacancies separately", () => {
  const expected = new Map([
    ["ACT", ["3", "312"]],
    ["NSW", ["3", "1196.66667"]],
    ["NT", ["null", "15.33333"]],
    ["QLD", ["3", "507"]],
    ["SA", ["3", "195.33333"]],
    ["TAS", ["3", "24"]],
    ["VIC", ["3", "910.33333"]],
    ["WA", ["3", "231.33333"]],
  ])

  for (const [region, [shortage, vacancies]] of expected) {
    assert.match(
      migration,
      new RegExp(`'AU:cloud-engineer', '${region}', '2026-05-01', ${shortage}, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Cloud Engineer links cloud-focused CRICOS study routes", () => {
  assert.match(migration, /'au-program:3843', 'direct'/)
  assert.match(migration, /'au-program:3435', 'graduate_entry'/)
  assert.match(migration, /'au-program:8544', 'graduate_entry'/)
  assert.match(migration, /Deakin — Bachelor of Information Technology cloud pathways/)
  assert.match(migration, /Swinburne — Master of Information Technology, Mobile and Cloud Computing/)
  assert.match(migration, /Torrens — Master of Software Engineering \(Cloud Computing, Advanced\)/)
})
