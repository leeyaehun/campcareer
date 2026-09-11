import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809102206_australia_environmental_scientist_profile.sql", import.meta.url), "utf8")

test("Australia Environmental Scientist maps exactly to OSCA 244432 and ANZSCO 234313", () => {
  const career = getCanonicalCareer("environmental-scientist")
  const editorial = getOccupationEditorial("environmental-scientist")
  assert.ok(career)
  assert.equal(career.categoryId, "environment")
  assert.ok(editorial)
  assert.match(migration, /OSCA 244432 Environmental Research Scientist/)
  assert.match(migration, /'ANZSCO','2022','234313'/)
  assert.match(editorial.overview, /alternative title of 244432/i)
})

test("Australia Environmental Scientist preserves exact employment but not six-digit earnings", () => {
  assert.match(migration, /'AU:environmental-scientist','2026-05-01',5500,null,null,null/)
  assert.match(migration, /JSA does not publish six-digit earnings/i)
})

test("Australia Environmental Scientist records national and all-state shortage", () => {
  assert.match(migration, /shortage_component[^;]+20/i)
  for (const state of ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]) {
    assert.match(migration, new RegExp(`'AU:environmental-scientist','${state}','2026-05-01',3`))
  }
})

test("Australia Environmental Scientist does not award current CSOL credit", () => {
  const australia = getOccupationEditorial("environmental-scientist")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /20,0,5,0,13,0,5,0,3,46/)
  assert.match(australia.scoreCaveat, /current CSOL.*not Environmental Research Scientist 234313/i)
})

test("Australia Environmental Scientist links verified study routes dynamically", () => {
  assert.match(migration, /rmit-university' and course_code='110981J'/)
  assert.match(migration, /the-university-of-melbourne' and course_code='092793M'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:5775'/)
  assert.doesNotMatch(migration, /'au-program:4884'/)
})
