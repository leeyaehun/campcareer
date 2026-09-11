import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(
  new URL("../supabase/migrations/20260809094342_australia_social_worker_profile.sql", import.meta.url),
  "utf8",
)

test("Australia Social Worker maps exactly to current OSCA 261331 and ANZSCO 272511", () => {
  const career = getCanonicalCareer("social-worker")
  const editorial = getOccupationEditorial("social-worker")
  assert.ok(career)
  assert.equal(career.categoryId, "education")
  assert.ok(editorial)
  assert.match(migration, /OSCA 261331 Social Worker/)
  assert.match(migration, /anzsco_v13 = '272511'/)
  assert.match(migration, /'ANZSCO','2022','272511'/)
})

test("Australia Social Worker uses the tightly aligned legacy social-worker labour series", () => {
  assert.match(migration, /'AU:social-worker','2026-05-01',47400,2172,57,112944/)
  assert.match(migration, /47,400 workers/i)
  assert.match(migration, /17\.28% above/i)
})

test("Australia Social Worker preserves national no-shortage and regional variation", () => {
  const australia = getOccupationEditorial("social-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /'ACT','2026-05-01',3/)
  assert.match(migration, /'NT','2026-05-01',3/)
  assert.match(migration, /'SA','2026-05-01',3/)
  assert.match(migration, /'VIC','2026-05-01',2/)
  assert.match(australia.jobMarketNote, /regional-shortage signal in Victoria/i)
})

test("Australia Social Worker scores aligned vacancy intensity earnings growth and visa evidence", () => {
  const australia = getOccupationEditorial("social-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /1177\.66667,'2026-05-01',-8\.21,14\.60,25\.31,0,15,5,0,13,8,10,10,2,63/)
  assert.match(australia.scoreCaveat, /8\.21% lower year on year/i)
})

test("Australia Social Worker records AASW migration assessment without inventing statutory registration", () => {
  const australia = getOccupationEditorial("social-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /AASW is the migration skills assessing authority/i)
  assert.match(migration, /'AUD',false/)
  assert.match(australia.registration, /does not currently have a universal statutory registration/i)
})

test("Australia Social Worker links verified undergraduate and qualifying master routes dynamically", () => {
  const australia = getOccupationEditorial("social-worker")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /rmit-university'\s+and course_code\s*=\s*'079596C'/)
  assert.match(migration, /the-university-of-melbourne'\s+and course_code\s*=\s*'061212E'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:5589'/)
  assert.doesNotMatch(migration, /'au-program:4702'/)
  assert.match(australia.entryPathway, /AASW-accredited/i)
})
