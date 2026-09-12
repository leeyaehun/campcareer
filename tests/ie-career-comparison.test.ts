import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  buildIrelandCareerCompareHref,
  IE_CAREER_COMPARE_IDS,
  normalizeIrelandCareerIds,
  parseIrelandCareerComparisonState,
  replaceIrelandCareerAtIndex,
} from "../src/lib/ireland-career-comparison"

test("Ireland Career MVP compare allowlist is exactly the six reviewed Careers", () => {
  assert.deepEqual(IE_CAREER_COMPARE_IDS, [
    "software-developer",
    "cybersecurity-analyst",
    "data-engineer",
    "civil-engineer",
    "construction-manager",
    "radiographer",
  ])
})

test("Ireland career compare query normalizes, dedupes and caps at three", () => {
  assert.deepEqual(
    normalizeIrelandCareerIds(
      "software-developer,civil-engineer,software-developer,radiographer,architect",
    ),
    ["software-developer", "civil-engineer", "radiographer"],
  )
  assert.deepEqual(normalizeIrelandCareerIds("accountant,architect"), [])
})

test("Ireland career compare requires the explicit Ireland MVP context", () => {
  const supported = parseIrelandCareerComparisonState(
    new URLSearchParams(
      "country=IE&profile=ireland-career-mvp-v1&careers=software-developer,civil-engineer",
    ),
  )
  assert.equal(supported.contextState, "supported")
  assert.deepEqual(supported.careerIds, ["software-developer", "civil-engineer"])

  assert.equal(
    parseIrelandCareerComparisonState(
      new URLSearchParams("country=AU&profile=ireland-career-mvp-v1"),
    ).contextState,
    "unsupported",
  )
  assert.equal(
    parseIrelandCareerComparisonState(
      new URLSearchParams("country=IE&profile=starting-from-scratch"),
    ).contextState,
    "unsupported",
  )
})

test("Ireland Career MVP compare href is reconstructable and non-duplicating", () => {
  assert.equal(
    buildIrelandCareerCompareHref(["software-developer", "civil-engineer"]),
    "/compare?type=career&country=IE&profile=ireland-career-mvp-v1&careers=software-developer%2Ccivil-engineer",
  )
  assert.deepEqual(
    replaceIrelandCareerAtIndex(
      ["software-developer", "civil-engineer"],
      1,
      "radiographer",
    ),
    ["software-developer", "radiographer"],
  )
  assert.deepEqual(
    replaceIrelandCareerAtIndex(
      ["software-developer", "civil-engineer"],
      1,
      "software-developer",
    ),
    ["software-developer", "civil-engineer"],
  )
})

test("Compare page routes Ireland careers to the Ireland matrix instead of Australian fallback", () => {
  const page = readFileSync("src/app/(workspace)/compare/page.tsx", "utf8")
  const matrix = readFileSync(
    "src/app/(workspace)/compare/ireland-careers-compare-matrix.tsx",
    "utf8",
  )

  assert.match(page, /if \(country === "IE"\) return <IrelandCareersCompare params=\{params\} \/>/)
  assert.match(page, /getIrelandCareerCompareCatalog/)
  assert.match(page, /IrelandCareersCompareMatrix/)
  assert.match(page, /robots: \{ index: false, follow: false \}/)
  assert.match(matrix, /CampCareer Score/)
  assert.match(matrix, /Demand/)
  assert.match(matrix, /Pay/)
  assert.match(matrix, /Entry/)
  assert.match(matrix, /Evidence confidence/)
  assert.match(matrix, /Pay currently uses the same broad official Professional-occupations proxy/)
  assert.match(matrix, /name: "compare_complete"/)
  assert.match(matrix, /comparison_category: "career"/)
})
