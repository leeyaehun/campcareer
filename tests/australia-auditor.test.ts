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
  new URL("../supabase/migrations/20260809083712_australia_auditor_profile.sql", import.meta.url),
  "utf8",
))

test("Australia Auditor is an umbrella across External and Internal Auditor", () => {
  const career = getCanonicalCareer("auditor")
  const editorial = getOccupationEditorial("auditor")

  assert.ok(career)
  assert.equal(career.categoryId, "business")
  assert.ok(editorial)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(editorial.overview, /211231 External Auditor and 211232 Internal Auditor/i)
  assert.match(migration, /umbrella across current OSCA 211231 External Auditor and 211232 Internal Auditor/i)
  assert.match(migration, /'AU:auditor', '211231', 'External Auditor'/)
  assert.match(migration, /'AU:auditor', '211232', 'Internal Auditor'/)
})

test("Australia Auditor aggregates only valid six-digit labour observations", () => {
  assert.match(migration, /'AU:auditor', '2026-05-01', 18500, null, null, null/)
  assert.match(migration, /'external_auditor_221213', 12500/)
  assert.match(migration, /'internal_auditor_221214', 6000/)
  assert.match(migration, /median age is intentionally null/i)
  assert.match(migration, /Broader 2212 median earnings of A\$2,104 per week and A\$56 per hour are retained as context only/i)
})

test("Australia Auditor preserves mixed 2025 shortage status", () => {
  const australia = getOccupationEditorial("auditor")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /External Auditor 211231 as a national shortage occupation and Internal Auditor 211232 as No Shortage nationally/i)
  assert.match(migration, /15, 0, 5, 5, 13, 0, 5, 10, 2, 55/)
  assert.match(australia.scoreCaveat, /mixed shortage status receives partial shortage credit/i)
  for (const region of ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]) {
    assert.match(migration, new RegExp(`'AU:auditor', '${region}', '2026-05-01', null`))
  }
})

test("Australia Auditor keeps broader vacancy and growth evidence scoped", () => {
  assert.match(migration, /689\.33333, '2026-05-01', 8\.44/)
  assert.match(migration, /8\.03, 15\.89/)
  assert.match(migration, /vacancy intensity is not scored and trend receives only partial credit/i)
})

test("Australia Auditor preserves separate registration and migration pathways", () => {
  const australia = getOccupationEditorial("auditor")?.countries.AU

  assert.ok(australia)
  assert.match(australia.registration, /ASIC registration/i)
  assert.match(australia.registration, /CPA Australia, CA ANZ or IPA/i)
  assert.match(australia.registration, /VETASSESS/i)
  assert.match(migration, /registered company auditor/i)
  assert.match(migration, /External Auditor 221213 is assessed by CPA Australia, CA ANZ or IPA/i)
  assert.match(migration, /Internal Auditor 221214 is assessed by VETASSESS/i)
})

test("Australia Auditor links accounting study routes without generated ids", () => {
  const australia = getOccupationEditorial("auditor")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /macquarie-university'\s+and course_code = '099149E'/)
  assert.match(migration, /macquarie-university'\s+and course_code = '099183C'/)
  assert.match(migration, /concat\('au-program:', id\)/)
  assert.doesNotMatch(migration, /'au-program:237'/)
  assert.doesNotMatch(migration, /'au-program:264'/)
  assert.match(australia.entryPathway, /Bachelor of Professional Accounting/i)
  assert.match(australia.entryPathway, /Master of Professional Accounting/i)
})
