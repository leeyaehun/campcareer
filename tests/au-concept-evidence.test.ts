import assert from "node:assert/strict"
import test from "node:test"
import { AU_CONCEPT_OCCUPATIONS, getAuConceptForOccupation } from "../src/data/au-major-occupation-map"
import { STUDY_CONCEPTS } from "../src/data/study-concepts"
import { getAllAuMajorSignals, getAuMajorSignal } from "../src/lib/au-major-signals"

const validBroadFields = new Set([
  "01 - Natural and Physical Sciences",
  "02 - Information Technology",
  "03 - Engineering and Related Technologies",
  "04 - Architecture and Building",
  "05 - Agriculture, Environmental and Related Studies",
  "06 - Health",
  "07 - Education",
  "08 - Management and Commerce",
  "09 - Society and Culture",
  "10 - Creative Arts",
  "11 - Food, Hospitality and Personal Services",
])

test("every selectable AU concept has a reviewed course field and no fabricated occupation mapping", () => {
  const mappedIds = new Set(AU_CONCEPT_OCCUPATIONS.map((concept) => concept.conceptId))
  assert.deepEqual(new Set(STUDY_CONCEPTS.map((concept) => concept.id)), mappedIds)

  for (const concept of AU_CONCEPT_OCCUPATIONS) {
    assert.ok(concept.broadFields.length > 0, `${concept.conceptId} needs a CRICOS broad field`)
    assert.ok(concept.broadFields.every((field) => validBroadFields.has(field)), `${concept.conceptId} uses an invalid CRICOS broad field`)
    assert.ok(concept.oscaCodes.every((code) => /^\d{6}$/.test(code)), `${concept.conceptId} uses an invalid OSCA code`)
  }

  const commerce = AU_CONCEPT_OCCUPATIONS.find((concept) => concept.conceptId === "commerce")
  assert.deepEqual(commerce?.oscaCodes, [])
})

test("design and media concepts use their reviewed OSCA occupations", () => {
  assert.equal(getAuConceptForOccupation("241131"), "architecture")
  assert.equal(getAuConceptForOccupation("242131"), "design-media")
  assert.equal(getAuConceptForOccupation("391331"), "photography-film")
  assert.equal(getAuConceptForOccupation("242431"), "interior-design")
})

test("the refreshed snapshot covers every concept without hiding salary estimates as observed data", () => {
  const signals = getAllAuMajorSignals()
  assert.equal(signals.length, STUDY_CONCEPTS.length)
  assert.ok(signals.every((signal) => signal.cost_bachelor_median_aud != null || signal.cost_diploma_median_aud != null))
  assert.ok(signals.every((signal) => signal.data_sources?.length && signal.last_verified))

  for (const conceptId of ["data-analytics", "design-media", "finance", "marketing"]) {
    const signal = getAuMajorSignal(conceptId)
    assert.ok(signal?.salary_median_aud, `${conceptId} needs a salary estimate`)
    assert.equal(signal?.salary_kind, "estimated")
  }
})
