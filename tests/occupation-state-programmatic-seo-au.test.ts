import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  AU_OCCUPATION_STATES,
  AU_OCCUPATION_STATE_CAREERS,
  AU_OCCUPATION_STATE_PAGES,
  auOccupationStatePath,
  getAuOccupationStatePage,
  getAuOccupationStatePageByRegionCode,
  getAuOccupationStatePagesForCareer,
  getAuOccupationStatePagesForState,
} from "../src/lib/workspace/au-occupation-state-seo"

test("Australia occupation-state context retains exactly 40 bounded routes", () => {
  assert.equal(AU_OCCUPATION_STATES.length, 8)
  assert.equal(AU_OCCUPATION_STATE_CAREERS.length, 5)
  assert.equal(AU_OCCUPATION_STATE_PAGES.length, 40)
  assert.equal(new Set(AU_OCCUPATION_STATE_PAGES.map((page) => page.path)).size, 40)
  assert.ok(AU_OCCUPATION_STATE_PAGES.every((page) => page.path.startsWith("/occupation/au/")))
})

test("only decision-ready launch careers are in the state context inventory", () => {
  assert.deepEqual(
    AU_OCCUPATION_STATE_CAREERS.map((career) => career.slug),
    ["carpenter", "electrician", "midwife", "physiotherapist", "registered-nurse"],
  )
  assert.equal(getAuOccupationStatePagesForCareer("electrician").length, 8)
  assert.equal(getAuOccupationStatePagesForState("victoria").length, 5)
})

test("occupation-state paths are deterministic and lookups normalize casing", () => {
  assert.equal(
    auOccupationStatePath("new-south-wales", "electrician"),
    "/occupation/au/new-south-wales/electrician",
  )
  const page = getAuOccupationStatePage("NEW-SOUTH-WALES", "Electrician")
  assert.ok(page)
  assert.equal(page?.state.code, "NSW")
  assert.equal(page?.path, "/occupation/au/new-south-wales/electrician")
  assert.equal(getAuOccupationStatePageByRegionCode("vic", "registered-nurse")?.state.slug, "victoria")
})

test("every quality-gated route is addressable from its regional demand code", () => {
  for (const page of AU_OCCUPATION_STATE_PAGES) {
    assert.equal(
      getAuOccupationStatePageByRegionCode(page.state.code, page.career.slug)?.path,
      page.path,
    )
  }
})

test("the occupation dashboard keeps AU regional demand evidence visible without exposing the legacy Opportunity Score", () => {
  const source = readFileSync(
    "src/app/(workspace)/occupation/country-occupation-dashboard.tsx",
    "utf8",
  )

  assert.ok(source.includes("rankedRegions.map"))
  assert.ok(source.includes("region.regionCode"))
  assert.ok(source.includes("region.vacancyCount"))
  assert.ok(source.includes("State demand ranking"))
  assert.ok(source.includes("CampCareer Score"))
  assert.doesNotMatch(source, /Opportunity score/i)
})

test("unsupported states and non-gated careers do not create contextual routes", () => {
  assert.equal(getAuOccupationStatePage("new-south-wales", "plumber"), null)
  assert.equal(getAuOccupationStatePage("australian-capital-territory", "welder"), null)
  assert.equal(getAuOccupationStatePage("unknown-state", "electrician"), null)
})

test("metro city guides are attached only where a published AU city page exists", () => {
  assert.equal(getAuOccupationStatePage("new-south-wales", "carpenter")?.state.citySlug, "sydney")
  assert.equal(getAuOccupationStatePage("western-australia", "carpenter")?.state.citySlug, "perth")
  assert.equal(getAuOccupationStatePage("tasmania", "carpenter")?.state.citySlug, null)
})
