import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { parseIrelandCareerComparisonState } from "../src/lib/ireland-career-comparison"
import { SCORE_READY_CAREER_PROFILES } from "../src/lib/workspace/career-coverage"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const careerPage = read("src/app/(workspace)/career/[country]/[career]/page.tsx")
const topNav = read("src/components/layout/top-nav.tsx")
const topbar = read("src/components/workspace/workspace-topbar.tsx")
const footer = read("src/components/layout/site-footer.tsx")
const loginPage = read("src/app/login/page.tsx")

test("career page imports SCORE_READY_CAREER_PROFILES for country continuation", () => {
  assert.match(careerPage, /import.*SCORE_READY_CAREER_PROFILES.*from.*career-coverage/)
})

test("career page computes available countries from SCORE_READY_CAREER_PROFILES", () => {
  assert.match(careerPage, /SCORE_READY_CAREER_PROFILES/)
  assert.match(careerPage, /filter.*profile\.careerId === route\.career\.id/)
  assert.match(careerPage, /getLaunchCountry/)
})

test("career page renders country continuation section when multiple countries exist", () => {
  assert.match(careerPage, /availableCountries\.length > 1/)
  assert.match(careerPage, /Explore this career by country/)
  assert.match(careerPage, /Countries/)
})

test("radiographer appears in both AU and IE score-ready profiles", () => {
  const radiographerProfiles = SCORE_READY_CAREER_PROFILES.filter(p => p.careerId === "radiographer")
  const countries = radiographerProfiles.map(p => p.countryCode)
  assert.ok(countries.includes("AU"), "radiographer should be score-ready for AU")
  assert.ok(countries.includes("IE"), "radiographer should be score-ready for IE")
})

test("software-developer appears only in IE score-ready profiles", () => {
  const swProfiles = SCORE_READY_CAREER_PROFILES.filter(p => p.careerId === "software-developer")
  assert.equal(swProfiles.length, 1)
  assert.equal(swProfiles[0].countryCode, "IE")
})

test("career page country links use canonical career route resolver", () => {
  assert.match(careerPage, /href=\{localizePath\(`\/career\/\$\{entry\.country\.slug\}\/\$\{route\.career\.id\}`, locale\)\}/)
})

test("Ireland Career Compare normalizes starting-from-scratch to ireland-career-mvp-v1", () => {
  const params = new URLSearchParams({
    type: "career",
    country: "IE",
    profile: "starting-from-scratch",
    careers: "software-developer,civil-engineer",
  })
  const state = parseIrelandCareerComparisonState(params)
  assert.equal(state.contextState, "supported")
  assert.equal(state.countryCode, "IE")
  assert.equal(state.profile, "ireland-career-mvp-v1")
  assert.deepEqual(state.careerIds, ["software-developer", "civil-engineer"])
})

test("Ireland Career Compare still supports ireland-career-mvp-v1 directly", () => {
  const params = new URLSearchParams({
    type: "career",
    country: "IE",
    profile: "ireland-career-mvp-v1",
    careers: "software-developer,civil-engineer",
  })
  const state = parseIrelandCareerComparisonState(params)
  assert.equal(state.contextState, "supported")
  assert.equal(state.profile, "ireland-career-mvp-v1")
})

test("Ireland Career Compare rejects unsupported profiles", () => {
  const params = new URLSearchParams({
    type: "career",
    country: "IE",
    profile: "some-other-profile",
    careers: "software-developer",
  })
  const state = parseIrelandCareerComparisonState(params)
  assert.equal(state.contextState, "unsupported")
  assert.equal(state.profile, null)
})

test("all wordmark links use CampCareer (capitalized)", () => {
  assert.match(topNav, />\s*CampCareer\s*<\/Link>/)
  assert.match(topbar, />\s*CampCareer\s*<\/Link>/)
  assert.match(footer, />\s*CampCareer<\/Link>/)
  assert.match(loginPage, />\s*CampCareer\s*<\/Link>/)
})

test("no wordmark links use lowercase campcareer", () => {
  assert.doesNotMatch(topNav, />\s*campcareer\s*<\/Link>/)
  assert.doesNotMatch(topbar, />\s*campcareer\s*<\/Link>/)
  assert.doesNotMatch(footer, />\s*campcareer<\/Link>/)
  assert.doesNotMatch(loginPage, />\s*campcareer\s*<\/Link>/)
})

test("login page aria-label uses CampCareer", () => {
  assert.match(loginPage, /aria-label="CampCareer home"/)
  assert.doesNotMatch(loginPage, /aria-label="campcareer home"/)
})
