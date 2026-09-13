import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const routes = readFileSync("src/lib/cities/city-routes.ts", "utf8")
const profile = readFileSync("src/lib/cities/ie-city-profile.server.ts", "utf8")
const decisionConnections = readFileSync("src/lib/cities/ireland-city-decision-connections.server.ts", "utf8")
const page = readFileSync("src/app/(workspace)/cities/ie/[city]/page.tsx", "utf8")
const dashboard = readFileSync("src/app/(workspace)/cities/ireland-city-dashboard.tsx", "utf8")

const published = ["dublin", "cork", "galway", "limerick"]
const deferred = ["maynooth", "waterford", "athlone", "sligo", "dundalk", "letterkenny"]

test("Ireland city profile scope is exactly the approved four Tier A cities", () => {
  assert.match(routes, /PUBLISHED_IE_CITY_SLUGS = \["dublin", "cork", "galway", "limerick"\] as const/)
  for (const slug of published) assert.ok(routes.includes(`"${slug}"`))
  for (const slug of deferred) {
    assert.doesNotMatch(routes, new RegExp(`PUBLISHED_IE_CITY_SLUGS = \\[.*"${slug}"`))
  }
  assert.ok(routes.includes("isPublishedIeCitySlug"))
  assert.ok(routes.includes("ieCityPath"))
  assert.ok(routes.includes("/cities/ie/${slug}"))
})

test("Ireland profile reads city metadata and verified metrics, with institution linkage in the strict P1.3 reader", () => {
  assert.ok(profile.includes('.from("city_directory_ie_v1")'))
  assert.ok(profile.includes('.from("report_metric_evidence_city")'))
  assert.ok(profile.includes('.eq("review_status", "verified")'))
  assert.ok(decisionConnections.includes('getIrelandInstitutions()'))
  assert.doesNotMatch(profile, /\.from\("city_programme_directory_ie_v1"\)/)
  assert.doesNotMatch(profile, /\.from\("city_institution_directory_ie_v1"\)/)
  assert.doesNotMatch(profile, /\.from\("campuses"\)|\.from\("programmes"\)|\.from\("programme_offerings"\)/)
})

test("Ireland profile requires the five shared city metrics", () => {
  for (const key of [
    "city_population",
    "student_living_cost_monthly_range",
    "student_transport_reference",
    "student_work_hours_week",
    "employment_focus_sectors",
  ]) assert.ok(profile.includes(`"${key}"`))
})

test("Ireland institution presentation preserves HEA and official location evidence", () => {
  assert.ok(decisionConnections.includes("getIrelandInstitutions"))
  assert.ok(dashboard.includes("initial verified HEA-recognised institution set"))
  assert.ok(dashboard.includes("official institution website and explicit official location evidence"))
  assert.ok(dashboard.includes("HEA source"))
})

test("Ireland programme gap is explicit and institution presence never becomes programme delivery", () => {
  assert.ok(profile.includes("Institution presence is never used to infer programme delivery"))
  assert.ok(dashboard.includes("verification pending rather than “0 programmes”"))
  assert.ok(dashboard.includes("programme-offering-to-campus evidence"))
})

test("Ireland work-rights copy keeps Stamp 2 conditions and both hour limits", () => {
  assert.ok(profile.includes("hours_term_time"))
  assert.ok(profile.includes("hours_designated_holidays"))
  assert.ok(profile.includes("stamp_2_student_permission"))
  assert.ok(dashboard.includes("hoursTermTime"))
  assert.ok(dashboard.includes("hoursDesignatedHolidays"))
  assert.ok(dashboard.includes("hours per week during term"))
  assert.ok(dashboard.includes("hours per week during designated holiday periods"))
  assert.ok(dashboard.includes("immigration permission"))
})

test("Dublin scope remains the four-local-authority study market", () => {
  assert.ok(profile.includes('case "dublin_four_local_authorities"'))
  assert.ok(dashboard.includes("Dublin City, Fingal, Dún Laoghaire-Rathdown and South Dublin"))
  assert.ok(dashboard.includes("Campus membership still requires verified official location evidence"))
})

test("Phase 7 Ireland profiles are published while linking to City Compare", () => {
  assert.ok(page.includes("generateStaticParams"))
  assert.ok(page.includes("PUBLISHED_IE_CITY_SLUGS"))
  assert.ok(page.includes("robots: { index: true, follow: true }"))
  assert.ok(page.includes("robots: { index: false, follow: false }"))
  assert.ok(page.includes("/cities/ie/${normalized}"))
  assert.ok(dashboard.includes('buildCityCompareCanonicalHref({ country: "IE", left: profile.slug })'))
  assert.ok(dashboard.includes("Compare {profile.name}"))
})
