import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const readRepoFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const foundation = readRepoFile(
  "supabase/migrations/20260808102500_uk_institution_foundation.sql",
)
const identityQa = readRepoFile(
  "supabase/migrations/20260808105000_uk_institution_identity_qa.sql",
)
const locationQa = readRepoFile(
  "supabase/migrations/20260808112000_uk_campus_location_quality.sql",
)
const explorerServer = readRepoFile("src/lib/institutions/institutions.server.ts")
const explorerSearch = readRepoFile("src/lib/institutions/institution-search.ts")
const detailServer = readRepoFile("src/lib/institutions/institution-detail.server.ts")
const detailUi = readRepoFile("src/app/(workspace)/institutions/institution-detail.tsx")
const countryPage = readRepoFile("src/app/(workspace)/institutions/[country]/page.tsx")
const detailPage = readRepoFile(
  "src/app/(workspace)/institutions/[country]/[institution]/page.tsx",
)
const ukSeo = readRepoFile("src/lib/institutions/institution-seo-uk.ts")
const sitemap = readRepoFile("src/app/sitemap.ts")

test("UK publication cohort keeps 50 source-backed institutions and current successor names", () => {
  assert.match(foundation, /Expected 50 existing UK provider identities/)
  assert.match(foundation, /City St George''s, University of London/)
  assert.match(foundation, /Brunel University of London/)
  assert.match(foundation, /institution_kind = 'university'/)
  assert.match(foundation, /ownership_type = null/)
})

test("UK identity QA assigns exactly 50 official 8-digit UKPRNs while preserving legacy joins", () => {
  const identityRows = identityQa.match(/\('[^']+', '\d{8}'\)/g) ?? []

  assert.equal(identityRows.length, 50)
  assert.match(identityQa, /'UK_UKPRN'/)
  assert.match(identityQa, /institution_identity_uk_v1/)
  assert.match(identityQa, /'10007788'/)
  assert.match(identityQa, /'10007774'/)
  assert.match(identityQa, /'10001478'/)
  assert.match(identityQa, /legacy_provider_id/)
  assert.match(identityQa, /Expected 185 active programmes/)
})

test("UK location policy preserves programme anchors and publishes only verified or safe fallback locations", () => {
  assert.match(locationQa, /record_scope' = 'legacy_offering_anchor'/)
  assert.match(locationQa, /Expected 50 UK legacy offering anchors/)
  assert.match(locationQa, /offering_count <> 185 or offering_anchor_count <> 185/)
  assert.match(locationQa, /location_quality' = 'verified_official'/)
  assert.match(locationQa, /verified_location_count <> 69 or verified_institution_count <> 19/)
  assert.match(locationQa, /institution_location_uk_v1/)
  assert.match(locationQa, /institution_explorer_uk_v1/)
  assert.match(locationQa, /institution_detail_uk_v1/)
  assert.match(locationQa, /without a display location/)
})

test("UK Explorer and Detail use UK-specific read models and fail closed without official identity", () => {
  assert.match(explorerServer, /institutionExplorerViewName\(countryCode\)/)
  assert.match(explorerSearch, /institution_explorer_uk_v1/)
  assert.match(detailServer, /institution_detail_uk_v1/)
  assert.match(detailServer, /institution_identity_uk_v1/)
  assert.match(detailServer, /missing its official UKPRN identity/)
})

test("UK Institution UI exposes UKPRN and uses location-safe wording", () => {
  assert.match(detailUi, />UKPRN</)
  assert.match(detailUi, /Open UKPRN provider source/)
  assert.match(detailUi, /Location records/)
  assert.match(detailUi, /Campuses & locations/)
  assert.match(detailUi, /rather than inventing a campus/)
  assert.match(countryPage, /countryCode === "AU" \? "campuses" : "locations"/)
  assert.match(detailPage, /countryCode === "AU" \? "campuses" : "locations"/)
})

test("UK Institution routes preserve canonical SEO and lowercase redirects", () => {
  assert.match(countryPage, /alternates: \{ canonical: `\/institutions\/\$\{countryCode\.toLowerCase\(\)\}` \}/)
  assert.match(countryPage, /robots: \{ index: true, follow: true \}/)
  assert.match(countryPage, /permanentRedirect\(`\/institutions\/\$\{countryCode\.toLowerCase\(\)\}`\)/)
  assert.match(detailPage, /alternates:/)
  assert.match(detailPage, /canonical: `\$\{SITE_URL\}\$\{canonicalPath\}`/)
  assert.match(detailPage, /permanentRedirect\(canonicalPath\)/)
})

test("UK explorer and all 50 institution detail routes are included in the canonical sitemap inventory", () => {
  const routes = ukSeo.match(/\["UK", "[a-z0-9-]+"\]/g) ?? []

  assert.equal(routes.length, 50)
  assert.match(ukSeo, /city-st-georges-university-of-london/)
  assert.match(ukSeo, /brunel-university-of-london/)
  assert.match(sitemap, /institutions\/uk/)
  assert.match(sitemap, /INDEXABLE_UK_INSTITUTION_PATHS/)
})
