import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const countryOccupationRead = readFileSync("src/lib/workspace/country-occupation-read.ts", "utf8")
const careerMarketRead = readFileSync("src/lib/workspace/career-market-read.ts", "utf8")
const homeOverviewRead = readFileSync("src/lib/workspace/home-overview-read.ts", "utf8")
const rawCareerDataRead = readFileSync("src/lib/workspace/raw-career-data.ts", "utf8")
const migration = readFileSync("supabase/migrations/20260907101500_p0_5_private_raw_career_data.sql", "utf8")

const rawCareerTables = [
  "country_occupation_profiles",
  "country_occupation_metric_snapshots",
  "country_occupation_specialisations",
  "country_occupation_region_metrics",
  "country_occupation_links",
  "country_occupation_program_links",
]

test("P0.5 sends raw country occupation reads only through the controlled server-side gateway", () => {
  for (const source of [countryOccupationRead, careerMarketRead, homeOverviewRead]) {
    assert.match(source, /import \{ readRawCareerData \} from "\.\/raw-career-data"/)
  }
  assert.match(rawCareerDataRead, /return read\(supabaseAdmin\)/)
  assert.doesNotMatch(rawCareerDataRead, /from "@\/lib\/supabase"/)
  assert.doesNotMatch(rawCareerDataRead, /42501/)
})

test("P0.5 removes browser-role policies and privileges from every raw Career table", () => {
  for (const table of rawCareerTables) {
    assert.match(migration, new RegExp(`grant select on table public\\.${table} to service_role;`))
    assert.match(migration, new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated;`))
  }
  assert.match(migration, /drop policy if exists "country occupation metrics public read"/)
  assert.match(migration, /Deploy the application version that uses supabaseAdmin/)
})
