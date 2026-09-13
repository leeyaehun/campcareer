import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const routes = readFileSync("src/lib/cities/city-routes.ts", "utf8")
const profilePage = readFileSync("src/app/(workspace)/cities/ie/[city]/page.tsx", "utf8")
const profileServer = readFileSync("src/lib/cities/ie-city-profile.server.ts", "utf8")
const decisionConnections = readFileSync("src/lib/cities/ireland-city-decision-connections.server.ts", "utf8")
const dashboard = readFileSync("src/app/(workspace)/cities/ireland-city-dashboard.tsx", "utf8")
const compareServer = readFileSync("src/lib/cities/ie-city-comparison.server.ts", "utf8")
const comparePage = readFileSync("src/app/(workspace)/compare/page.tsx", "utf8")
const compareMatrix = readFileSync("src/app/(workspace)/compare/ireland-cities-compare-matrix.tsx", "utf8")
const sitemap = readFileSync("src/app/sitemap.ts", "utf8")
const foundationMigration = readFileSync("supabase/migrations/20260809092442_normalize_ie_tier_a_city_slugs_v1.sql", "utf8")
const linkageMigration = readFileSync("supabase/migrations/20260809093421_publish_ie_tier_a_city_linkage_v1.sql", "utf8")
const metricsMigration = readFileSync("supabase/migrations/20260809094322_publish_ie_tier_a_city_metrics_v1.sql", "utf8")

const published = ["dublin", "cork", "galway", "limerick"]
const deferred = ["maynooth", "waterford", "athlone", "sligo", "dundalk", "letterkenny"]
const requiredMetrics = [
  "city_population",
  "student_living_cost_monthly_range",
  "student_transport_reference",
  "student_work_hours_week",
  "employment_focus_sectors",
]

test("Phase 8 keeps Ireland publication bounded to the four approved Tier A cities", () => {
  assert.match(routes, /PUBLISHED_IE_CITY_SLUGS = \["dublin", "cork", "galway", "limerick"\] as const/)
  for (const slug of published) assert.ok(routes.includes(`"${slug}"`))
  for (const slug of deferred) {
    assert.doesNotMatch(routes, new RegExp(`PUBLISHED_IE_CITY_SLUGS = \\[.*"${slug}"`))
  }
  assert.ok(profilePage.includes("if (!isPublishedIeCitySlug(normalized)) notFound()"))
})

test("Phase 8 preserves geography normalization and keeps deferred cities untouched", () => {
  assert.ok(foundationMigration.includes("dublin_four_local_authorities"))
  assert.ok(foundationMigration.includes("cork_city"))
  assert.ok(foundationMigration.includes("galway_city"))
  assert.ok(foundationMigration.includes("limerick_urban"))
  assert.ok(foundationMigration.includes("expected 4 rows"))
  assert.ok(foundationMigration.includes("Ireland Tier B geographies were unexpectedly normalized"))
  assert.ok(foundationMigration.includes("phase_3_explicit_location_evidence_required"))
})

test("Phase 8 preserves official institution-location evidence and programme verification rules", () => {
  assert.ok(linkageMigration.includes("IE_HEA_RECOGNISED_ENTITY"))
  assert.ok(linkageMigration.includes("https://hea.ie/higher-education-institutions/"))
  assert.ok(linkageMigration.includes("'location_quality','verified_official'"))
  assert.ok(linkageMigration.includes("'programme_assignment_verified',false"))
  assert.ok(linkageMigration.includes("po.verification_status='verified'"))
  assert.ok(linkageMigration.includes("grant select on public.city_directory_ie_v1 to service_role"))
  assert.ok(linkageMigration.includes("grant select on public.city_institution_directory_ie_v1 to service_role"))
  assert.ok(linkageMigration.includes("grant select on public.city_programme_directory_ie_v1 to service_role"))
  assert.ok(profileServer.includes("Institution presence is never used to infer programme delivery"))
  assert.doesNotMatch(profileServer, /\.from\("city_programme_directory_ie_v1"\)/)
})

test("Phase 8 keeps exactly the five shared verified city metric contracts", () => {
  for (const key of requiredMetrics) {
    assert.ok(metricsMigration.includes(`'${key}'`))
    assert.ok(profileServer.includes(`"${key}"`))
    assert.ok(compareServer.includes(`"${key}"`))
  }
  assert.ok(metricsMigration.includes("n<>20"))
  assert.ok(metricsMigration.includes("'source_native_period',true"))
  assert.ok(metricsMigration.includes('"hours_term_time":20'))
  assert.ok(metricsMigration.includes('"hours_designated_holidays":40'))
  assert.ok(metricsMigration.includes('"context":"stamp_2_student_permission"'))
})

test("Phase 8 keeps profile and Compare on verified server-side read models", () => {
  assert.ok(profileServer.includes('.from("city_directory_ie_v1")'))
  assert.ok(profileServer.includes('.from("report_metric_evidence_city")'))
  assert.ok(profileServer.includes('.eq("review_status", "verified")'))
  assert.ok(decisionConnections.includes("getIrelandInstitutions()"))
  assert.doesNotMatch(profileServer, /\.from\("campuses"\)|\.from\("programmes"\)|\.from\("programme_offerings"\)/)
  assert.ok(compareServer.includes('.from("city_directory_ie_v1")'))
  assert.ok(compareServer.includes('.from("report_metric_evidence_city")'))
  assert.doesNotMatch(compareServer, /linkedProgramCount > 0/)
})

test("Phase 8 preserves programme pending disclosures and city-scope caveats", () => {
  assert.ok(dashboard.includes("verification pending rather than “0 programmes”"))
  assert.ok(compareMatrix.includes("verification pending rather than “0 programmes”"))
  assert.ok(dashboard.includes("Dublin City, Fingal, Dún Laoghaire-Rathdown and South Dublin"))
  assert.ok(compareMatrix.includes("four-local-authority study-market boundary"))
  assert.ok(compareMatrix.includes("TFI source-native fare periods are preserved"))
  assert.ok(compareMatrix.includes("20 hours per week during term and 40 hours during designated holiday periods"))
})

test("Phase 8 keeps Ireland city publication canonical and Compare noindex", () => {
  assert.ok(profilePage.includes("robots: { index: true, follow: true }"))
  assert.ok(profilePage.includes("robots: { index: false, follow: false }"))
  assert.ok(profilePage.includes("alternates: { canonical: `/cities/ie/${normalized}` }"))
  assert.ok(sitemap.includes("PUBLISHED_IE_CITY_SLUGS"))
  assert.ok(sitemap.includes("...PUBLISHED_IE_CITY_SLUGS.map"))
  assert.ok(sitemap.includes("/cities/ie/${slug}"))
  assert.ok(comparePage.includes('if (countryCode === "IE")'))
  assert.ok(comparePage.includes("getIeCityComparison"))
  assert.ok(comparePage.includes('robots: { index: false, follow: false }'))
  assert.ok(compareMatrix.includes('countryCode="IE"'))
  assert.ok(compareServer.includes('bySlug.get("dublin")'))
  assert.ok(compareServer.includes('bySlug.get("cork")'))
})
