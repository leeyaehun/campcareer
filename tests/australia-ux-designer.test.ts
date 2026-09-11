import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809121425_australia_ux_designer_profile.sql", import.meta.url), "utf8")

test("Australia UX Designer uses exact current OSCA 242132 scope", () => {
  const career = getCanonicalCareer("ux-designer")
  const editorial = getOccupationEditorial("ux-designer")
  assert.ok(career)
  assert.equal(career.categoryId, "design")
  assert.deepEqual(career.aliases, ["user experience designer"])
  assert.ok(editorial)
  assert.match(migration, /Current OSCA 242132 UI \/ UX Designer is exact/i)
  assert.match(migration, /ANZSCO 2022 261113 User Experience Designer/i)
})

test("Australia UX Designer does not substitute legacy labour for current 261113", () => {
  assert.match(migration, /'AU:ux-designer','2026-05-01',null,null,null,null/)
  assert.match(migration, /legacy ANZSCO-based and contains no exact six-digit 261113/i)
  assert.match(migration, /1863,'2026-05-01',-8\.05,15\.07,25\.88/)
})

test("Australia UX Designer has national No Shortage and zero current CSOL credit", () => {
  const australia = getOccupationEditorial("ux-designer")?.countries.AU
  assert.ok(australia)
  assert.match(australia.scoreCaveat, /No visa credit/i)
  assert.match(migration, /does not list 261113 User Experience Designer/i)
  assert.match(migration, /0,0,5,0,13,0,5,0,5,28/)
})

test("Australia UX Designer links only current verified study routes dynamically", () => {
  assert.match(migration, /course_code='113900B'/)
  assert.match(migration, /course_code='080726K'/)
  assert.doesNotMatch(migration, /course_code='095572M'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:6567'/)
  assert.doesNotMatch(migration, /'au-program:1441'/)
})
