import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { IRELAND_EMPLOYMENT_ECOSYSTEM, assertIrelandEmploymentEcosystem } from "../src/lib/employment/ireland-employment-ecosystem-data"
import { ieEmployerDirectoryPath, ieEmployerDetailPath, normalizeEmployerSlug } from "../src/lib/employment/ireland-employer-routes"
import { IE_CAREER_COMPARE_IDS } from "../src/lib/ireland-career-comparison"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const directoryPageSource = read("src/app/(workspace)/countries/ie/employers/page.tsx")
const detailPageSource = read("src/app/(workspace)/countries/ie/employers/[employerSlug]/page.tsx")
const directoryViewSource = read("src/app/(workspace)/employers/ireland-employer-directory.tsx")
const detailViewSource = read("src/app/(workspace)/employers/ireland-employer-detail.tsx")
const contractSource = read("src/lib/employment/ireland-employment-ecosystem-contract.ts")
const analyticsSource = read("src/components/analytics/decision-session-tracker.tsx")
const countrySection = read("src/app/(workspace)/countries/ireland-employment-ecosystem-section.tsx")
const careerCore = read("src/app/(workspace)/career/career-core-sections.tsx")
const serverModule = read("src/lib/employment/ireland-employment-ecosystem.server.ts")
const routeHelper = read("src/lib/employment/ireland-employer-routes.ts")

test("1. UX-7 keeps the same three Industry cohort — no new industries added", () => {
  assert.doesNotThrow(() => assertIrelandEmploymentEcosystem(IRELAND_EMPLOYMENT_ECOSYSTEM))
  assert.deepEqual(
    IRELAND_EMPLOYMENT_ECOSYSTEM.industries.map((industry) => industry.id),
    ["ie-ict", "ie-construction", "ie-healthcare"],
  )
})

