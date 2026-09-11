import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const qa = fs.readFileSync("docs/data-foundation/ae-city-qa-v1.md", "utf8")
const routes = fs.readFileSync("src/lib/cities/city-routes.ts", "utf8")
const compareServer = fs.readFileSync("src/lib/cities/ae-city-comparison.server.ts", "utf8")
const compareMatrix = fs.readFileSync("src/app/(workspace)/compare/uae-cities-compare-matrix.tsx", "utf8")
const profilePage = fs.readFileSync("src/app/(workspace)/cities/ae/[city]/page.tsx", "utf8")
const sitemap = fs.readFileSync("src/app/sitemap.ts", "utf8")
const readModels = fs.readFileSync("supabase/migration-contracts/20260812004700_publish_ae_tier_a_city_read_models_v1.sql", "utf8")
const metricsMigration = fs.readFileSync("supabase/migration-contracts/20260812004800_publish_ae_tier_a_city_metrics_v1.sql", "utf8")

const metrics = [
  "city_population",
  "student_living_cost_monthly_range",
  "student_transport_reference",
  "student_work_hours_week",
  "employment_focus_sectors",
]

test("UAE Phase 8 records the production publish-ready checkpoint", () => {
  assert.match(qa, /PHASE_8_COMPLETE/)
  assert.match(qa, /PUBLISH_READY/)
  for (const expected of ["Tier A canonical City rows: `4`", "strict City-linked programme rows: `98`", "verified core metric rows: `20`", "Compare-ready Cities: `4/4`", "readiness failures: `0`"]) {
    assert.ok(qa.includes(expected), `missing production QA fact: ${expected}`)
  }
})

test("UAE Compare and publication retain the exact four-City gate", () => {
  assert.match(routes, /PUBLISHED_AE_CITY_SLUGS = \["abu-dhabi", "sharjah", "al-ain", "dubai"\] as const/)
  assert.match(compareServer, /SUPPORTED_AE_CITY_SLUGS/)
  for (const metric of metrics) assert.ok(compareServer.includes(`"${metric}"`), `missing ${metric}`)
  assert.match(profilePage, /robots: \{ index: true, follow: true \}/)
  assert.match(sitemap, /PUBLISHED_AE_CITY_SLUGS/)
  assert.doesNotMatch(sitemap, /type=city&country=AE/)
})

test("UAE evidence guards stay explicit in Compare", () => {
  assert.match(compareMatrix, /ranking_safe=false/)
  assert.match(compareMatrix, /Emirate-wide population is never substituted/)
  assert.match(compareMatrix, /no synthetic monthly normalization/)
  assert.match(compareMatrix, /no invented universal weekly-hour cap/)
  assert.match(compareMatrix, /does not score a winner/)
})

test("UAE read models remain server-only security-invoker views", () => {
  for (const view of ["city_directory_ae_v1", "city_institution_directory_ae_v1", "city_programme_directory_ae_v1"]) {
    assert.ok(readModels.includes(view), `missing ${view}`)
  }
  assert.match(readModels, /security_invoker=true/)
  assert.match(readModels, /revoke all on public\.city_directory_ae_v1 from public,anon,authenticated/)
  assert.match(readModels, /grant select on public\.city_directory_ae_v1 to service_role/)
  assert.match(metricsMigration, /city_metric_directory_ae_v1 with \(security_invoker=true\)/)
  assert.match(metricsMigration, /revoke all on public\.city_metric_directory_ae_v1 from public,anon,authenticated/)
  assert.match(metricsMigration, /grant select on public\.city_metric_directory_ae_v1 to service_role/)
  assert.match(metricsMigration, /m\.data_as_of::date/)
})
