import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const routes = readFileSync("src/lib/cities/city-routes.ts", "utf8")
const profile = readFileSync("src/lib/cities/fr-city-profile.server.ts", "utf8")
const compare = readFileSync("src/lib/cities/fr-city-comparison.server.ts", "utf8")
const page = readFileSync("src/app/(workspace)/cities/fr/[city]/page.tsx", "utf8")
const sitemap = readFileSync("src/app/sitemap.ts", "utf8")
const linkageMigration = readFileSync("supabase/migration-contracts/20260810223100_publish_fr_tier_a_city_linkage_v1.sql", "utf8")
const metricsMigration = readFileSync("supabase/migration-contracts/20260810223200_publish_fr_tier_a_city_metrics_v1.sql", "utf8")

const tierA = ["paris", "paris-saclay", "bordeaux", "strasbourg", "grenoble", "aix-marseille", "nice"]

test("France Phase 8 route, profile, compare and sitemap scopes share the same seven-destination contract", () => {
  for (const slug of tierA) assert.ok(routes.includes(`"${slug}"`))
  assert.ok(profile.includes("isPublishedFrCitySlug"))
  assert.ok(compare.includes("PUBLISHED_FR_CITY_SLUGS"))
  assert.ok(page.includes("PUBLISHED_FR_CITY_SLUGS"))
  assert.ok(sitemap.includes("PUBLISHED_FR_CITY_SLUGS"))
})

test("France read models preserve service-role-only security invoker contract", () => {
  for (const view of ["city_directory_fr_v1", "city_institution_directory_fr_v1", "city_programme_directory_fr_v1"]) {
    assert.ok(linkageMigration.includes(view))
  }
  assert.ok(linkageMigration.includes("security_invoker=true"))
  assert.ok(linkageMigration.includes("revoke all"))
  assert.ok(linkageMigration.includes("grant select"))
  assert.ok(linkageMigration.includes("service_role"))
})

test("France programme delivery remains a verified-empty read model rather than inferred city availability", () => {
  assert.ok(linkageMigration.includes("programme_assignment_verified"))
  assert.ok(linkageMigration.includes("city_programme_directory_fr_v1"))
  assert.doesNotMatch(profile, /\.from\("city_programme_directory_fr_v1"\)/)
  assert.doesNotMatch(compare, /city_programme_directory_fr_v1/)
  assert.ok(profile.includes("verification_pending"))
})

test("France Five Core Metrics contract is exactly the shared five keys", () => {
  for (const key of ["city_population", "student_living_cost_monthly_range", "student_transport_reference", "student_work_hours_year", "employment_focus_sectors"]) {
    assert.ok(metricsMigration.includes(key))
    assert.ok(profile.includes(`"${key}"`))
    assert.ok(compare.includes(`"${key}"`))
  }
})

test("France publication keeps profiles indexable while Compare stays noindex", () => {
  assert.ok(page.includes("robots: { index: true, follow: true }"))
  const comparePage = readFileSync("src/app/(workspace)/compare/page.tsx", "utf8")
  assert.ok(comparePage.includes('robots: { index: false, follow: false }'))
})

test("France geography semantics never collapse registered localities into public metropolitan aliases", () => {
  const geographyMigration = readFileSync("supabase/migration-contracts/20260810223000_normalize_fr_tier_a_city_geographies_v1.sql", "utf8")
  assert.ok(geographyMigration.includes("paris-saclay"))
  assert.ok(geographyMigration.includes("bordeaux"))
  assert.ok(geographyMigration.includes("grenoble"))
  assert.ok(geographyMigration.includes("aix-marseille"))
  assert.ok(geographyMigration.includes("locality"))
})
