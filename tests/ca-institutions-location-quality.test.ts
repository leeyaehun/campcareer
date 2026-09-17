import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const readRepoFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const locationMigration = readRepoFile(
  "supabase/migrations/20260808121000_ca_campus_location_quality.sql",
)
const explorerServer = readRepoFile("src/lib/institutions/institutions.server.ts")
const explorerSearch = readRepoFile("src/lib/institutions/institution-search.ts")
const detailServer = readRepoFile("src/lib/institutions/institution-detail.server.ts")

test("Canada location layer preserves all programme-offering anchors", () => {
  assert.match(locationMigration, /record_scope', 'legacy_offering_anchor'/)
  assert.match(locationMigration, /Expected 30 Canadian legacy offering anchors/)
  assert.match(locationMigration, /active_offering_count <> 165 or offering_anchor_count <> 165/)
})

test("Canada location inventory contains exactly 60 IRCC-backed records across the 30 institution cohort", () => {
  const match = locationMigration.match(
    /with locations\([\s\S]*?\) as \(\n  values\n([\s\S]*?)\n\),\nresolved as \(/,
  )

  assert.ok(match, "expected a locations values block")
  const rows = match[1]
    .split("\n")
    .filter((line) => line.trim().startsWith("('"))

  assert.equal(rows.length, 60)
  assert.match(locationMigration, /verified_location_count <> 60 or verified_institution_count <> 30/)
  assert.match(locationMigration, /location_quality', 'verified_official'/)
  assert.match(locationMigration, /source_kind', 'ircc_dli_list'/)
})

test("Canada verified locations use normalized geography and canonical IRCC provenance", () => {
  assert.match(locationMigration, /institution_location_ca_v1/)
  assert.match(locationMigration, /institution_explorer_ca_v1/)
  assert.match(locationMigration, /institution_detail_ca_v1/)
  assert.match(locationMigration, /missing_geography_count > 0/)
  assert.match(
    locationMigration,
    /https:\/\/www\.canada\.ca\/en\/immigration-refugees-citizenship\/services\/study-canada\/study-permit\/prepare\/designated-learning-institutions-list\.html/,
  )
})

test("Canada Explorer and Detail select the Canada-specific location read models", () => {
  assert.match(explorerServer, /institutionExplorerViewName\(countryCode\)/)
  assert.match(explorerSearch, /institution_explorer_ca_v1/)
  assert.match(detailServer, /countryCode === "CA"/)
  assert.match(detailServer, /institution_detail_ca_v1/)
})

test("major multi-location universities are explicitly represented", () => {
  assert.match(locationMigration, /'university-of-toronto', 'mississauga'/)
  assert.match(locationMigration, /'university-of-toronto', 'toronto'/)
  assert.match(locationMigration, /'university-of-waterloo', 'breslau'/)
  assert.match(locationMigration, /'university-of-waterloo', 'cambridge'/)
  assert.match(locationMigration, /'university-of-waterloo', 'stratford'/)
  assert.match(locationMigration, /'university-of-british-columbia', 'kelowna'/)
  assert.match(locationMigration, /'university-of-british-columbia', 'vancouver'/)
  assert.match(locationMigration, /'mcgill-university', 'macdonald'/)
  assert.match(locationMigration, /'university-of-new-brunswick', 'saint-john'/)
})
