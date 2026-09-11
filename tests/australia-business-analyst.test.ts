import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808213745_australia_business_analyst_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Business Analyst is the non-ICT OSCA Management Consultant specialisation", () => {
  const career = getCanonicalCareer("business-analyst")
  const editorial = getOccupationEditorial("business-analyst")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "business")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /Business Analyst \(non-ICT\) — specialisation of Management Consultant/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2234'/)
  assert.match(editorial.overview, /official specialisation of 223432 Management Consultant/i)
  assert.match(editorial.overview, /ICT Business Analyst is a separate occupation/i)
})

test("Australia Business Analyst keeps current and legacy Management Consultant codes distinct", () => {
  assert.match(migration, /current ANZSCO 2022 migration code is 224713 Management Consultant/i)
  assert.match(migration, /JSA's legacy labour-market profile remains ANZSCO 2013 v1\.3 code 224711/i)
  assert.match(migration, /'ANZSCO', '2022', '224713'/)
  assert.match(migration, /'employment_total', 64900/)
})

test("Australia Business Analyst does not present parent employment or earnings as exact", () => {
  assert.match(migration, /'AU:business-analyst', '2026-05-01', null, null, null, null/)
  assert.match(migration, /broader than the Business Analyst specialisation/i)
  assert.match(migration, /median_weekly_earnings_aud', 2444/)
  assert.match(migration, /median_hourly_earnings_aud', 63/)
  assert.match(migration, /retained as context only, so the salary component remains zero/i)
})

test("Australia Business Analyst records no shortage and conservative broader vacancy trend", () => {
  const australia = getOccupationEditorial("business-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /779\.66667, '2026-05-01', -1\.56/)
  assert.match(migration, /16\.15, 27\.31/)
  assert.match(migration, /No Shortage nationally and in all eight states and territories/i)
  assert.match(australia.scoreCaveat, /declined about 1\.56% year on year/i)
})

test("Australia Business Analyst has verified Management Consultant visa pathway without mixing ICT BA", () => {
  const australia = getOccupationEditorial("business-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /0, 0, 5, 0, 13, 0, 5, 10, 3, 36/)
  assert.match(migration, /current Core Skills Occupation List includes ANZSCO 2022 224713 Management Consultant with VETASSESS/i)
  assert.match(migration, /VETASSESS explicitly lists Business Analyst as an occupation considered suitable under Management Consultant/i)
  assert.match(australia.registration, /ICT Business Analyst follows a different occupation/i)
})

test("Australia Business Analyst links current Macquarie business-analysis study routes", () => {
  const australia = getOccupationEditorial("business-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /macquarie-university'\n  and course_code = '079306G'/)
  assert.match(migration, /macquarie-university'\n  and course_code = '0100139'/)
  assert.match(migration, /Macquarie — Bachelor of Business Analytics/)
  assert.match(migration, /Macquarie — Master of Business Analytics/)
  assert.match(australia.entryPathway, /Information Systems and Business Analysis/i)
})

test("Australia Business Analyst resolves program links without generated course ids", () => {
  assert.match(migration, /'au-program:' \|\| id::text, 'direct'/)
  assert.match(migration, /'au-program:' \|\| id::text, 'graduate_entry'/)
  assert.doesNotMatch(migration, /'au-program:93'/)
  assert.doesNotMatch(migration, /'au-program:8'/)
})
