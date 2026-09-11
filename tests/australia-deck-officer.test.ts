import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"
const migration=readFileSync(new URL("../supabase/migrations/20260809141443_australia_deck_officer_profile.sql",import.meta.url),"utf8")
test("Australia Deck Officer uses exact OSCA alternative title",()=>{const c=getCanonicalCareer("deck-officer");const e=getOccupationEditorial("deck-officer");assert.ok(c);assert.equal(c.categoryId,"transport");assert.ok(e);assert.match(e.overview,/313436 Ship's Officer explicitly lists Deck Officer as an alternative title/i)})
test("Australia Deck Officer uses exact labour with no CSOL credit",()=>{assert.match(migration,/550,null,null,null,1852,6,10,40,61/);assert.match(migration,/20,0,5,0,10,0,5,0,0,40/)})
test("Australia Deck Officer links direct maritime routes",()=>{assert.match(migration,/077531C/);assert.match(migration,/105105G/);assert.match(migration,/Watchkeeper Deck/)})
