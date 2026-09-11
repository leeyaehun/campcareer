import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260809095843_australia_counsellor_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Counsellor maps to current OSCA 261131", () => {
  const career = getCanonicalCareer("counsellor")
  const editorial = getOccupationEditorial("counsellor")
  assert.ok(career)
  assert.equal(career.categoryId, "education")
  assert.ok(editorial)
  assert.match(migration, /OSCA 261131 Counsellor \(General\)/)
  assert.match(editorial.overview, /Skill Level 1 occupation 261131/i)
})

test("Australia Counsellor keeps legacy 272199 contextual", () => {
  assert.match(migration, /'AU:counsellor','2026-05-01',null,null,null,null/)
  assert.match(migration, /legacy_272199_context/)
  assert.match(migration, /'employment_total',5800/)
  assert.match(migration, /Broader ANZSCO 2721/)
})

test("Australia Counsellor uses national no-shortage and conservative demand scoring", () => {
  const australia = getOccupationEditorial("counsellor")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /434\.66667,'2026-05-01',-14\.15,12\.98,23\.36,0,0,5,0,13,0,5,0,4,27/)
  assert.match(australia.scoreCaveat, /14\.15% year on year/i)
})

test("Australia Counsellor keeps assessment separate from current list eligibility", () => {
  const australia = getOccupationEditorial("counsellor")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /ANZSCO 272199 Counsellors nec as Group A/i)
  assert.match(migration, /visa component is zero/i)
  assert.match(migration, /'272199',null,false,true/)
  assert.match(australia.registration, /occupation-list eligibility/i)
})

test("Australia Counsellor records no universal statutory registration", () => {
  const australia = getOccupationEditorial("counsellor")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /'AUD',false/)
  assert.match(australia.registration, /no universal statutory licensing or registration/i)
})

test("Australia Counsellor links bachelor and master routes dynamically", () => {
  const australia = getOccupationEditorial("counsellor")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /edith-cowan-university'\s+and course_code\s*=\s*'083640C'/)
  assert.match(migration, /deakin-university'\s+and course_code\s*=\s*'112781A'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.match(australia.entryPathway, /AQF Level 7/i)
  assert.match(australia.entryPathway, /AQF Level 9/i)
})
