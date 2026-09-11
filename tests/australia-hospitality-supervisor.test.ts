import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809132917_australia_hospitality_supervisor_profile.sql", import.meta.url), "utf8")

test("Australia Hospitality Supervisor uses OSCA 4715 umbrella scope", () => {
  const career = getCanonicalCareer("hospitality-supervisor")
  const editorial = getOccupationEditorial("hospitality-supervisor")
  assert.ok(career)
  assert.equal(career.categoryId, "hospitality")
  assert.ok(editorial)
  assert.match(migration, /OSCA Unit Group 4715 Hospitality Supervisors/i)
  assert.match(migration, /no single six-digit code/i)
})

test("Australia Hospitality Supervisor includes all five current supervisor occupations", () => {
  for (const code of ["471531", "471532", "471533", "471534", "471535"]) {
    assert.match(migration, new RegExp(code))
  }
  assert.match(migration, /unit_group_rollup/)
})

test("Australia Hospitality Supervisor avoids fake labour aggregation and uses partial migration credit", () => {
  const australia = getOccupationEditorial("hospitality-supervisor")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /mixed/i)
  assert.match(migration, /Primary employment, demographics and earnings remain null/i)
  assert.match(migration, /0,0,5,0,13,0,5,5,5,33/)
})

test("Australia Hospitality Supervisor keeps eight region rows with no fabricated vacancy aggregate", () => {
  assert.equal((migration.match(/'AU:hospitality-supervisor','(?:ACT|NSW|NT|QLD|SA|TAS|VIC|WA)'/g) ?? []).length, 8)
  assert.match(migration, /vacancy values remain null/i)
  assert.match(migration, /course_code='112061M'/)
})
