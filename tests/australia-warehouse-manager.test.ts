import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"
const migration=readFileSync(new URL("../supabase/migrations/20260809141740_australia_warehouse_manager_profile.sql",import.meta.url),"utf8")
test("Australia Warehouse Manager remains a related scope",()=>{const c=getCanonicalCareer("warehouse-manager");const e=getOccupationEditorial("warehouse-manager");assert.ok(c);assert.equal(c.categoryId,"transport");assert.ok(e);assert.match(e.overview,/does not publish a single current OSCA principal occupation titled Warehouse Manager/i);assert.match(migration,/721132/);assert.match(migration,/Warehouse Supervisor/);assert.match(migration,/133331/);assert.match(migration,/Supply and Distribution Manager/)})
test("Australia Warehouse Manager keeps primary labour and salary null",()=>{assert.match(migration,/'AU:warehouse-manager','2026-05-01',null,null,null,null/);assert.match(migration,/0,0,5,0,13,0,5,5,3,31/)})
test("Australia Warehouse Manager uses related study links only",()=>{assert.match(migration,/095526F/);assert.match(migration,/077513E/);assert.match(migration,/'related','2026-08-09'/)})
