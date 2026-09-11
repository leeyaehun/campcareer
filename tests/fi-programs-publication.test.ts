import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(path, "utf8")

const foundation = read("supabase/migration-contracts/20260809160000_fi_program_staging_foundation.sql")
const canonical = read("supabase/migration-contracts/20260809160500_fi_program_canonicalization_publication.sql")
const security = read("supabase/migration-contracts/20260809161000_fi_program_publication_security_invoker.sql")
const server = read("src/lib/programs/fi-programs.server.ts")
const seo = read("src/lib/programs/fi-program-seo.ts")
const detail = read("src/app/(workspace)/programs/fi/[program]/page.tsx")
const explorer = read("src/app/(workspace)/programs/fi-programs-explorer.tsx")
const page = read("src/app/(workspace)/programs/page.tsx")
const header = read("src/app/(workspace)/programs/programs-header.tsx")
const sitemap = read("src/app/sitemap.ts")

test("Finland staging remains private and separates programme, career and international evidence", () => {
  for (const table of ["program_catalog_fi_staging", "program_occupation_fi_staging", "program_international_fi_staging"]) {
    assert.match(foundation, new RegExp(`create table if not exists public\\.${table}`))
    assert.match(foundation, new RegExp(`alter table public\\.${table} enable row level security`))
    assert.match(foundation, new RegExp(`revoke all on public\\.${table} from public,anon,authenticated`))
  }
  assert.match(foundation, /international_admission_status/)
  assert.match(foundation, /eligible_schedule_unknown/)
  assert.match(foundation, /relation_type/)
})

test("Finland canonical publication uses source identity and does not invent programme accreditation", () => {
  assert.match(canonical, /FI_OFFICIAL_PROGRAM_KEY/)
  assert.match(canonical, /FI_OFFICIAL/)
  assert.match(canonical, /program_explorer_fi_v1/)
  assert.match(canonical, /program_detail_fi_v1/)
  assert.doesNotMatch(canonical, /insert into catalog\.programme_accreditations/i)
  assert.match(canonical, /false as has_programme_accreditation_claim/)
  assert.match(canonical, /case x\.international_admission_status when 'open' then 'open' when 'closed' then 'closed' when 'not_yet_open' then 'planned'/)
})

test("Finland publication views execute as invoker and remain service-role only", () => {
  assert.match(canonical, /security_invoker=true/)
  assert.match(security, /alter view public\.program_explorer_fi_v1 set \(security_invoker=true\)/)
  assert.match(security, /alter view public\.program_detail_fi_v1 set \(security_invoker=true\)/)
  assert.match(security, /revoke all on public\.program_explorer_fi_v1 from public,anon,authenticated/)
  assert.match(security, /grant select on public\.program_explorer_fi_v1 to service_role/)
})

test("Finland server and UI separate programme existence from application state", () => {
  assert.match(server, /program_explorer_fi_v1/)
  assert.match(server, /program_detail_fi_v1/)
  assert.match(server, /international_admission_status/)
  assert.match(explorer, /Next cycle not yet open/)
  assert.match(detail, /A future admission window is officially published, but applications are not open today/)
  assert.match(detail, /Institutional FINEEC quality audits are not converted into programme-level accreditation claims/)
  assert.match(detail, /Verified application cycle closed/)
  assert.match(detail, /International admission restricted/)
})

test("Finland remains published in the shared Programs route and country picker", () => {
  assert.match(header, /PUBLISHED_PROGRAM_COUNTRIES/)
  assert.match(header, /"FI"/)
  assert.match(page, /searchFiPrograms/)
  assert.match(page, /FiProgramsExplorer/)
  assert.match(page, /filters\.country === "FI"/)
})

test("Finland SEO indexes 314 non-closed programme routes and excludes verified-closed cohorts", () => {
  const matches = [...seo.matchAll(/^"([^\"]+)",$/gm)].map((match) => match[1])
  assert.equal(matches.length, 314)
  assert.equal(new Set(matches).size, 314)
  assert.ok(matches.includes("aalto-university-computer-science-master"))
  assert.ok(matches.includes("university-of-turku-information-and-communication-technology-cyber-security-master"))
  assert.ok(!matches.includes("tampere-university-geotechnical-engineering-master"))
  assert.ok(!matches.includes("abo-akademi-university-advanced-practice-nursing-master"))
  assert.ok(!matches.includes("hanken-school-of-economics-accounting-master"))
  assert.match(sitemap, /INDEXABLE_FI_PROGRAM_PATHS/)
})
