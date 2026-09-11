import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const routes = readFileSync("src/lib/cities/city-routes.ts", "utf8")
const profile = readFileSync("src/lib/cities/fr-city-profile.server.ts", "utf8")
const page = readFileSync("src/app/(workspace)/cities/fr/[city]/page.tsx", "utf8")
const dashboard = readFileSync("src/app/(workspace)/cities/france-city-dashboard.tsx", "utf8")
const phase2 = readFileSync("supabase/migration-contracts/20260810223000_normalize_fr_tier_a_city_geographies_v1.sql", "utf8")
const phase3 = readFileSync("supabase/migration-contracts/20260810223100_publish_fr_tier_a_city_linkage_v1.sql", "utf8")
const phase4 = readFileSync("supabase/migration-contracts/20260810223200_publish_fr_tier_a_city_metrics_v1.sql", "utf8")

const published = ["paris", "paris-saclay", "bordeaux", "strasbourg", "grenoble", "aix-marseille", "nice"]

test("France city scope is exactly the seven Phase 1 destinations", () => {
  for (const slug of published) assert.ok(routes.includes(`"${slug}"`))
  for (const slug of ["talence", "saint-aubin", "saint-martin-dheres", "marseille"]) {
    assert.doesNotMatch(routes, new RegExp(`PUBLISHED_FR_CITY_SLUGS = \\[.*"${slug}"`))
  }
  assert.ok(routes.includes("isPublishedFrCitySlug"))
  assert.ok(routes.includes("/cities/fr/${slug}"))
})

test("Phase 2 separates public destinations from registered localities", () => {
  for (const code of ["75056", "200056232", "243300316", "246700488", "200040715", "200054807", "200030195"]) assert.ok(phase2.includes(code))
  assert.ok(phase2.includes("strasbourg-commune"))
  assert.ok(phase2.includes("nice-commune"))
  assert.ok(phase2.includes("public_destination_not_commune"))
  assert.ok(phase2.includes("campus_membership_contract"))
  assert.doesNotMatch(phase2, /alias[^\n]+Talence|alias[^\n]+Saint-Aubin|alias[^\n]+Saint-Martin-d'Hères/i)
})

test("Phase 3 publishes verified teaching locations with programme delivery still unverified", () => {
  assert.ok(phase3.includes("fr_city_linkage_v1"))
  assert.ok(phase3.includes("verified_teaching_campus"))
  assert.ok(phase3.includes("programme_assignment_verified',false"))
  assert.ok(phase3.includes("city_directory_fr_v1"))
  assert.ok(phase3.includes("city_institution_directory_fr_v1"))
  assert.ok(phase3.includes("city_programme_directory_fr_v1"))
  assert.ok(phase3.includes("security_invoker=true"))
  assert.ok(phase3.includes("programme directory must remain empty"))
})

test("Phase 4 requires exactly five metrics per seven destinations", () => {
  for (const key of ["city_population", "student_living_cost_monthly_range", "student_transport_reference", "student_work_hours_year", "employment_focus_sectors"]) assert.ok(phase4.includes(key))
  assert.ok(phase4.includes("expected exactly 35 verified core metric rows"))
  assert.ok(phase4.includes("964"))
  assert.ok(phase4.includes("not_monthly_normalized"))
  assert.ok(phase4.includes("not_cost_ranking"))
})

test("France profile reads only approved read models and verified metrics", () => {
  assert.ok(profile.includes('.from("city_directory_fr_v1")'))
  assert.ok(profile.includes('.from("city_institution_directory_fr_v1")'))
  assert.ok(profile.includes('.from("report_metric_evidence_city")'))
  assert.ok(profile.includes('.eq("review_status", "verified")'))
  assert.doesNotMatch(profile, /\.from\("city_programme_directory_fr_v1"\)/)
  assert.doesNotMatch(profile, /\.from\("campuses"\)|\.from\("programmes"\)|\.from\("programme_offerings"\)/)
})

test("publication keeps programme and geography guardrails visible", () => {
  assert.ok(profile.includes("Institution or teaching-location presence is never used to infer city programme availability"))
  assert.ok(dashboard.includes("verification pending rather than “0 programmes”"))
  assert.ok(dashboard.includes("public geography contract"))
  assert.ok(dashboard.includes("964"))
  assert.ok(page.includes("robots: { index: true, follow: true }"))
  assert.ok(page.includes("robots: { index: false, follow: false }"))
})
