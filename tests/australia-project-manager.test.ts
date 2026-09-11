import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const normalizeMigrationSql = (sql: string) => {
  const normalized = sql.replace(/\s+/g, " ").replace(/,\s*/g, ", ").replace(/\s*=\s*/g, " = ").trim()
  return `${sql}\n${normalized}`
}


const migration = readFileSync(
  new URL("../supabase/migrations/20260809084158_australia_project_manager_profile.sql", import.meta.url),
  "utf8",
)

const migrationSql = normalizeMigrationSql(migration)

test("Australia generic Project Manager uses a related proxy rather than inventing an exact code", () => {
  const career = getCanonicalCareer("project-manager")
  const editorial = getOccupationEditorial("project-manager")

  assert.ok(career)
  assert.equal(career.categoryId, "business")
  assert.ok(editorial)
  assert.ok(editorial.tasks.length >= 6)
  assert.match(editorial.overview, /does not provide one cross-industry six-digit Project Manager occupation/i)
  assert.match(migrationSql, /OSCA 511231 Program or Project Administrator is used only as the closest non-sector proxy/i)
  assert.match(migrationSql, /'mapping_relation', 'related_proxy'/)
})

test("Australia Project Manager keeps sector-specific project managers separate", () => {
  assert.match(migrationSql, /113232 ICT Project Manager/)
  assert.match(migrationSql, /131131 Construction Project Manager/)
  assert.match(migrationSql, /intentionally excluded/i)
})

test("Australia Project Manager does not misuse proxy employment or earnings as exact metrics", () => {
  assert.match(migrationSql, /'AU:project-manager', '2026-05-01', null, null, null, null/)
  assert.match(migrationSql, /'legacy_employment_total', 103200/)
  assert.match(migrationSql, /'median_weekly_earnings_aud', 2130/)
  assert.match(migrationSql, /primary employment\/demographic fields remain null/i)
})

test("Australia Project Manager preserves no-shortage proxy and conservative score", () => {
  const australia = getOccupationEditorial("project-manager")?.countries.AU

  assert.ok(australia)
  assert.match(migrationSql, /2107\.33333/)
  assert.match(migrationSql, /about \+1\.01% year on year/i)
  assert.match(migrationSql, /9\.54, 17\.33, 0, 0, 5, 0, 10, 0, 5, 5, 5, 30/)
  assert.match(migrationSql, /No Shortage nationally/i)
  assert.match(australia.scoreCaveat, /deliberately conservative/i)
})

test("Australia Project Manager gives only partial visa credit for the 511112 proxy", () => {
  const australia = getOccupationEditorial("project-manager")?.countries.AU

  assert.ok(australia)
  assert.match(migrationSql, /ANZSCO 511112 Program or Project Administrator with VETASSESS/i)
  assert.match(migrationSql, /Group C/i)
  assert.match(migrationSql, /generalist management roles are explicitly outside/i)
  assert.match(australia.registration, /duties genuinely fit that occupation/i)
})

test("Australia Project Manager links direct project-management programs without generated ids", () => {
  const australia = getOccupationEditorial("project-manager")?.countries.AU

  assert.ok(australia)
  assert.match(migrationSql, /bond-university'\s+and course_code = '0101294'/)
  assert.match(migrationSql, /bond-university'\n  and course_code = '078813G'/)
  assert.match(migrationSql, /concat\('au-program:', id\)/)
  assert.doesNotMatch(migrationSql, /'au-program:1179'/)
  assert.doesNotMatch(migrationSql, /'au-program:1232'/)
  assert.match(australia.entryPathway, /Bachelor of Project Management/i)
  assert.match(australia.entryPathway, /Master of Project Management/i)
})

test("Australia Project Manager regional rows do not fabricate shortage from a proxy", () => {
  for (const region of ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]) {
    assert.match(migrationSql, new RegExp(`'AU:project-manager', '${region}', '2026-05-01', null`))
  }
})
