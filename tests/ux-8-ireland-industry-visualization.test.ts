import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  getIrelandEmploymentSectorsSorted,
  IRELAND_EMPLOYMENT_SECTORS,
  IRELAND_EMPLOYMENT_SECTOR_SOURCE,
} from "../src/data/ireland-employment-sectors"
import {
  assertIrelandEmploymentEcosystem,
  IRELAND_EMPLOYMENT_ECOSYSTEM,
} from "../src/lib/employment/ireland-employment-ecosystem-data"
import { IE_CAREER_COMPARE_IDS } from "../src/lib/ireland-career-comparison"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const chart = read("src/app/(workspace)/countries/ireland-employment-sector-chart.tsx")
const chartData = read("src/data/ireland-employment-sectors.ts")
const ecosystemSection = read("src/app/(workspace)/countries/ireland-employment-ecosystem-section.tsx")
const dashboard = read("src/app/(workspace)/countries/ireland-country-dashboard.tsx")
const changedSources = [chart, chartData, ecosystemSection, dashboard]
const allChanged = changedSources.join("\n")

const OFFICIAL_SORTED = [
  ["Health & social work", 382_500],
  ["Industry", 332_300],
  ["Wholesale & retail", 326_500],
  ["Education", 239_800],
  ["Professional services", 198_500],
  ["Accommodation & food", 184_400],
  ["ICT", 182_900],
  ["Construction", 176_000],
  ["PAD", 151_400],
  ["Finance", 141_500],
  ["Other NACE activities", 124_400],
  ["Transport", 121_800],
  ["Agriculture", 107_700],
  ["Administrative & support", 100_100],
] as const

test("1. UX-8 dataset exists outside JSX as a typed static/sever data module", () => {
  assert.deepEqual(
    IRELAND_EMPLOYMENT_SECTORS.map((sector) => sector.id),
    [
      "health-social-work",
      "industry",
      "wholesale-retail",
      "education",
      "professional-services",
      "accommodation-food",
      "ict",
      "construction",
      "pad",
      "finance",
      "other-nace-activities",
      "transport",
      "agriculture",
      "administrative-support",
    ],
  )
  assert.ok(chartData.includes("IRELAND_EMPLOYMENT_SECTORS"), "cohort lives in the typed data module")
  assert.ok(chart.includes('from "@/data/ireland-employment-sectors"'), "chart reads the data module, not JSX literals")
  assert.ok(chart.includes("sector.employmentCount"), "bar values come from the dataset")
  assert.doesNotMatch(chart, /\d_\d/, "no underscore numeric literals may be hardcoded in the chart JSX")
})

