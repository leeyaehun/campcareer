import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809111512_australia_sustainability_specialist_profile.sql", import.meta.url), "utf8")

test("Australia Sustainability Specialist is a related Environmental Consultant proxy", () => {
  const career = getCanonicalCareer("sustainability-specialist")
  const editorial = getOccupationEditorial("sustainability-specialist")
  assert.ok(career)
  assert.equal(career.categoryId, "environment")
  assert.ok(editorial)
  assert.match(migration, /No standalone current OSCA Sustainability Specialist exists/i)
  assert.match(migration, /OSCA 244431 Environmental Consultant/i)
  assert.match(editorial.overview, /sustainability performance/i)
})

test("Australia Sustainability Specialist does not promote proxy labour to primary metrics", () => {
  assert.match(migration, /'AU:sustainability-specialist','2026-05-01',null,null,null,null/)
  assert.match(migration, /'employment_total',5100/)
  assert.match(migration, /proxy only/i)
})

test("Australia Sustainability Specialist uses partial visa credit", () => {
  assert.match(migration, /0,0,5,0,13,0,5,5,3,31/)
  assert.match(migration, /partial visa credit/i)
  assert.match(migration, /Environmental Consultant 234312 \/ VETASSESS Group A/i)
})

test("Australia Sustainability Specialist preserves regional OSL context", () => {
  assert.match(migration, /No Shortage nationally, with SA and NT in shortage/i)
  assert.match(migration, /'AU:sustainability-specialist','NT','2026-05-01',3,13\.33333/)
  assert.match(migration, /'AU:sustainability-specialist','SA','2026-05-01',3,19\.33333/)
})

test("Australia Sustainability Specialist links Deakin programs dynamically", () => {
  assert.match(migration, /course_code in \('116267J','108875G'\)/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:3997'/)
  assert.doesNotMatch(migration, /'au-program:3962'/)
})
