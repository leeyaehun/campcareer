import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"
const migration=readFileSync(new URL("../supabase/migrations/20260809140640_australia_commercial_pilot_profile.sql",import.meta.url),"utf8")
test("Australia Commercial Pilot uses exact Aeroplane Pilot scope",()=>{const c=getCanonicalCareer("commercial-pilot");const e=getOccupationEditorial("commercial-pilot");assert.ok(c);assert.equal(c.categoryId,"transport");assert.ok(e);assert.match(migration,/299131/);assert.match(migration,/Aeroplane Pilot/)})
test("Australia Commercial Pilot keeps exact labour and salary null",()=>{assert.match(migration,/8200,null,null,null,1852,39,7,41,44/);assert.match(migration,/20,0,5,0,10,0,5,10,0,50/)})
test("Australia Commercial Pilot verifies direct flight-training programs",()=>{assert.match(migration,/111190K/);assert.match(migration,/017227G/);assert.match(migration,/Commercial Pilot Licence/)})