test("2. UX-8 source, reference period and unit are explicit with an official URL", () => {
  const source = IRELAND_EMPLOYMENT_SECTOR_SOURCE
  assert.equal(source.authority, "SOLAS Skills and Labour Market Research Unit")
  assert.equal(source.title, "National Skills Bulletin 2025")
  assert.match(source.dataset, /Figure 3\.1/)
  assert.match(source.dataset, /Q4 2024|Quarter 4 2024/i)
  assert.equal(source.referencePeriod, "Q4 2024")
  assert.equal(source.unit, "persons")
  assert.equal(source.sourceUnit, "thousand persons")
  assert.match(source.url, /^https:\/\/www\.solas\.ie\//)
  assert.match(source.checkedAt, /^2026-\d{2}-\d{2}$/)
  assert.ok(source.methodology.length > 0)
})

test("3. UX-8 uses the complete official SOLAS broad-sector cohort", () => {
  assert.equal(IRELAND_EMPLOYMENT_SECTORS.length, 14)
  assert.deepEqual(
    new Set(IRELAND_EMPLOYMENT_SECTORS.map((sector) => sector.id)).size,
    IRELAND_EMPLOYMENT_SECTORS.length,
    "sector ids are unique",
  )
  assert.deepEqual(
    new Set(IRELAND_EMPLOYMENT_SECTORS.map((sector) => sector.officialLabel)).size,
    IRELAND_EMPLOYMENT_SECTORS.length,
    "official labels are unique",
  )
  assert.deepEqual(
    IRELAND_EMPLOYMENT_SECTORS.map((sector) => sector.officialLabel),
    [
      "Health & social work",
      "Industry",
      "Wholesale & retail",
      "Education",
      "Professional services",
      "Accommodation & food",
      "ICT",
      "Construction",
      "PAD",
      "Finance",
      "Other NACE activities",
      "Transport",
      "Agriculture",
      "Administrative & support",
    ],
    "labels match the official table exactly",
  )
})

test("4. UX-8 observations are positive, share the same source/period, and use counts, not invented shares", () => {
  assert.ok(IRELAND_EMPLOYMENT_SECTORS.every((sector) => sector.employmentCount > 0), "all employment counts are positive")
  assert.ok(IRELAND_EMPLOYMENT_SECTORS.every((sector) => sector.source === IRELAND_EMPLOYMENT_SECTOR_SOURCE), "single shared source")
  assert.ok(IRELAND_EMPLOYMENT_SECTORS.every((sector) => sector.source.referencePeriod === "Q4 2024"), "single reference period")
  assert.ok(IRELAND_EMPLOYMENT_SECTORS.every((sector) => sector.source.unit === "persons"), "display unit is persons everywhere")
  assert.doesNotMatch(chartData, /share|percentage|percent|proportion|shareOfTotal/i, "no invented percentage/share fields")
})

test("5. UX-8 sorting is deterministic, by size, with a stable label tie-breaker", () => {
  const sorted = getIrelandEmploymentSectorsSorted()
  const again = getIrelandEmploymentSectorsSorted()
  assert.deepEqual(sorted, again, "sorting is deterministic across calls")
  for (let i = 1; i < sorted.length; i += 1) {
    const previous = sorted[i - 1]
    const current = sorted[i]
    const ok =
      current.employmentCount < previous.employmentCount ||
      (current.employmentCount === previous.employmentCount && current.officialLabel >= previous.officialLabel)
    assert.ok(ok, `order at position ${i} is size-descending with stable tie-break`)
  }
})

test("6. UX-8 exact values pin to the official table (thousands converted to persons)", () => {
  const sorted = getIrelandEmploymentSectorsSorted()
  assert.deepEqual(
    sorted.map((sector) => [sector.officialLabel, sector.employmentCount]),
    OFFICIAL_SORTED.map(([label, count]) => [label, count]),
    "largest-to-smallest cohort matches the SOLAS table values",
  )
  // "the largest sectors in terms of numbers employed were health & social work (382,500),
  //  industry (332,300) and wholesale & retail (326,500)" — the source's own claim.
  assert.deepEqual(sorted.slice(0, 3).map((sector) => (sector.employmentCount / 1000)), [382.5, 332.3, 326.5])
})

test("7. UX-8 introduces no invented strength or opportunity total", () => {
  assert.doesNotMatch(allChanged, /industry strength|strength score|opportunity score|strongest industr|best industr|top industr/i)
})

test("8. UX-8 chart heading describes the employment-size metric, not a ranking", () => {
  assert.match(chart, /Where people work in Ireland/)
  assert.match(chart, /Employment by broad economic sector · Q4 2024/)
  assert.doesNotMatch(chart, /strongest industr|best industr|top industr/i)
})

test("9. UX-8 shows a sector-size ≠ career-demand caveat", () => {
  assert.match(chart, /Sector employment shows economic scale, not individual career demand, salary, hiring probability or visa eligibility\./)
})

test("10. UX-8 renders all 14 sectors as bars with exact text values, not a tooltip-only layer", () => {
  const barList = chart.slice(chart.indexOf('role="list"'), chart.indexOf("Source:"))
  assert.equal((chart.match(/role="listitem"/g) ?? []).length, 1, "each sector renders through a single shared list-item template")
  assert.ok(barList.includes("sectors.map("), "the bar list iterates the full sorted cohort")
  assert.doesNotMatch(barList, /relatedSectors\.map/, "bars are not filtered to the CampCareer-mapped sectors only")
  assert.match(chart, /formatIrelandEmploymentCount\(sector\.employmentCount\)\} people/, "exact value + unit is text, not tooltip-only")
  assert.doesNotMatch(barList, /title=/, "no tooltip-only value labels")
})

test("11. UX-8 chart is screen-reader safe with semantic labels and values", () => {
  assert.match(chart, /aria-labelledby="ireland-employment-sector-heading"/)
  assert.match(chart, /id="ireland-employment-sector-heading"/)
  assert.match(chart, /aria-label="Ireland employment by broad economic sector"/)
  assert.match(chart, /aria-hidden="true"/)
  assert.match(chart, /role="note"/)
  assert.match(chart, /tabular-nums/)
})

