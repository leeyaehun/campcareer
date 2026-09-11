import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809123415_australia_film_editor_profile.sql", import.meta.url), "utf8")

test("Australia Film Editor uses exact OSCA 231434 scope", () => {
  const career = getCanonicalCareer("film-editor")
  const editorial = getOccupationEditorial("film-editor")
  assert.ok(career)
  assert.equal(career.categoryId, "design")
  assert.ok(editorial)
  assert.match(migration, /OSCA 231434 Film and Video Editor/i)
})

test("Australia Film Editor keeps broader vacancy data contextual", () => {
  assert.match(migration, /3300,null,null,null,1852,33,28,33,44/)
  assert.match(migration, /65\.66667,'2026-05-01',-4\.37,9\.71,19\.14/)
  assert.match(migration, /vacancy intensity and trend receive zero credit/i)
})

test("Australia Film Editor gets exact shortage but no current visa score", () => {
  const australia = getOccupationEditorial("film-editor")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /VETASSESS assesses legacy ANZSCO 212314 Film and Video Editor as Group B/i)
  assert.match(migration, /Shortage nationally and in all eight states and territories/i)
  assert.match(migration, /20,0,5,0,13,0,5,0,3,46/)
})

test("Australia Film Editor links current study routes dynamically", () => {
  assert.match(migration, /course_code='093584A'/)
  assert.match(migration, /course_code='095258K'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
})
