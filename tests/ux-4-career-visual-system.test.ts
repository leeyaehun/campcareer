import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const workspaceShell = read("src/components/workspace/workspace-shell.tsx")
const careerPage = read("src/app/(workspace)/career/[country]/[career]/page.tsx")
const careerResultPage = read("src/app/(workspace)/career/career-result-page.tsx")
const coreSections = read("src/app/(workspace)/career/career-core-sections.tsx")
const explorer = read("src/app/(workspace)/occupation/occupation-explorer.tsx")
const careersPage = read("src/app/(workspace)/careers/page.tsx")
const actions = read("src/app/(workspace)/career/career-result-actions.tsx")

test("Career shell shares a single canvas + max-w-6xl container for /careers and /career/*", () => {
  assert.match(workspaceShell, /pathname === "\/career" \|\| pathname\.startsWith\("\/career\/"\)/)
  assert.match(workspaceShell, /pathname === "\/careers"/)
  assert.match(workspaceShell, /bg-campcareer-canvas/)
  assert.match(workspaceShell, /max-w-6xl/)
  assert.match(workspaceShell, /sm:px-8 sm:pt-10 lg:px-10/)
})

test("/careers discovery header, search and country filter are grouped in a named surface", () => {
  assert.match(careersPage, /<h1[^>]*>Careers<\/h1>/)
  assert.match(careersPage, /aria-label="Career search and filters"/)
  assert.match(careersPage, /action="\/careers"/)
  assert.match(careersPage, /sr-only">Search careers/)
  assert.match(careersPage, /CareerCountrySelector/)
  assert.match(careersPage, /Country filter/)
})

test("/careers query contract and canonical redirect are preserved", () => {
  assert.match(careersPage, /permanentRedirect\(canonicalRoute\.path\)/)
  assert.match(careersPage, /initialOccupation/)
  assert.match(careersPage, /initialCountry/)
  assert.match(careersPage, /initialCategory/)
  assert.match(careersPage, /initialBrowseAll/)
})

test("Career search results become semantic Links where a canonical route exists", () => {
  assert.match(explorer, /import Link from "next\/link"/)
  assert.match(explorer, /const careerRoute = isCareerIndex && effectiveCountry \? getIndexableCareerRoute\(effectiveCountry, career\.id\) : null/)
  assert.match(explorer, /\? <Link key=\{career\.id\} href=\{careerRoute\.path\}/)
  assert.match(explorer, /<button key=\{career\.id\} type="button" onClick=\{\(\) => select\(career\)\}/)
  assert.match(explorer, /cursor-pointer/)
  assert.match(explorer, /focus-visible:ring-4/)
  assert.match(explorer, /hover:bg-brand-tint/)
  assert.match(explorer, /getIndexableCareerRoute\(countryCode, career\.id\)/)
})

test("Career detail retains contextual nav and CampCareer Score remains in the hero card", () => {
  assert.ok(careerPage.includes('route.country.code === "IE" ? "/countries/ie"'))
  assert.ok(careerPage.includes("Browse ${route.country.name} careers"))
  assert.match(careerPage, /CampCareerScoreHero/)
  assert.match(careerPage, /CareerCoreSections/)
  assert.match(careerPage, /CareerResultActions/)
  assert.match(careerPage, /rounded-cc-large border border-campcareer-border bg-campcareer-surface/)
})

test("legacy query-style Career result keeps the shared structural wrapper and no nested main", () => {
  assert.match(careerResultPage, /min-h-\[calc\(100vh-4rem\)\]/)
  assert.doesNotMatch(careerResultPage, /<main/)
})

test("Career detail sections follow Evidence → Path → Study / Programs → Jobs order on canvas", () => {
  assert.match(coreSections, /id="evidence".*rounded-cc-large.*bg-campcareer-surface/)
  assert.match(coreSections, /id="path".*rounded-cc-large.*bg-campcareer-surface/)
  assert.match(coreSections, /id="study".*rounded-cc-large.*bg-campcareer-surface/)
  assert.match(coreSections, /id="jobs".*rounded-cc-large.*bg-campcareer-surface/)
  assert.ok(coreSections.indexOf('id="evidence"') < coreSections.indexOf('id="path"'))
  assert.ok(coreSections.indexOf('id="path"') < coreSections.indexOf('id="study"'))
  assert.ok(coreSections.indexOf('id="study"') < coreSections.indexOf('id="jobs"'))
  assert.match(coreSections, /aria-label=\{tr\(locale, "커리어 페이지 섹션", "Career page sections"\)\}/)
  assert.match(coreSections, /scroll-mt-24/)
})

test("Section headings use restrained accent: muted uppercase eyebrow, brand-tint evidence pill", () => {
  assert.match(coreSections, /uppercase tracking-\[0\.08em\] text-campcareer-muted/)
  assert.match(coreSections, /bg-brand-tint px-2\.5 py-1 text-sm font-bold tabular-nums text-brand/)
  assert.match(coreSections, /Key sources/)
  assert.match(coreSections, /Programme detail publication is still under verification/)
  assert.match(coreSections, /Relevant degrees \/ study paths/)
  assert.match(coreSections, /Selected employers relevant to this career/)
})

test("No legacy competing public totals are restored to Career pages", () => {
  assert.doesNotMatch(careerPage, /CareerMarketResults/)
  assert.doesNotMatch(careerPage, /Job market score/)
  assert.doesNotMatch(careerPage, /Career Opportunity Score/)
  assert.doesNotMatch(coreSections, /CareerMarketResults/)
  assert.doesNotMatch(coreSections, /Job market score/)
  assert.doesNotMatch(coreSections, /Career Opportunity Score/)
})

test("Compare continuation from Career detail is intact", () => {
  assert.match(actions, /getCareerResultCompareHref/)
  assert.match(actions, /<Link href=\{localizePath\(compareHref, locale\)\}/)
  assert.match(actions, /Secondary career actions/)
  assert.match(actions, /aria-label/)
})

test("Employment context on canvas and skeleton use restrained surface tokens", () => {
  assert.match(coreSections, /Ireland employment context/)
  assert.match(coreSections, /bg-campcareer-canvas p-5/)
  assert.match(coreSections, /rounded-cc-surface border border-campcareer-border bg-campcareer-canvas/)
})

test("In-page section navigation preserves keyboard anchors and minimum touch targets", () => {
  assert.match(explorer, /min-h-11/)
  assert.match(careerPage, /min-h-10/)
  assert.match(coreSections, /<nav aria-label/)
  assert.match(coreSections, /#evidence/)
  assert.match(coreSections, /#path/)
  assert.match(coreSections, /#study/)
  assert.match(coreSections, /#jobs/)
})