test("12. UX-8 bars are not interactive-looking and no fake industry routes exist", () => {
  const barList = chart.slice(chart.indexOf('role="list"'), chart.indexOf("Source:"))
  assert.doesNotMatch(barList, /<a(?=[\s>])/, "bars are not wrapped in links")
  assert.doesNotMatch(barList, /<button|<input|role="slider"|onDrag|onSelect/i, "no draggable/filterable controls on the visualization")
  assert.doesNotMatch(allChanged, /href=\{?["']\/industr(y|ies)\//, "no fake /industry or /industries routes")
})

test("13. UX-8 CampCareer context is a separated, labeled conceptual mapping", () => {
  assert.match(chart, />CampCareer context</)
  assert.match(chart, /separate from CampCareer.*reviewed Industry graph/i)
  assert.match(chart, /chart categories and values stay unchanged/)
  assert.match(chart, /relatedIndustryId/)
  assert.match(chart, /careerCanonicalPath\("IE", connection\.careerId\)/)
  assert.deepEqual(
    IRELAND_EMPLOYMENT_SECTORS.filter((sector) => sector.relatedIndustryId).map((sector) => sector.relatedIndustryId),
    ["ie-healthcare", "ie-ict", "ie-construction"],
    "only the three reviewed Industry mappings exist, all toward real ecosystem industry ids",
  )
})

test("14. UX-8 keeps the UX-7 Industry/Employer graph intact and the macro chart as a separate section", () => {
  assert.match(ecosystemSection, /Related careers/)
  assert.match(ecosystemSection, /Selected employers/)
  assert.match(ecosystemSection, /ieEmployerDetailPath\(employer\.slug\)/)
  assert.match(ecosystemSection, /ieEmployerDirectoryFilterPath\(industry\.slug\)/)
  assert.doesNotMatch(ecosystemSection, /IrelandEmploymentSectorChart/, "macro chart is not nested inside the UX-7 card")
  assert.match(dashboard, /IrelandEmploymentEcosystemSection ecosystem=\{employmentEcosystem\} \/>/)
  assert.match(dashboard, /IrelandEmploymentSectorChart ecosystem=\{employmentEcosystem\} \/>/)
  assert.equal((dashboard.match(/IrelandEmploymentSectorChart/g) ?? []).length, 2, "imported and rendered exactly once as a peer")
})

test("15. UX-8 removes the long Critical Skills bullet list from the primary country flow", () => {
  assert.doesNotMatch(allChanged, /Critical Skills Occupations List/i)
  assert.doesNotMatch(dashboard, /<ul[^>]*>\s*<li[^>]*>[^<]*Critical/i)
  assert.doesNotMatch(dashboard, /[A-Za-z \-]*job market opportunities|opportunity ranking/i)
  assert.doesNotThrow(() => assertIrelandEmploymentEcosystem(IRELAND_EMPLOYMENT_ECOSYSTEM), "underlying evidence/data model is not deleted")
})

test("16. UX-8 expands nothing: no employer, career, industry or programme cohort growth", () => {
  assert.deepEqual(
    IRELAND_EMPLOYMENT_ECOSYSTEM.employers.map((employer) => employer.slug),
    [
      "microsoft-ireland",
      "google-ireland",
      "apple-ireland",
      "sisk",
      "bam-ireland",
      "jones-engineering",
      "hse",
      "st-james-hospital",
      "mater-hospital",
    ],
  )
  const reviewedCareerIds = IE_CAREER_COMPARE_IDS as readonly string[]
  const reviewedCareerSet = new Set(reviewedCareerIds)
  const ecosystemCareerIds = new Set(IRELAND_EMPLOYMENT_ECOSYSTEM.industries.flatMap((industry) => industry.careers.map((connection) => connection.careerId)))
  assert.ok([...ecosystemCareerIds].every((careerId) => reviewedCareerSet.has(careerId)), "context links only reference the reviewed IE cohort")
  assert.doesNotThrow(() => assertIrelandEmploymentEcosystem(IRELAND_EMPLOYMENT_ECOSYSTEM))
  assert.doesNotMatch(chart, /programme|programs\/ie|degree/i, "no programme/degree publication in the visualization")
  assert.doesNotMatch(chart, /IE_CAREER_COMPARE_IDS|software-developer/g, "chart introduces no new career surface")
})