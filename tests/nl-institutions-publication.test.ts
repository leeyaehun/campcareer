import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const readRepoFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const readModels = readRepoFile(
  "supabase/migrations/20260808213500_nl_publication_read_models.sql",
)
const search = readRepoFile("src/lib/institutions/institution-search.ts")
const explorerServer = readRepoFile("src/lib/institutions/institutions.server.ts")
const detailServer = readRepoFile("src/lib/institutions/institution-detail.server.ts")
const detailPage = readRepoFile(
  "src/app/(workspace)/institutions/[country]/[institution]/page.tsx",
)
const nlDetail = readRepoFile(
  "src/app/(workspace)/institutions/netherlands-institution-detail.tsx",
)
const nlSeo = readRepoFile("src/lib/institutions/institution-seo-nl.ts")
const sitemap = readRepoFile("src/app/sitemap.ts")

test("NL is enabled as an Institution country with dedicated read models", () => {
  assert.match(search, /INSTITUTION_MVP_COUNTRIES/)
  assert.match(search, /"NL"/)
  assert.match(explorerServer, /institutionExplorerViewName\(countryCode\)/)
  assert.match(search, /institution_explorer_nl_v1/)
  assert.match(detailServer, /institution_detail_nl_v1/)
  assert.match(readModels, /Expected 13 NL explorer rows/)
  assert.match(readModels, /Expected 13 NL detail rows/)
})

test("NL detail fails closed without official BRIN identity", () => {
  assert.match(detailServer, /institution_identity_nl_v1/)
  assert.match(detailServer, /brin_code,brin_source_url/)
  assert.match(detailServer, /missing its official BRIN identity/)
  assert.match(nlDetail, /BRIN institution code/)
  assert.match(nlDetail, /Open DUO RIO institution source/)
})

test("NL publication does not treat an empty CampCareer programme catalogue as no programmes offered", () => {
  assert.match(nlDetail, /Program catalogue/)
  assert.match(nlDetail, /This does not mean the institution offers no programs/)
  assert.match(nlDetail, /official RIO program pipeline is prepared/)
  assert.match(readModels, /Programme aggregates therefore remain canonical/)
})

test("NL detail route uses its dedicated component and canonical SEO allowlist", () => {
  assert.match(detailPage, /NetherlandsInstitutionDetailView/)
  assert.match(detailPage, /INDEXABLE_NL_INSTITUTION_ROUTES/)
  assert.match(detailPage, /countryCode === "NL"/)

  const routes = nlSeo.match(/\["NL", "[a-z0-9-]+"\]/g) ?? []
  assert.equal(routes.length, 13)
  assert.match(nlSeo, /delft-university-of-technology/)
  assert.match(nlSeo, /wageningen-university-and-research/)
})

test("NL explorer and all 13 institution routes are included in sitemap inventory", () => {
  assert.match(sitemap, /institutions\/nl/)
  assert.match(sitemap, /INDEXABLE_NL_INSTITUTION_PATHS/)
})
