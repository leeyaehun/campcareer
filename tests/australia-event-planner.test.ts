import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809132638_australia_event_planner_profile.sql", import.meta.url), "utf8")

test("Australia Event Planner uses exact Event Manager specialisation scope", () => {
  const career = getCanonicalCareer("event-planner")
  const editorial = getOccupationEditorial("event-planner")
  assert.ok(career)
  assert.equal(career.categoryId, "hospitality")
  assert.ok(editorial)
  assert.match(migration, /Event Planner is an explicit specialisation of current OSCA 172231 Event Manager/i)
  assert.match(migration, /mapping_relation','exact_specialisation'/)
})

test("Australia Event Planner keeps broader vacancy data contextual", () => {
  assert.match(migration, /447\.66667,'2026-05-01',1\.90,5\.62,12\.23/)
  assert.match(migration, /vacancy intensity and trend receive zero credit/i)
})

test("Australia Event Planner has NS shortage and no current CSOL credit", () => {
  const australia = getOccupationEditorial("event-planner")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /not on the current Core Skills Occupation List/i)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /0,0,5,0,13,0,5,0,5,28/)
})

test("Australia Event Planner links direct and related event study routes", () => {
  assert.match(migration, /course_code='112057G'/)
  assert.match(migration, /course_code='103168H'/)
  assert.match(migration, /case when course_code='112057G' then 'direct' else 'related' end/)
})
