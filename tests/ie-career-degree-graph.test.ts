import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import test from "node:test"

const migration = readFileSync(
  "supabase/migrations/20260912205454_ie_career_degree_graph_v1.sql",
  "utf8",
)
const readModel = readFileSync("src/lib/career-degree/read.ts", "utf8")
const contract = readFileSync("src/lib/career-degree/contract.ts", "utf8")
const careerRead = readFileSync("src/lib/workspace/career-market-read.ts", "utf8")
const careerCore = readFileSync("src/app/(workspace)/career/career-core-sections.tsx", "utf8")
const report = readFileSync("docs/data-foundation/ie-career-degree-graph-v1.md", "utf8")

const mvpCareers = [
  "software-developer",
  "cybersecurity-analyst",
  "data-engineer",
  "civil-engineer",
  "construction-manager",
  "radiographer",
] as const

const degreeConcepts = [
  "computer-science",
  "cybersecurity",
  "data-science",
  "civil-engineering",
  "construction-management",
  "diagnostic-radiography",
] as const

test("Ireland Career-Degree graph has durable canonical identities and relation metadata", () => {
  assert.match(migration, /create table if not exists taxonomy\.career_degree_relations/)
  assert.match(migration, /country_code text not null references core\.countries\(code\)/)
  assert.match(migration, /canonical_career_id text not null/)
  assert.match(migration, /degree_concept_id uuid not null references taxonomy\.study_concepts/)
  assert.match(migration, /relation_type text not null/)
  assert.match(migration, /directness text not null/)
  assert.match(migration, /relationship_strength text not null/)
  assert.match(migration, /rationale text not null/)
  assert.match(migration, /source_authority text not null/)
  assert.match(migration, /source_url text not null/)
  assert.match(migration, /reference_period text not null/)
  assert.match(migration, /source_checked_at date not null/)
  assert.match(migration, /unique \(country_code, canonical_career_id, degree_concept_id\)/)
})

test("Ireland MVP degree graph is limited to the six reviewed careers and six source-backed concepts", () => {
  for (const career of mvpCareers) assert.match(migration, new RegExp(`'${career}'`))
  for (const concept of degreeConcepts) assert.match(migration, new RegExp(`'${concept}'`))
  assert.match(migration, /degree_count<>6 or relation_count<>6 or invalid_relation_count<>0/i)
  assert.match(migration, /'data-engineer','data-science','related','adjacent','supporting'/)
  assert.doesNotMatch(migration, /'software-engineering'/)
})

test("the graph is server-only and does not weaken Ireland Programme publication", () => {
  assert.match(migration, /alter table taxonomy\.career_degree_relations enable row level security/)
  assert.match(migration, /revoke all on taxonomy\.career_degree_relations from public, anon, authenticated/)
  assert.match(migration, /grant select, insert, update, delete on taxonomy\.career_degree_relations to service_role/)
  assert.match(migration, /create or replace view public\.career_degree_relation_read_v1/)
  assert.match(migration, /with \(security_invoker=true\)/)
  assert.match(migration, /revoke all on public\.career_degree_relation_read_v1 from public, anon, authenticated/)
  assert.match(migration, /grant select on public\.career_degree_relation_read_v1 to service_role/)
  assert.doesNotMatch(migration, /program_explorer_ie_v1/)
  assert.doesNotMatch(migration, /program_detail_ie_v1/)
  assert.doesNotMatch(migration, /programme_concepts/)
  assert.equal(existsSync("src/app/(workspace)/programs/ie/[program]/page.tsx"), false)
  assert.match(careerCore, /Programme detail publication is still under verification/)
  assert.match(careerCore, /exact programme-level international-eligibility and offering evidence is verified/)
})

test("Career and Degree read models traverse the same relation in both directions", () => {
  assert.match(contract, /export type CareerDegreePath/)
  assert.match(contract, /export type DegreeCareerReadModel/)
  assert.match(readModel, /getCareerDegreePaths = cache\(loadCareerDegreePaths\)/)
  assert.match(readModel, /getDegreeCareerReadModel = cache\(loadDegreeCareerReadModel\)/)
  assert.match(readModel, /\.from\("career_degree_relation_read_v1"\)/)
  assert.match(careerRead, /getCareerDegreePaths\(country, careerId\)/)
  assert.match(careerCore, /Relevant degrees \/ study paths/)
})

test("the audit report records the current Tier A blocker without fabricating programme availability", () => {
  assert.match(report, /Tier A achieved: \*\*0\*\*/)
  assert.match(report, /Tier B remaining: \*\*28\*\*/)
  assert.match(report, /MVP-linked Tier B programme relations remaining: \*\*13\*\*/)
  assert.match(report, /exact_eligible_programme_evidence_required/)
  assert.match(report, /does not substitute for that evidence/)
})
