import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"
const migration=readFileSync(new URL("../supabase/migrations/20260809141154_australia_marine_engineer_profile.sql",import.meta.url),"utf8")
test("Australia Marine Engineer uses exact OSCA 313431",()=>{const c=getCanonicalCareer("marine-engineer");const e=getOccupationEditorial("marine-engineer");assert.ok(c);assert.equal(c.categoryId,"transport");assert.ok(e);assert.match(migration,/313431/);assert.match(migration,/Marine Engineer/)})
test("Australia Marine Engineer uses exact labour and conservative score",()=>{assert.match(migration,/1900,null,null,null,1852,8,4,45,55/);assert.match(migration,/20,0,5,0,10,0,5,10,0,50/)})
test("Australia Marine Engineer links verified direct routes",()=>{assert.match(migration,/077530D/);assert.match(migration,/107410D/);assert.match(migration,/Engineer Watchkeeper/)})
