import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(path, "utf8")

const foundation = read("supabase/migrations/20260809173653_dk_program_staging_foundation.sql")
const canonical = read("supabase/migrations/20260809174147_dk_program_canonicalization_publication.sql")
const security = read("supabase/migrations/20260809174157_dk_program_publication_security_invoker.sql")
const server = read("src/lib/programs/dk-programs.server.ts")
const seo = read("src/lib/programs/dk-program-seo.ts")
const detail = read("src/app/(workspace)/programs/dk/[program]/page.tsx")
const explorer = read("src/app/(workspace)/programs/dk-programs-explorer.tsx")
const page = read("src/app/(workspace)/programs/page.tsx")
const header = read("src/app/(workspace)/programs/programs-header.tsx")
const sitemap = read("src/app/sitemap.ts")

test("Denmark staging remains private and separates programme, career and international evidence", () => {
  for (const table of ["program_catalog_dk_staging", "program_occupation_dk_staging", "program_international_dk_staging"]) {
    assert.match(foundation, new RegExp(`create table if not exists public\\.${table}`))
    assert.match(foundation, new RegExp(`alter table public\\.${table} enable row level security`))
    assert.match(foundation, new RegExp(`revoke all on public\\.${table} from public,anon,authenticated`))
  }
  assert.match(foundation, /international_admission_status/)
  assert.match(foundation, /eligible_schedule_unknown/)
  assert.match(foundation, /relation_type/)
})

test("Denmark canonical publication uses source identity and does not invent programme accreditation", () => {
  assert.match(canonical, /DK_STUDYINDENMARK_PROGRAM_KEY/)
  assert.match(canonical, /DK_STUDYINDENMARK/)
  assert.match(canonical, /program_explorer_dk_v1/)
  assert.match(canonical, /program_detail_dk_v1/)
  assert.doesNotMatch(canonical, /insert into catalog\.programme_accreditations/i)
  assert.match(canonical, /false as has_programme_accreditation_claim/)
  assert.match(canonical, /case x\.international_admission_status when 'open' then 'open' when 'closed' then 'closed' when 'not_yet_open' then 'planned'/)
})

test("Denmark publication views execute as invoker and remain service-role only", () => {
  assert.match(canonical, /security_invoker=true/)
  assert.match(security, /alter view public\.program_explorer_dk_v1 set \(security_invoker=true\)/)
  assert.match(security, /alter view public\.program_detail_dk_v1 set \(security_invoker=true\)/)
  assert.match(security, /revoke all on public\.program_explorer_dk_v1 from public,anon,authenticated/)
  assert.match(security, /grant select on public\.program_explorer_dk_v1 to service_role/)
})

test("Denmark server and UI separate programme existence from application state", () => {
  assert.match(server, /program_explorer_dk_v1/)
  assert.match(server, /program_detail_dk_v1/)
  assert.match(server, /international_admission_status/)
  assert.match(explorer, /English-taught pathway verified · current window unknown/)
  assert.match(detail, /Next cycle not yet open/)
  assert.match(detail, /Verified application cycle closed/)
  assert.match(detail, /International admission restricted/)
  assert.match(detail, /Institutional accreditation and quality assurance are not represented as programme-level accreditation claims/)
})

test("Denmark remains published in the shared Programs route and country picker", () => {
  assert.match(header, /PUBLISHED_PROGRAM_COUNTRIES/)
  assert.match(header, /"DK"/)
  assert.match(page, /searchDkPrograms/)
  assert.match(page, /DkProgramsExplorer/)
  assert.match(page, /filters\.country === "DK"/)
})

test("Denmark SEO keeps a curated 80-route Tier A cohort while the full catalogue remains accessible", () => {
  const matches = [...seo.matchAll(/^\s*"([^\"]+)",$/gm)].map((match) => match[1])
  assert.equal(matches.length, 80)
  assert.equal(new Set(matches).size, 80)
  assert.ok(matches.includes("aalborg-universitet-software-msc-in-engineering-master"))
  assert.ok(matches.includes("danmarks-tekniske-universitet-computer-science-and-engineering-master"))
  assert.ok(matches.includes("it-universitetet-i-kobenhavn-computer-science-master"))
  assert.ok(matches.includes("roskilde-universitet-computer-science-master"))
  assert.ok(!matches.includes("aarhus-universitet-agrobiology-master"))
  assert.ok(!matches.includes("kobenhavns-universitet-economics-master"))
  assert.match(sitemap, /INDEXABLE_DK_PROGRAM_PATHS/)
})
