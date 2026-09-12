import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const baseMigration = readFileSync("supabase/migrations/20260812113315_career_data_foundation_us_carpenter.sql", "utf8")
const methodologyMigration = readFileSync("supabase/migrations/20260812153156_career_data_foundation_methodology_v1.sql", "utf8")
const finalizedGrowthMigration = readFileSync("supabase/migrations/20260813015855_finalize_career_opportunity_growth_methodology_v1.sql", "utf8")
const migrations = `${baseMigration}\n${methodologyMigration}\n${finalizedGrowthMigration}`
const readModel = readFileSync("src/lib/workspace/career-market-read.ts", "utf8")
const foundationRead = readFileSync("src/lib/career-data-foundation/read.ts", "utf8")

test("foundation keeps raw, normalized, component and snapshot data in separate layers", () => {
  for (const table of [
    "career_raw_observations",
    "career_normalized_metrics",
    "career_score_components",
    "career_opportunity_score_snapshots",
  ]) {
    assert.match(migrations, new RegExp(`create table (if not exists )?public\\.${table}`))
  }
})

test("missing raw data is nullable with unavailable reason enforcement", () => {
  assert.match(baseMigration, /raw_value jsonb/)
  assert.match(baseMigration, /availability = 'unavailable' and raw_value is null/)
  assert.match(baseMigration, /btrim\(coalesce\(reason, ''\)\) <> ''/)
  assert.match(methodologyMigration, /'no_evidence_found'/)
})

test("proxy observations cannot omit their reason", () => {
  assert.match(baseMigration, /directness <> 'proxy' or btrim\(coalesce\(proxy_reason, ''\)\) <> ''/)
  assert.match(methodologyMigration, /CampCareer converts official typical-entry categories/)
})

test("score values and final score remain calculated rather than manually stored", () => {
  assert.match(baseMigration, /score_value numeric generated always as/)
  assert.match(baseMigration, /case when e\.score_ready then round\(e\.score_sum,2\) else null::numeric end as opportunity_score/)
  assert.doesNotMatch(migrations, /opportunity_score\s+numeric\s+not null/i)
  assert.match(finalizedGrowthMigration, /career-opportunity-v4-foundation/)
})

test("only US Carpenter is seeded into the finalized foundation methodology", () => {
  assert.match(finalizedGrowthMigration, /'US:carpenter:2026-08-13:v4'/)
  assert.doesNotMatch(finalizedGrowthMigration, /AU:registered-nurse/)
  assert.doesNotMatch(finalizedGrowthMigration, /AU:carpenter/)
})

test("canonical mapping remains exact SOC 47-2031 with exact O*NET companion mapping", () => {
  assert.match(baseMigration, /'SOC','2018','47-2031','Carpenters','exact','high'/)
  assert.match(baseMigration, /'O\*NET-SOC','2026','47-2031\.00','Carpenters','exact','high'/)
})

test("methodology v1 promotes relational lineage to source of truth", () => {
  for (const table of [
    "career_normalized_metric_inputs",
    "career_score_component_metric_inputs",
    "career_score_component_raw_inputs",
  ]) {
    assert.match(methodologyMigration, new RegExp(`create table if not exists public\\.${table}`))
  }
  assert.match(methodologyMigration, /input_role text not null/)
  assert.match(methodologyMigration, /references public\.career_raw_observations\(observation_key\)/)
  assert.match(methodologyMigration, /references public\.career_normalized_metrics\(normalized_metric_key\)/)
})

test("methodology stores evidence status so conservative zero is not confused with confirmed zero", () => {
  assert.match(methodologyMigration, /evidence_status text not null default 'direct_verified'/)
  assert.match(methodologyMigration, /'no_evidence_found'/)
  assert.match(methodologyMigration, /'confirmed_not_shortage'/)
  assert.match(methodologyMigration, /'insufficient_industry_coverage'/)
  assert.match(methodologyMigration, /'fallback'/)
})

test("subnational licensing evidence separates employee and contractor requirements", () => {
  assert.match(methodologyMigration, /create table if not exists public\.career_foundation_licensing_evidence/)
  assert.match(methodologyMigration, /applies_to text not null/)
  assert.match(methodologyMigration, /'contractor_license'/)
  assert.match(methodologyMigration, /'US:carpenter:CA:C5-contractor'/)
  assert.match(methodologyMigration, /'US:carpenter:NYC:HIC-contractor'/)
  assert.match(methodologyMigration, /contractor\/business rules are stored separately/i)
})