test("2. UX-7 employers are verified-only with official source and checked date", () => {
  for (const employer of IRELAND_EMPLOYMENT_ECOSYSTEM.employers) {
    assert.ok(employer.name, `employer ${employer.id} has name`)
    assert.ok(employer.descriptor, `employer ${employer.id} has descriptor`)
    assert.match(employer.websiteUrl, /^https:\/\//, `employer ${employer.id} has official websiteUrl`)
    assert.match(employer.irelandPresence.url, /^https:\/\//, `employer ${employer.id} has official irelandPresence.url`)
    assert.match(employer.irelandPresenceDescription, /.+/, `employer ${employer.id} has irelandPresenceDescription`)
    assert.match(employer.checkedAt, /^2026-09-\d{2}$/, `employer ${employer.id} checkedAt is YYYY-MM-DD`)
    assert.match(employer.irelandPresence.checkedAt, /^2026-09-\d{2}$/, `employer ${employer.id} irelandPresence.checkedAt is YYYY-MM-DD`)
    assert.match(employer.irelandPresence.title, /.+/, `employer ${employer.id} irelandPresence.title present`)
  }
})

test("3. UX-7 adds no salary, hiring volume, visa sponsorship, employee count or affinity claims", () => {
  const bannedFieldPatterns = [/employee.?count/i, /salary/i, /hiring.?volume/i, /visa.?sponsorship/i, /acceptance.?rate/i, /ranking/i]
  for (const employer of IRELAND_EMPLOYMENT_ECOSYSTEM.employers) {
    const combined = `${employer.descriptor} ${employer.irelandPresenceDescription} ${employer.name}`
    for (const pattern of bannedFieldPatterns) {
      assert.doesNotMatch(combined, pattern, `employer ${employer.id} must not contain banned claim matching ${pattern}`)
    }
  }
  assert.doesNotMatch(contractSource, /employee\.?count/)
  assert.doesNotMatch(contractSource, /salary/)
})

test("4. UX-7 employers are bounded at three per industry (target)", () => {
  const counts = new Map<string, number>()
  for (const employer of IRELAND_EMPLOYMENT_ECOSYSTEM.employers) {
    counts.set(employer.industryId, (counts.get(employer.industryId) ?? 0) + 1)
  }
  for (const [industryId, count] of counts) {
    assert.ok(count <= 3, `industry ${industryId} has at most 3 employers, got ${count}`)
  }
})

test("5. UX-7 reviewed-career-only: employer career connections reference only reviewed careers", () => {
  const reviewedCareerSet = new Set<string>(IE_CAREER_COMPARE_IDS)
  for (const employer of IRELAND_EMPLOYMENT_ECOSYSTEM.employers) {
    for (const connection of employer.careers) {
      assert.ok(reviewedCareerSet.has(connection.careerId), `employer ${employer.id} references reviewed career ${connection.careerId}`)
      assert.ok(connection.rationale, `employer ${employer.id} career ${connection.careerId} has rationale`)
      assert.match(connection.evidence.url, /^https:\/\//, `employer ${employer.id} career ${connection.careerId} has evidence URL`)
    }
  }
})

test("6. UX-7 career relationships are context-only, not affinity signals for other careers", () => {
  assert.doesNotMatch(detailViewSource, /Cybersecurity Analyst[\s\S]*Microsoft/, "detail view must not infer Cybersecurity Analyst → Microsoft")
})

test("7. UX-7 employer directory route helpers work", () => {
  assert.equal(ieEmployerDirectoryPath(), "/countries/ie/employers")
  assert.equal(ieEmployerDetailPath("microsoft-ireland"), "/countries/ie/employers/microsoft-ireland")
  assert.equal(ieEmployerDetailPath("st-james-hospital"), "/countries/ie/employers/st-james-hospital")
  assert.throws(() => ieEmployerDetailPath(""))
  assert.equal(normalizeEmployerSlug("microsoft-ireland"), "microsoft-ireland")
  assert.equal(normalizeEmployerSlug(""), null)
  assert.equal(normalizeEmployerSlug("UPPER"), "upper")
  assert.equal(normalizeEmployerSlug("has spaces"), null)
})

test("8. Employer directory page has noindex and industry filter support", () => {
  assert.match(directoryPageSource, /robots:.*index:\s*false/)
  assert.match(directoryPageSource, /industry/)
  assert.match(directoryViewSource, /No verified employers in this industry yet/)
  assert.match(directoryViewSource, /not live vacancy status/)
})

test("9. Employer detail page has noindex and trust boundary", () => {
  assert.match(detailPageSource, /robots:.*index:\s*false/)
  assert.match(detailViewSource, /not live vacancy status/)
  assert.match(detailViewSource, /verified employer context/)
  assert.doesNotMatch(detailViewSource, /Programme[\s\S]*availability/)
})

test("10. Employer directory/detail pages have semantic full-card links (no nested anchor blocks)", () => {
  const cardStart = directoryViewSource.indexOf("<EntityCardLink")
  const cardEnd = directoryViewSource.indexOf("</EntityCardLink>")
  assert.ok(cardStart > -1 && cardEnd > cardStart, "directory uses EntityCardLink for full-card link")
  const cardBlock = directoryViewSource.slice(cardStart, cardEnd)
  assert.doesNotMatch(cardBlock, /<a(?=[\s>])/, "EntityCardLink must not nest another anchor")
  assert.ok(
    directoryViewSource.indexOf("<a href={employer.careersUrl}") > cardEnd,
    "careers link is a sibling of the full-card link, not nested",
  )
  assert.doesNotMatch(detailViewSource, /<a(?=[\s>])[^>]*>[^<]*<a(?=[\s>])/, "detail must not nest anchor tags")
})

test("11. Employer detail shows verified locations only for cities with explicit evidence", () => {
  assert.match(detailViewSource, /employer\.cities\.map/, "detail renders verified cities")
  assert.doesNotMatch(detailViewSource, /inferred|assumed|estimated[\s\S]*location/, "no inferred locations")
})

test("12. Country Industry cards show selected employers + View employers continuation", () => {
  assert.match(countrySection, /Selected employers/)
  assert.match(countrySection, /View employers in/)
  assert.match(countrySection, /ieEmployerDetailPath/)
  assert.match(countrySection, /ieEmployerDirectoryFilterPath/)
})

test("13. Career page IrelandEmploymentContext links to internal employer detail pages", () => {
  assert.match(careerCore, /ieEmployerDetailPath/)
  assert.match(careerCore, /careersSourceTitle/)
})

test("14. Server-only employer read functions are exported", () => {
  assert.match(serverModule, /getIrelandEmployerBySlug = cache/)
  assert.match(serverModule, /getIrelandEmployersByIndustry = cache/)
  assert.match(serverModule, /import "server-only"/)
})

test("15. Analytics recognizes employer paths as 'employer' entity type", () => {
  assert.match(analyticsSource, /path\.includes\("\/employers"\)/)
  assert.match(analyticsSource, /return "employer"/)
  assert.match(routeHelper, /ieEmployerDirectoryPath/)
  assert.match(routeHelper, /ieEmployerDetailPath/)
})

test("16. No programme publication, no thin industry SEO routes, existing journeys intact", () => {
  assert.doesNotMatch(directoryPageSource, /\/programs\/ie/)
  assert.doesNotMatch(directoryViewSource, /programme|degree|university/)
  assert.doesNotMatch(detailViewSource, /programme|degree|university/)
  assert.match(countrySection, /Related careers/)
  assert.match(careerCore, /Selected employers relevant to this career/)
  assert.match(careerCore, /does not indicate current hiring, salary or visa sponsorship/)
  assert.match(careerCore, /Verified through an official employer/)
})