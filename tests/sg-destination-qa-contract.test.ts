import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const foundation = read("supabase/migrations/20260810120500_sg_destination_foundation_v1.sql")
const linkage = read("supabase/migrations/20260810121500_sg_destination_linkage_v1.sql")
const metrics = read("supabase/migrations/20260810122500_sg_destination_metrics_v1.sql")
const loader = read("src/lib/destinations/sg-destination-profile.server.ts")
const profile = read("src/components/country-profiles/singapore-study-destination-profile.tsx")
const compare = read("src/app/(workspace)/compare/page.tsx")
const sitemap = read("src/app/sitemap.ts")

test("Phase 8 preserves the one-destination Singapore city-state model in the data contract", () => {
  assert.match(foundation, /COUNTRY_LEVEL_CITY_STATE_DESTINATION/)
  assert.match(foundation, /country_city_state/)
  assert.doesNotMatch(sitemap, /`\$\{SITE_URL\}\/sg`/)
  assert.doesNotMatch(sitemap, /\/cities\/sg\//)
})

test("Phase 8 keeps bounded institution and programme-verification contracts", () => {
  assert.match(linkage, /programme_delivery_verified/)
  assert.match(loader, /study_destination_institution_sg_v1/)
  assert.match(loader, /Institution or campus presence is never used to infer programme delivery/)
  assert.match(loader, /Programme delivery verification pending/)
  assert.match(profile, /profile\.programmeCoverage/)
})

test("Phase 8 keeps all Singapore destination metrics source-backed and conditional", () => {
  assert.match(loader, /study_destination_metric_sg_v1/)
  assert.match(metrics, /student_transport_reference/)
  assert.match(metrics, /student_work_hours_limit/)
  assert.match(profile, /Eligibility conditions apply/)
  assert.match(profile, /not a universal national fee/)
  assert.match(profile, /not an unconditional allowance/)
})

test("Phase 8 keeps city compare from inventing Singapore cities", () => {
  assert.match(compare, /countryCode === "SG"/)
  assert.match(compare, /There is no Singapore city shortlist to compare/)
  assert.match(compare, /CampCareer treats Singapore as one country-level study destination/)
  assert.match(compare, /href="\/maps\?country=sg"/)
})
