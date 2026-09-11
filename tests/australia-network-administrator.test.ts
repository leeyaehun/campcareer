import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808124430_australia_network_administrator_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Network Administrator maps current OSCA 272132 to ANZSCO 263112", () => {
  const career = getCanonicalCareer("network-administrator")
  const editorial = getOccupationEditorial("network-administrator")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "technology")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:network-administrator'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2721'/)
  assert.match(
    migration,
    /'272132', 'Network Administrator', 'ANZSCO', '2022', '263112', null, true/,
  )
})

test("Australia Network Administrator keeps broader 2631 labour metrics out of exact fields", () => {
  assert.match(
    migration,
    /'AU:network-administrator', '2026-05-01', null, null, null, null/,
  )
  assert.match(migration, /'broader_anzsco_2631_context'/)
  assert.match(migration, /'employment_total', 48600/)
  assert.match(migration, /'median_weekly_earnings_aud', 2309/)
  assert.match(migration, /'median_hourly_earnings_aud', 60/)
  assert.match(migration, /371\.66667, '2026-05-01', -14\.89/)
  assert.match(migration, /14\.77, 25\.16/)
  assert.match(migration, /0, 0, 5, 0, 10, 0, 5, 10, 4, 34/)
})

test("Australia Network Administrator records exact 2025 no-shortage and current CSOL evidence", () => {
  const australia = getOccupationEditorial("network-administrator")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /No Shortage nationally and in all eight states and territories/)
  assert.match(migration, /shortage score component is therefore zero/)
  assert.match(migration, /Core Skills Occupation List instruments include ANZSCO 263112 Network Administrator/)
  assert.match(migration, /Australian Computer Society as assessing authority/)
  assert.match(australia.registration, /no single statutory national occupational registration or licence/i)
  assert.match(australia.jobMarketNote, /No Shortage nationally and in all eight states and territories/)
})

test("Australia Network Administrator stores broader 2631 regional vacancies without shortage inflation", () => {
  const expected = new Map([
    ["ACT", "43.33333"],
    ["NSW", "136.66667"],
    ["NT", "3.33333"],
    ["QLD", "50.66667"],
    ["SA", "21"],
    ["TAS", "1.33333"],
    ["VIC", "88"],
    ["WA", "27.33333"],
  ])

  for (const [region, vacancies] of expected) {
    assert.match(
      migration,
      new RegExp(`'AU:network-administrator', '${region}', '2026-05-01', null, ${vacancies.replace(".", "\\.")}`),
    )
  }
})

test("Australia Network Administrator links representative networking study routes", () => {
  assert.match(migration, /'au-program:7600', 'direct'/)
  assert.match(migration, /'au-program:18391', 'direct'/)
  assert.match(migration, /'au-program:4024', 'graduate_entry'/)
  assert.match(migration, /ACS — IT occupations and ANZSCO codes/)
  assert.match(migration, /ACS — Accredited courses/)
})

test("Network Administrator editorial composes with prior Technology occupations", () => {
  assert.ok(getOccupationEditorial("software-developer"))
  assert.ok(getOccupationEditorial("data-analyst"))
  assert.ok(getOccupationEditorial("data-engineer"))
  assert.ok(getOccupationEditorial("cybersecurity-analyst"))
  assert.ok(getOccupationEditorial("network-administrator"))
})
