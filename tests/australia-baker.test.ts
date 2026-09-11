import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809132155_australia_baker_profile.sql", import.meta.url), "utf8")

test("Australia Baker uses exact OSCA 322131 scope", () => {
  const career = getCanonicalCareer("baker")
  const editorial = getOccupationEditorial("baker")
  assert.ok(career)
  assert.equal(career.categoryId, "hospitality")
  assert.ok(editorial)
  assert.match(migration, /OSCA 322131 Baker is exact/i)
  assert.match(editorial.overview, /Pastrycook as a separate occupation/i)
})

test("Australia Baker uses exact employment context and broader IVI conservatively", () => {
  assert.match(migration, /18700,null,null,null,1852,34,28,36,43/)
  assert.match(migration, /424\.66667,'2026-05-01',8\.89,2\.96,8\.05/)
  assert.match(migration, /vacancy intensity and trend receive zero credit/i)
})

test("Australia Baker has national shortage and TRA migration credit", () => {
  const australia = getOccupationEditorial("baker")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /Trades Recognition Australia/i)
  assert.match(migration, /national Shortage occupation/i)
  assert.match(migration, /20,0,5,0,15,0,5,10,5,60/)
})

test("Australia Baker links direct baking and related patisserie programs", () => {
  assert.match(migration, /course_code='107364E'/)
  assert.match(migration, /course_code='109757E'/)
  assert.match(migration, /case when course_code='107364E' then 'direct' else 'related' end/)
})
