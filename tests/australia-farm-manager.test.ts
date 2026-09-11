import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) => {
  const normalized = sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()
  return `${sql}\n${normalized}`
}

const migration = normalizeMigrationSql(readFileSync(new URL("../supabase/migrations/20260809102844_australia_farm_manager_profile.sql", import.meta.url), "utf8"))

test("Australia Farm Manager is a production-specific umbrella rather than a fake six-digit occupation", () => {
  const career = getCanonicalCareer("farm-manager")
  const editorial = getOccupationEditorial("farm-manager")
  assert.ok(career)
  assert.equal(career.categoryId, "environment")
  assert.ok(editorial)
  assert.match(migration, /no generic current six-digit Farm Manager occupation/i)
  assert.match(editorial.overview, /classified by the type of production/i)
})

test("Australia Farm Manager keeps generic labour and shortage metrics null", () => {
  assert.match(migration, /'AU:farm-manager','2026-05-01',null,null,null,null,1852,null,null,null,null,null,null,null,null,null/)
  assert.match(migration, /no generic Farm Manager row in the 2025 OSL/i)
})

test("Australia Farm Manager records representative production-specific occupations", () => {
  for (const code of ["151331", "152131", "152231", "152431", "152934", "152935"]) {
    assert.match(migration, new RegExp(`'AU:farm-manager','${code}'`))
  }
  assert.match(migration, /'121111',null,true/)
  assert.match(migration, /'121313',null,true/)
  assert.match(migration, /'121322',null,false/)
})

test("Australia Farm Manager gives only partial visa credit", () => {
  const australia = getOccupationEditorial("farm-manager")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /0,0,5,0,10,0,0,5,3,23/)
  assert.match(australia.scoreCaveat, /not every role.*Farm Manager/i)
})

test("Australia Farm Manager links Charles Sturt routes dynamically", () => {
  assert.match(migration, /course_code in \('057781F','0101014'\)/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:695'/)
  assert.doesNotMatch(migration, /'au-program:678'/)
})
