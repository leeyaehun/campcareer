import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

test("Canada city profiles resolve institutions through canonical CA institution identities", () => {
  const loader = readFileSync("src/lib/cities/ca-city-profile.server.ts", "utf8")

  assert.ok(loader.includes('from("city_institution_directory_ca_v1")'))
  assert.ok(loader.includes('from("institution_explorer_v1")'))
  assert.ok(loader.includes('.eq("country_code", "CA")'))
  assert.ok(loader.includes('profilePath: slug ? `/institutions/ca/${slug}` : null'))
})

test("Canada city comparison derives career overlap from published city program summaries", () => {
  const loader = readFileSync("src/lib/cities/ca-city-comparison.server.ts", "utf8")

  assert.ok(loader.includes('from("city_directory_ca_v1")'))
  assert.ok(loader.includes("getCaPublishedCityPairSummary"))
  assert.ok(loader.includes("publicationPair.sharedCareerCount"))
})

test("Canada city UI keeps published program coverage separate from source-backed locations", () => {
  const dashboard = readFileSync("src/app/(workspace)/cities/canada-city-dashboard.tsx", "utf8")
  const matrix = readFileSync("src/app/(workspace)/compare/canada-cities-compare-matrix.tsx", "utf8")

  assert.ok(dashboard.includes("Published target-career programs"))
  assert.ok(dashboard.includes("reviewed Canada program set for the 80 target careers"))
  assert.ok(dashboard.includes("location link is never treated as proof that every program is offered there"))
  assert.ok(matrix.includes("Published target programs"))
  assert.ok(matrix.includes("published target-program coverage"))
  assert.ok(matrix.includes("does not require the same program identity to exist in both cities"))
})

test("Canada institution read model intentionally avoids inventing public Canadian programme detail routes", () => {
  const migration = readFileSync(
    "supabase/migrations/20260808083700_program_institution_bidirectional_links.sql",
    "utf8",
  )

  assert.ok(migration.includes("i.country_code in ('AU', 'CA')"))
  assert.ok(migration.includes("programme_preview"))
  assert.ok(migration.includes("legacyProgramId"))
  assert.ok(!migration.includes("programUrl"))
})
