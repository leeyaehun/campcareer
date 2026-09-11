import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260809080606_australia_human_resources_specialist_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Human Resources Specialist maps to current OSCA Human Resources Adviser", () => {
  const career = getCanonicalCareer("human-resources-specialist")
  const editorial = getOccupationEditorial("human-resources-specialist")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "business")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:human-resources-specialist'[\s\S]*'Human Resources Adviser'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2221'/)
  assert.match(migration, /'222131', 'Human Resources Adviser'/)
  assert.match(migration, /'2013 v1\.3', '223111'/)
  assert.match(editorial.overview, /HR specialists/i)
})

test("Australia Human Resources Specialist uses aligned six-digit employment and demographics but no inferred salary", () => {
  assert.match(migration, /'AU:human-resources-specialist', '2026-05-01', 33500, null, null, null/)
  assert.match(migration, /1852, 22, 81, 37, 41, 2355\.66667/)
  assert.match(migration, /'employment_total', 33500/)
  assert.match(migration, /'median_weekly_earnings_aud', 1970/)
  assert.match(migration, /six-digit median earnings for ANZSCO 223111/i)
  assert.match(migration, /salary component is zero/i)
})

test("Australia Human Resources Specialist preserves national no-shortage and SA NT shortage signals", () => {
  const australia = getOccupationEditorial("human-resources-specialist")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /South Australia and the Northern Territory have shortage signals/i)
  assert.match(migration, /'NT', '2026-05-01', 3, 26\.66667/)
  assert.match(migration, /'SA', '2026-05-01', 3, 161\.33333/)
  assert.match(australia.jobMarketNote, /South Australia and the Northern Territory/i)
})

test("Australia Human Resources Specialist keeps broader vacancy and growth context conservative", () => {
  const australia = getOccupationEditorial("human-resources-specialist")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /2355\.66667, '2026-05-01', -4\.69/)
  assert.match(migration, /7\.39, 14\.77/)
  assert.match(migration, /0, 0, 5, 0, 13, 0, 5, 10, 3, 36/)
  assert.match(australia.scoreCaveat, /4\.69% year on year/i)
})

test("Australia Human Resources Specialist records current CSOL and VETASSESS Group B pathway", () => {
  const australia = getOccupationEditorial("human-resources-specialist")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /Core Skills Occupation List includes legacy ANZSCO 223111 Human Resource Adviser/i)
  assert.match(migration, /VETASSESS classifies 223111 as Group B/i)
  assert.match(migration, /visa_component/i)
  assert.match(australia.registration, /VETASSESS/i)
})

test("Australia Human Resources Specialist links verified AHRI-aligned undergraduate and postgraduate routes", () => {
  const australia = getOccupationEditorial("human-resources-specialist")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /deakin-university'\n  and course_code = '0101801'/)
  assert.match(migration, /rmit-university'\n  and course_code = '088784B'/)
  assert.match(migration, /official_url_status = 'verified'/)
  assert.match(migration, /Bachelor of Human Resource Management \(Psychology\)/)
  assert.match(migration, /Master of Human Resource Management/)
  assert.match(australia.entryPathway, /AHRI/i)
})

test("Australia Human Resources Specialist resolves programs without generated IDs", () => {
  assert.match(migration, /'au-program:' \|\| id::text/)
  assert.match(migration, /'direct'::text as relation_type/)
  assert.match(migration, /'graduate_entry'::text as relation_type/)
  assert.doesNotMatch(migration, /'au-program:3815'/)
  assert.doesNotMatch(migration, /'au-program:5686'/)
})
