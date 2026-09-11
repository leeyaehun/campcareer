import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260809081801_australia_marketing_specialist_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Marketing Specialist maps exactly to current OSCA 221534", () => {
  const career = getCanonicalCareer("marketing-specialist")
  const editorial = getOccupationEditorial("marketing-specialist")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "business")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /Exact current occupation: OSCA 221534 Marketing Specialist/)
  assert.match(migration, /'AU:marketing-specialist', '221534', 'Marketing Specialist'/)
  assert.match(editorial.overview, /OSCA 221534 Marketing Specialist/i)
})

test("Australia Marketing Specialist keeps current ANZSCO 2022 225113 distinct from Content Creator", () => {
  assert.match(migration, /Current ANZSCO 2022 counterpart: 225113 Marketing Specialist/)
  assert.match(migration, /separately classifies 225114 Content Creator \(Marketing\)/i)
  assert.match(migration, /both current OSCA 221531 Content Creator \(Marketing\) and 221534 Marketing Specialist back to legacy 225113/i)
  assert.match(migration, /'ANZSCO', '2022', '225113'/)
})

test("Australia Marketing Specialist does not misuse legacy 225113 employment as exact current employment", () => {
  assert.match(migration, /'AU:marketing-specialist', '2026-05-01', null, null, null, null/)
  assert.match(migration, /'employment_total', 71700/)
  assert.match(migration, /cannot be represented as exact current 221534 values/i)
})

test("Australia Marketing Specialist preserves no-shortage and broader market context", () => {
  const australia = getOccupationEditorial("marketing-specialist")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /1800\.33333, '2026-05-01', -10\.22/)
  assert.match(migration, /12\.56, 22\.08/)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(australia.scoreCaveat, /fell about 10\.22% year on year/i)
})

test("Australia Marketing Specialist uses current VETASSESS and CSOL pathway evidence", () => {
  const australia = getOccupationEditorial("marketing-specialist")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /0, 0, 5, 0, 13, 0, 5, 10, 3, 36/)
  assert.match(migration, /Core Skills Occupation List includes ANZSCO 225113 Marketing Specialist with VETASSESS/i)
  assert.match(migration, /Group B/i)
  assert.match(australia.registration, /Core Skills Occupation List/i)
})

test("Australia Marketing Specialist links direct marketing study routes", () => {
  const australia = getOccupationEditorial("marketing-specialist")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /deakin-university'\n  and course_code = '0100820'/)
  assert.match(migration, /rmit-university'\n  and course_code = '077512F'/)
  assert.match(migration, /Deakin — Bachelor of Marketing \(Psychology\)/)
  assert.match(migration, /RMIT — Master of Marketing/)
  assert.match(australia.entryPathway, /Bachelor of Marketing \(Psychology\)/i)
  assert.match(australia.entryPathway, /Master of Marketing/i)
})

test("Australia Marketing Specialist resolves program links without generated ids", () => {
  assert.match(migration, /'au-program:' \|\| id::text as program_ref/)
  assert.match(migration, /'direct'/)
  assert.match(migration, /'graduate_entry'/)
  assert.doesNotMatch(migration, /'au-program:3810'/)
  assert.doesNotMatch(migration, /'au-program:5573'/)
})

test("Australia Marketing Specialist regional rows do not fabricate shortage", () => {
  for (const region of ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]) {
    assert.match(migration, new RegExp(`'AU:marketing-specialist', '${region}', '2026-05-01', null`))
  }
})
