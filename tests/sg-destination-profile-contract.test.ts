import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const foundation = read("supabase/migrations/20260810120500_sg_destination_foundation_v1.sql")
const linkage = read("supabase/migrations/20260810121500_sg_destination_linkage_v1.sql")
const metrics = read("supabase/migrations/20260810122500_sg_destination_metrics_v1.sql")
const loader = read("src/lib/destinations/sg-destination-profile.server.ts")
const profile = read("src/components/country-profiles/singapore-study-destination-profile.tsx")

test("SG destination stays country-level instead of inventing a city shortlist", () => {
  assert.match(foundation, /COUNTRY_LEVEL_CITY_STATE_DESTINATION/)
  assert.match(foundation, /country_city_state/)
  assert.doesNotMatch(loader, /report_metric_evidence_city/)
})

test("SG destination profile reads the bounded production read models", () => {
  assert.match(loader, /study_destination_sg_v1/)
  assert.match(loader, /study_destination_institution_sg_v1/)
  assert.match(loader, /study_destination_metric_sg_v1/)
  assert.match(linkage, /programme_delivery_verified/)
  assert.match(metrics, /student_transport_reference/)
  assert.match(metrics, /student_work_hours_limit/)
})

test("SG study profile preserves programme-pending and student-rule caveats", () => {
  assert.match(loader, /Institution or campus presence is never used to infer programme delivery/)
  assert.match(profile, /Eligibility conditions apply/)
  assert.match(profile, /University-student concession products require eligibility/)
  assert.match(profile, /not a universal national fee/)
  assert.match(profile, /not an unconditional allowance/)
})
