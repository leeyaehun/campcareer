import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) =>
  sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()


const migration = normalizeMigrationSql(readFileSync(
  new URL("../supabase/migrations/20260808123305_australia_cybersecurity_analyst_profile.sql", import.meta.url),
  "utf8",
))

test("Australia Cybersecurity Analyst maps current OSCA 271133 to ANZSCO 262116", () => {
  const career = getCanonicalCareer("cybersecurity-analyst")
  const editorial = getOccupationEditorial("cybersecurity-analyst")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "technology")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:cybersecurity-analyst'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2711'/)
  assert.match(
    migration,
    /'271133', 'Cyber Security Analyst', 'ANZSCO', '2022', '262116', 3, true/,
  )
})

test("Australia Cybersecurity Analyst repairs the stale migration and CSOL crosswalk", () => {
  assert.match(migration, /set anzsco_v13 = '262116'/)
  assert.match(migration, /on_csol = true/)
  assert.match(migration, /older 262112 ICT Security Specialist crosswalk/)
  assert.match(migration, /Core Skills Occupation List \(CSOL\)/)
  assert.match(migration, /ACS as assessing authority/)
})

test("Australia Cybersecurity Analyst keeps broader 2621 labour metrics out of exact fields", () => {
  assert.match(
    migration,
    /'AU:cybersecurity-analyst', '2026-05-01', null, null, null, null/,
  )
  assert.match(migration, /'broader_anzsco_2621_context'/)
  assert.match(migration, /'employment_total', 72600/)
  assert.match(migration, /'median_weekly_earnings_aud', 2461/)
  assert.match(migration, /'median_hourly_earnings_aud', 66/)
  assert.match(migration, /570, '2026-05-01', -6\.56/)
  assert.match(migration, /14\.01, 24\.04/)
  assert.match(migration, /0, 0, 5, 0, 10, 0, 5, 10, 4, 34/)
})

test("Australia Cybersecurity Analyst separates national no-shortage from regional shortages", () => {
  const australia = getOccupationEditorial("cybersecurity-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /not in national shortage in the 2025 Occupation Shortage List/)
  assert.match(migration, /shortage in ACT, Queensland and South Australia/)
  assert.match(australia.jobMarketNote, /No Shortage nationally/)
  assert.match(australia.jobMarketNote, /ACT, Queensland and South Australia/)

  for (const region of ["ACT", "QLD", "SA"]) {
    assert.match(
      migration,
      new RegExp(`'AU:cybersecurity-analyst', '${region}', '2026-05-01', 3,`),
    )
  }

  for (const region of ["NSW", "NT", "TAS", "VIC", "WA"]) {
    assert.match(
      migration,
      new RegExp(`'AU:cybersecurity-analyst', '${region}', '2026-05-01', null,`),
    )
  }
})

test("Australia Cybersecurity Analyst links representative ACS-accredited study routes", () => {
  assert.match(migration, /'au-program:3927', 'direct'/)
  assert.match(migration, /'au-program:7293', 'direct'/)
  assert.match(migration, /'au-program:3131', 'graduate_entry'/)
  assert.match(migration, /ACS — Accredited courses/)
  assert.match(migration, /ASD — Entry-level programs/)
})

test("Australia Cybersecurity Analyst editorial preserves qualified entry and registration guidance", () => {
  const australia = getOccupationEditorial("cybersecurity-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(australia.registration, /no single statutory national occupational registration or licence/i)
  assert.match(australia.registration, /ANZSCO 262116/)
  assert.match(australia.entryPathway, /security clearance/)
  assert.match(australia.scoreCaveat, /national 2025 No Shortage/)
})
