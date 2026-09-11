import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808212754_australia_financial_analyst_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Financial Analyst is modelled as an OSCA 211131 specialisation", () => {
  const career = getCanonicalCareer("financial-analyst")
  const editorial = getOccupationEditorial("financial-analyst")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "business")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /Financial Analyst \(specialisation of Accountant \(General\)\)/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2111'/)
  assert.match(editorial.overview, /official specialisation of 211131 Accountant \(General\)/i)
})

test("Australia Financial Analyst does not misuse legacy 221111 employment as exact", () => {
  assert.match(migration, /'AU:financial-analyst', '2026-05-01', null, null, null, null/)
  assert.match(migration, /'employment_total', 139100/)
  assert.match(migration, /contextual only for the current Financial Analyst specialisation/i)
  assert.match(migration, /leaves current Financial Analyst employment and demographic fields null/i)
})

test("Australia Financial Analyst keeps parent no-shortage and broader declining vacancy context", () => {
  const australia = getOccupationEditorial("financial-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /3522\.33333, '2026-05-01', -4\.46/)
  assert.match(migration, /8\.44, 16\.63/)
  assert.match(migration, /No Shortage nationally and in all eight states and territories/i)
  assert.match(australia.scoreCaveat, /vacancies declined year on year/i)
})

test("Australia Financial Analyst applies partial rather than direct visa credit", () => {
  const australia = getOccupationEditorial("financial-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /0, 0, 5, 0, 13, 0, 5, 5, 3, 31/)
  assert.match(migration, /partial visa credit/i)
  assert.match(migration, /must satisfy the nominated 221111 duties and accounting education\/skills-assessment requirements/i)
  assert.match(australia.registration, /job title alone/i)
})

test("Australia Financial Analyst does not infer a standalone salary", () => {
  assert.match(migration, /median_weekly_earnings_aud', 2003/)
  assert.match(migration, /median_hourly_earnings_aud', 53/)
  assert.match(migration, /retained as context only, so the salary component is zero/i)
})

test("Australia Financial Analyst links direct applied-finance study routes", () => {
  const australia = getOccupationEditorial("financial-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /macquarie-university'\n  and course_code = '027342M'/)
  assert.match(migration, /macquarie-university'\n  and course_code = '083777G'/)
  assert.match(migration, /Macquarie — Bachelor of Applied Finance/)
  assert.match(migration, /Macquarie — Master of Applied Finance/)
  assert.match(australia.entryPathway, /Bachelor of Applied Finance/i)
  assert.match(australia.entryPathway, /Master of Applied Finance/i)
})

test("Australia Financial Analyst resolves program links without generated course ids", () => {
  assert.match(migration, /'au-program:' \|\| id::text as program_ref/)
  assert.match(migration, /'direct'/)
  assert.match(migration, /'graduate_entry'/)
  assert.doesNotMatch(migration, /'au-program:36'/)
  assert.doesNotMatch(migration, /'au-program:132'/)
})
