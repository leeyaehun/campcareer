import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(path, "utf8")

const foundation = read("supabase/migration-contracts/20260809152000_no_program_staging_foundation.sql")
const canonical = read("supabase/migration-contracts/20260809152500_no_program_canonicalization_publication.sql")
const security = read("supabase/migration-contracts/20260809153000_no_program_publication_security_invoker.sql")
const server = read("src/lib/programs/no-programs.server.ts")
const seo = read("src/lib/programs/no-program-seo.ts")
const detail = read("src/app/(workspace)/programs/no/[program]/page.tsx")
const explorer = read("src/app/(workspace)/programs/no-programs-explorer.tsx")
const page = read("src/app/(workspace)/programs/page.tsx")
const header = read("src/app/(workspace)/programs/programs-header.tsx")
const sitemap = read("src/app/sitemap.ts")

test("Norway staging stays private and separates programme, career and admission evidence", () => {
  for (const table of ["program_catalog_no_staging", "program_occupation_no_staging", "program_international_no_staging"]) {
    assert.match(foundation, new RegExp(`create table if not exists public\\.${table}`))
    assert.match(foundation, new RegExp(`alter table public\\.${table} enable row level security`))
    assert.match(foundation, new RegExp(`revoke all on public\\.${table} from public,anon,authenticated`))
  }
  assert.match(foundation, /authority_program_url/)
  assert.match(foundation, /eligible_schedule_unknown/)
  assert.match(foundation, /relation_type/)
})

test("Norway canonical publication uses HK-dir source identity and does not invent NOKUT programme accreditation", () => {
  assert.match(canonical, /NO_STUDYINNORWAY_PROGRAM_KEY/)
  assert.match(canonical, /NO_STUDYINNORWAY/)
  assert.match(canonical, /program_explorer_no_v1/)
  assert.match(canonical, /program_detail_no_v1/)
  assert.doesNotMatch(canonical, /insert into catalog\.programme_accreditations/i)
  assert.match(canonical, /false as has_programme_accreditation_claim/)
  assert.match(canonical, /institutional accreditation\/self-accrediting authority is not represented as a programme-level NOKUT accreditation claim/)
})

test("Norway publication views execute as invoker and remain service-role only", () => {
  assert.match(canonical, /security_invoker=true/)
  assert.match(security, /alter view public\.program_explorer_no_v1 set \(security_invoker=true\)/)
  assert.match(security, /alter view public\.program_detail_no_v1 set \(security_invoker=true\)/)
  assert.match(security, /revoke all on public\.program_explorer_no_v1 from public,anon,authenticated/)
  assert.match(security, /grant select on public\.program_explorer_no_v1 to service_role/)
})

test("Norway server and UI keep programme existence separate from the current application window", () => {
  assert.match(server, /program_explorer_no_v1/)
  assert.match(server, /program_detail_no_v1/)
  assert.match(server, /international_admission_status/)
  assert.match(explorer, /English-taught pathway verified · current window unknown/)
  assert.match(detail, /HK-dir lists this programme as taught in English, but CampCareer has not inferred that applications are open today/)
  assert.match(detail, /institutional accreditation or self-accrediting authority into a programme-level NOKUT accreditation claim/)
  assert.match(detail, /International admission restricted/)
})

test("Norway remains published in the shared Programs route", () => {
  assert.match(header, /PUBLISHED_PROGRAM_COUNTRIES/)
  assert.match(header, /"NO"/)
  assert.match(page, /searchNoPrograms/)
  assert.match(page, /NoProgramsExplorer/)
  assert.match(page, /filters\.country === "NO"/)
})

test("Norway SEO indexes 139 non-closed Tier A routes and excludes the verified closed UiA route", () => {
  const block = seo.match(/const INDEXABLE_NO_PROGRAM_SLUGS = `([\s\S]*?)`\.trim\(\)\.split/)?.[1]
  assert.ok(block)
  const slugs = block.trim().split("\n").map((value) => value.trim()).filter(Boolean)
  assert.equal(slugs.length, 139)
  assert.equal(new Set(slugs).size, 139)
  assert.ok(slugs.includes("university-of-agder-master-s-programme-in-cybersecurity-engineering"))
  assert.ok(!slugs.includes("university-of-agder-multimedia-and-game-technologies-master-s-programme"))
  assert.match(sitemap, /INDEXABLE_NO_PROGRAM_PATHS/)
})
