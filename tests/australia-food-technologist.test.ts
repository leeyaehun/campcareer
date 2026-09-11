import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809111132_australia_food_technologist_profile.sql", import.meta.url), "utf8")

test("Australia Food Technologist maps exactly to current OSCA 244232", () => {
  const career = getCanonicalCareer("food-technologist")
  const editorial = getOccupationEditorial("food-technologist")
  assert.ok(career)
  assert.equal(career.categoryId, "environment")
  assert.ok(editorial)
  assert.match(migration, /OSCA 244232 Food Technologist/i)
  assert.match(editorial.overview, /Skill Level 1 occupation 244232/i)
})

test("Australia Food Technologist keeps exact employment but no six-digit salary", () => {
  assert.match(migration, /'AU:food-technologist','2026-05-01',1400,null,null,null/)
  assert.match(migration, /six-digit earnings for 234212/i)
  assert.match(migration, /114,'2026-05-01',-12\.76,10\.34,19\.57/)
})

test("Australia Food Technologist preserves national No Shortage and NSW shortage", () => {
  assert.match(migration, /No Shortage nationally, with NSW in shortage/i)
  assert.match(migration, /'AU:food-technologist','NSW','2026-05-01',3,31\.33333/)
  assert.match(migration, /0,0,5,0,13,0,5,10,3,36/)
})

test("Australia Food Technologist records VETASSESS Group A and current CSOL", () => {
  const australia = getOccupationEditorial("food-technologist")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /Group A/i)
  assert.match(migration, /current Core Skills Occupation List includes ANZSCO 234212/i)
})

test("Australia Food Technologist links current RMIT programs dynamically", () => {
  assert.match(migration, /course_code in \('110979C','094062G'\)/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:5773'/)
  assert.doesNotMatch(migration, /'au-program:5700'/)
})
