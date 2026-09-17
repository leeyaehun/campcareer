import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const readRepoFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const identityMigration = readRepoFile(
  "supabase/migrations/20260808113500_ca_institution_identity_foundation.sql",
)
const locationMigration = readRepoFile(
  "supabase/migrations/20260808121000_ca_campus_location_quality.sql",
)
const acquisitionMigration = readRepoFile(
  "supabase/migrations/20260808173500_ca_institution_acquisition_expansion.sql",
)
const locationExpansionMigration = readRepoFile(
  "supabase/migrations/20260808180500_ca_institution_location_expansion.sql",
)
const programMigration = readRepoFile(
  "supabase/migrations/20260808183500_ca_program_catalog_canonicalization.sql",
)
const statusSyncMigration = readRepoFile(
  "supabase/migrations/20260808184512_ca_program_status_sync_after_phase3.sql",
)
const explorerServer = readRepoFile("src/lib/institutions/institutions.server.ts")
const explorerSearch = readRepoFile("src/lib/institutions/institution-search.ts")
const detailServer = readRepoFile("src/lib/institutions/institution-detail.server.ts")
const explorerUi = readRepoFile("src/app/(workspace)/institutions/institutions-explorer.tsx")
const canadianDetailUi = readRepoFile(
  "src/app/(workspace)/institutions/canadian-institution-detail.tsx",
)
const countryPage = readRepoFile("src/app/(workspace)/institutions/[country]/page.tsx")
const detailPage = readRepoFile(
  "src/app/(workspace)/institutions/[country]/[institution]/page.tsx",
)
const institutionSeo = readRepoFile("src/lib/institutions/institution-seo.ts")
const sitemap = readRepoFile("src/app/sitemap.ts")

test("Canadian foundation preserves the original 30-university DLI cohort as historical input", () => {
  const dliRows = identityMigration.match(/\('[^']+', 'O\d{11}'\)/g) ?? []

  assert.equal(dliRows.length, 60, "identity migration intentionally repeats the 30-row source block twice")
  assert.match(identityMigration, /Expected 30 CA_DLI identities/)
  assert.match(identityMigration, /Expected 165 active programmes/)
  assert.match(identityMigration, /institution_kind = 'university'/)
  assert.match(identityMigration, /ownership_type = 'public'/)
})

test("Canadian acquisition expands the data cohort to 62 institutions and maps all 49 program-catalog providers", () => {
  assert.match(acquisitionMigration, /Expected 62 active Canadian institutions after acquisition/)
  assert.match(acquisitionMigration, /Expected 49 deterministic Canada program-catalog institution identities/)
  assert.match(acquisitionMigration, /Expected 61 Canadian DLI identities after acquisition/)
  assert.match(acquisitionMigration, /Nunavut Arctic College must not receive a fabricated CA_DLI identity/)
  assert.match(acquisitionMigration, /Expected HTTPS official websites for all 32 acquired Canadian institutions/)
})

test("Canadian location publication covers the full 62-institution data cohort without inventing program campuses", () => {
  assert.match(locationMigration, /verified_location_count <> 60 or verified_institution_count <> 30/)
  assert.match(locationExpansionMigration, /v2_location_count<>55 or v2_institution_count<>32/)
  assert.match(locationExpansionMigration, /display_institution_count<>62 or preferred_total<>115/)
  assert.match(locationExpansionMigration, /attached_offering_count<>0/)
  assert.match(locationExpansionMigration, /institution_location_ca_v1/)
  assert.match(locationExpansionMigration, /institution_explorer_ca_v1/)
  assert.match(locationExpansionMigration, /institution_detail_ca_v1/)
})

test("Canadian program linkage canonicalizes 6638 source rows into 6634 programs across 49 institutions", () => {
  assert.match(programMigration, /canonical_count<>6634/)
  assert.match(programMigration, /source_count_sum<>6638/)
  assert.match(programMigration, /active_institution_count<>49/)
  assert.match(programMigration, /legacy_inactive_count<>165/)
  assert.match(statusSyncMigration, /Found % Canadian canonical programme statuses out of sync with staging/)
})

test("Canadian Detail exposes DLI when available and permits verified institutions without a fabricated DLI", () => {
  assert.match(detailServer, /institution_identity_ca_v1/)
  assert.match(detailServer, /dli_number,dli_source_url/)
  assert.doesNotMatch(detailServer, /Canadian institution .* is missing its official DLI identity/)
  assert.match(canadianDetailUi, /institution\.dliNumber \? \(/)
  assert.match(canadianDetailUi, />DLI number</)
  assert.match(canadianDetailUi, /Open IRCC DLI source/)
  assert.match(canadianDetailUi, /does not mean every program is eligible for a post-graduation work permit/)
})

test("Canadian Explorer and Detail use the Canada-specific read models and location-safe wording", () => {
  assert.match(explorerServer, /institutionExplorerViewName\(countryCode\)/)
  assert.match(explorerSearch, /institution_explorer_ca_v1/)
  assert.match(detailServer, /countryCode === "CA"/)
  assert.match(detailServer, /institution_detail_ca_v1/)
  assert.match(explorerUi, /countryCode !== "AU"/)
  assert.match(explorerUi, /"locations" : "campuses"/)
  assert.match(canadianDetailUi, />Location records</)
  assert.match(canadianDetailUi, />Study locations</)
  assert.match(countryPage, /countryCode === "AU" \? "campuses" : "locations"/)
  assert.match(detailPage, /countryCode === "AU" \? "campuses" : "locations"/)
})

test("Canadian canonical routing keeps lowercase redirects and country-specific detail rendering", () => {
  assert.match(countryPage, /alternates: \{ canonical: `\/institutions\/\$\{countryCode\.toLowerCase\(\)\}` \}/)
  assert.match(countryPage, /robots: \{ index: true, follow: true \}/)
  assert.match(countryPage, /permanentRedirect\(`\/institutions\/\$\{countryCode\.toLowerCase\(\)\}`\)/)
  assert.match(detailPage, /permanentRedirect\(canonicalPath\)/)
  assert.match(detailPage, /countryCode === "CA"/)
  assert.match(detailPage, /CanadianInstitutionDetailView/)
})

test("Canada keeps a curated 30-institution SEO cohort while the broader data cohort remains detail-readable", () => {
  const routes = institutionSeo.match(/\["CA", "[a-z0-9-]+"\]/g) ?? []

  assert.equal(routes.length, 30)
  assert.match(institutionSeo, /\["CA", "university-of-toronto"\]/)
  assert.match(institutionSeo, /\["CA", "university-of-british-columbia"\]/)
  assert.match(institutionSeo, /\["CA", "mcgill-university"\]/)
  assert.match(detailPage, /INDEXABLE_INSTITUTION_ROUTES/)
  assert.match(detailPage, /INDEXABLE_UK_INSTITUTION_ROUTES/)
  assert.match(detailPage, /index: isIndexableInstitutionRoute\(countryCode, detail\.slug\)/)
  assert.match(sitemap, /institutions\/ca/)
  assert.match(sitemap, /INDEXABLE_INSTITUTION_PATHS/)
})
