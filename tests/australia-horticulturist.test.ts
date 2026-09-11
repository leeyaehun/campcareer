import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) =>
  sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()

const migration = normalizeMigrationSql(readFileSync(new URL("../supabase/migrations/20260809111859_australia_horticulturist_profile.sql", import.meta.url), "utf8"))

test("Australia Horticulturist remains a multi-occupation umbrella", () => {
  const career = getCanonicalCareer("horticulturist")
  const editorial = getOccupationEditorial("horticulturist")
  assert.ok(career)
  assert.equal(career.categoryId, "environment")
  assert.ok(editorial)
  assert.match(migration, /No single current six-digit OSCA Horticulturist exists/i)
  assert.match(editorial.overview, /342931 Nurseryperson/i)
  assert.match(editorial.overview, /343134 Horticultural Supervisor or Specialist/i)
})

test("Australia Horticulturist does not fabricate generic labour metrics", () => {
  assert.match(migration, /'AU:horticulturist','2026-05-01',null,null,null,null/)
  assert.match(migration, /Generic Horticulturist employment and earnings remain null/i)
  assert.match(migration, /46\.33333,'2026-05-01',-27\.98,2\.70,8\.79/)
})

test("Australia Horticulturist uses only partial Nurseryperson migration credit", () => {
  assert.match(migration, /Nurseryperson 362411 with TRA/i)
  assert.match(migration, /partial visa credit only/i)
  assert.match(migration, /0,0,5,0,15,0,5,5,5,30/)
})

test("Australia Horticulturist preserves national No Shortage context", () => {
  assert.match(migration, /Nurseryperson 342931 and Horticultural Supervisor or Specialist 343134 as No Shortage nationally/i)
})

test("Australia Horticulturist links TAFE SA and ECU programs dynamically", () => {
  assert.match(migration, /course_code='117361C'/)
  assert.match(migration, /course_code='108845B'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:18480'/)
  assert.doesNotMatch(migration, /'au-program:7366'/)
})
