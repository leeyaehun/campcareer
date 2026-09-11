import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260808214925_australia_supply_chain_analyst_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Supply Chain Analyst maps exactly to current OSCA 223434", () => {
  const career = getCanonicalCareer("supply-chain-analyst")
  const editorial = getOccupationEditorial("supply-chain-analyst")
  const australia = editorial?.countries.AU

  assert.ok(career)
  assert.equal(career.categoryId, "business")
  assert.ok(editorial)
  assert.ok(australia)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(migration, /'AU:supply-chain-analyst'[\s\S]*'Supply Chain Analyst'/)
  assert.match(migration, /'OSCA', '2024 v1\.0', '2234'/)
  assert.match(migration, /'223434', 'Supply Chain Analyst'/)
  assert.match(editorial.overview, /standalone Skill Level 1 occupation/i)
})

test("Australia Supply Chain Analyst keeps current ANZSCO 224714 distinct", () => {
  assert.match(migration, /'ANZSCO', '2022', '224714'/)
  assert.match(migration, /current ANZSCO 2022 correspondence: 224714/i)
  assert.match(migration, /current migration occupation used by VETASSESS/i)
})

test("Australia Supply Chain Analyst does not invent exact employment or earnings", () => {
  assert.match(migration, /'AU:supply-chain-analyst', '2026-05-01', null, null, null, null/)
  assert.match(migration, /'employment_total', 105800/)
  assert.match(migration, /'median_weekly_earnings_aud', 2444/)
  assert.match(migration, /'median_hourly_earnings_aud', 63/)
  assert.match(migration, /Exact Supply Chain Analyst employment, demographics and earnings are therefore left null/i)
})

test("Australia Supply Chain Analyst uses exact no-shortage and conservative broader demand data", () => {
  const australia = getOccupationEditorial("supply-chain-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /779\.66667, '2026-05-01', -1\.56/)
  assert.match(migration, /16\.15, 27\.31/)
  assert.match(migration, /No Shortage nationally and in all eight states and territories/i)
  assert.match(migration, /0, 0, 5, 0, 13, 0, 5, 10, 3, 36/)
  assert.match(australia.scoreCaveat, /vacancies declined about 1\.56%/i)
})

test("Australia Supply Chain Analyst keeps Logistics Officer outside the occupation", () => {
  const editorial = getOccupationEditorial("supply-chain-analyst")

  assert.ok(editorial)
  assert.match(editorial.overview, /Logistics Analyst as an alternative title/i)
  assert.match(editorial.overview, /excluding Logistics Officers/i)
})

test("Australia Supply Chain Analyst records the VETASSESS migration pathway", () => {
  const australia = getOccupationEditorial("supply-chain-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /VETASSESS currently assesses ANZSCO 224714 Supply Chain Analyst as a Group B occupation/i)
  assert.match(migration, /Core Skills stream of subclass 482 and Direct Entry stream of subclass 186/i)
  assert.match(australia.registration, /VETASSESS/i)
})

test("Australia Supply Chain Analyst links verified study routes without generated IDs", () => {
  const australia = getOccupationEditorial("supply-chain-analyst")?.countries.AU

  assert.ok(australia)
  assert.match(migration, /university-of-tasmania'\n  and course_code = '095526F'/)
  assert.match(migration, /rmit-university'\n  and course_code = '077513E'/)
  assert.match(migration, /'au-program:' \|\| id::text/)
  assert.match(migration, /'direct'/)
  assert.match(migration, /'graduate_entry'/)
  assert.match(australia.entryPathway, /Bachelor of Global Logistics and Maritime Management/i)
  assert.match(australia.entryPathway, /Master of Supply Chain and Logistics Management/i)
  assert.doesNotMatch(migration, /'au-program:7920'/)
  assert.doesNotMatch(migration, /'au-program:5574'/)
})