test("visa accessibility stores a primary H-2B route and secondary PERM route without additive route counting", () => {
  assert.match(methodologyMigration, /create table if not exists public\.career_foundation_visa_pathways/)
  assert.match(methodologyMigration, /'US:carpenter:H2B'/)
  assert.match(methodologyMigration, /'US:carpenter:PERM'/)
  assert.match(methodologyMigration, /used_for_primary_score boolean/)
})

test("vacancy scoring evidence is separate from live job opportunities", () => {
  assert.match(methodologyMigration, /clean_distinct_90_day_numerator',false/)
  assert.match(methodologyMigration, /create table if not exists public\.career_foundation_job_opportunities/)
  assert.match(methodologyMigration, /'Trades Specialist - Carpenter'/)
  assert.match(methodologyMigration, /'Carpenter I - Oahu'/)
  assert.match(methodologyMigration, /not itself the Vacancy Score numerator/)
})

test("entry accessibility treats paid employment-linked apprenticeship differently from unpaid pre-employment study", () => {
  assert.match(methodologyMigration, /'us-carpenter-apprenticeship-paid-training'/)
  assert.match(methodologyMigration, /paid employment-linked apprenticeship = 4/i)
  assert.match(methodologyMigration, /14,'career-opportunity-v3-foundation'/)
})

test("final 30-point methodology uses actual momentum, relative wage and projected CAGR", () => {
  assert.match(finalizedGrowthMigration, /'us-bls-cps-aa-2020'/)
  assert.match(finalizedGrowthMigration, /'us-bls-cps-aa-2025'/)
  assert.match(finalizedGrowthMigration, /employment_momentum_excess_cagr_pp_v1/)
  assert.match(finalizedGrowthMigration, /projected_growth_excess_cagr_pp_v1/)
  assert.match(finalizedGrowthMigration, /p_normalized_value \* 2\.5/)
  assert.match(finalizedGrowthMigration, /Relative salary remains unchanged/)
})

test("rank read model can include the final methodology-v1 foundation profile", () => {
  assert.match(baseMigration, /where score_ready=true and publish_ready=true and opportunity_score is not null/)
  assert.match(finalizedGrowthMigration, /'US:carpenter:2026-08-13:v4'/)
})

test("career insight exposes foundation data only after the explicit public Ready gate", () => {
  assert.match(readModel, /const foundationHasPublicScore/)
  assert.match(readModel, /if \(foundation && foundationHasPublicScore\(foundation\)\)/)
  assert.match(readModel, /const campCareerScore = isCareerScoreReady\(profile\.country_code, careerId\) \? scoreCandidate : null/)
  assert.match(readModel, /if \(!isCareerScoreReady\(foundation\.countryCode, careerId\)\) continue/)
  assert.match(readModel, /if \(!foundation\.strictPublicScoreEvidence\) continue/)
  assert.doesNotMatch(readModel, /if \(byCountry\.has\(foundation\.countryCode\)\) continue/)
  assert.match(readModel, /if \(!profile && foundation\) \{[\s\S]*?profile: null,[\s\S]*?readModelSource: "editorial_only"/)
})

test("foundation compatibility profile keeps unavailable legacy metrics null and exposes only the public CampCareer Score", () => {
  assert.match(readModel, /vacanciesThreeMonthAvg: null/)
  assert.match(readModel, /employmentGrowth5yPct: null/)
  assert.match(readModel, /opportunityScore: foundation\.campCareerScore\?\.total \?\? null/)
  assert.match(readModel, /campCareerScore: foundation\.campCareerScore/)
  assert.match(readModel, /internalOpportunityScore: foundation\.opportunityScore/)
  assert.match(readModel, /scoreStatus: "foundation_ready"/)
})

test("foundation API read returns provenance, relational lineage, regulation, visa and live opportunities", () => {
  for (const table of [
    "career_raw_observations",
    "career_normalized_metrics",
    "career_score_components",
    "career_normalized_metric_inputs",
    "career_score_component_metric_inputs",
    "career_score_component_raw_inputs",
    "career_foundation_licensing_evidence",
    "career_foundation_visa_pathways",
    "career_foundation_job_opportunities",
    "career_foundation_blockers",
    "career_foundation_entry_points",
    "career_official_sources",
  ]) {
    assert.ok(foundationRead.includes(`.from("${table}")`), `missing foundation read for ${table}`)
  }
  assert.match(foundationRead, /scoreConfidence/)
  assert.match(foundationRead, /evidenceStatus/)
})
