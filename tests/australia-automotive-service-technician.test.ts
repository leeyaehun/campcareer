import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"
const migration=readFileSync(new URL("../supabase/migrations/20260809142044_australia_automotive_service_technician_profile.sql",import.meta.url),"utf8")
test("Australia Automotive Service Technician uses exact OSCA 351131",()=>{const c=getCanonicalCareer("automotive-service-technician");const e=getOccupationEditorial("automotive-service-technician");assert.ok(c);assert.equal(c.categoryId,"transport");assert.ok(e);assert.match(migration,/351131/);assert.match(migration,/Automotive Technician \(General\)/)})
test("Australia Automotive Service Technician uses exact labour and full shortage migration credit",()=>{assert.match(migration,/79300,null,null,null,1852,15,2,36,43/);assert.match(migration,/20,0,5,0,15,0,5,10,5,60/)})
test("Australia Automotive Service Technician verifies direct and related TAFE SA routes",()=>{assert.match(migration,/103612D/);assert.match(migration,/091697G/);assert.match(migration,/case when course_code='103612D' then 'direct' else 'related' end/)})
