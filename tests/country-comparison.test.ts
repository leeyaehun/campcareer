import assert from "node:assert/strict"
import test from "node:test"
import {
  COUNTRY_COMPARE_MAX_COUNTRIES,
  addCountrySlot,
  buildCountryCompareHref,
  cancelEmptyCountrySlot,
  completeCountryCodes,
  fromExternalIsoCountryCode,
  normalizeCountryCodes,
  parseCountryComparisonState,
  removeCountrySlot,
  replaceCountryInSlot,
  resolveComparisonPageType,
  slotsFromCountryCodes,
  toExternalIsoCountryCode,
} from "../src/lib/country-comparison"
import { COUNTRY_COMPARE_CATALOG } from "../src/data/country-comparison/locations"
import {
  REGISTERED_NURSE_COUNTRY_SHELL,
} from "../src/data/country-comparison/registered-nurse"
import {
  REGISTERED_NURSE_MATRIX_ROWS,
  formatCountryComparisonRow,
} from "../src/data/country-comparison/registered-nurse-rows"
import {
  areSourceIdsKnown,
  isCountryComparisonValueType,
  resolveSourceReferences,
  type MoneyValue,
  type SourceReference,
} from "../src/data/country-comparison/contracts"

test("compare dispatcher keeps Programs default and isolates Countries", () => {
  assert.equal(resolveComparisonPageType(null), "program")
  assert.equal(resolveComparisonPageType("program"), "program")
  assert.equal(resolveComparisonPageType("country"), "country")
  assert.equal(resolveComparisonPageType("career"), "career")
  assert.equal(resolveComparisonPageType("countries"), "unsupported")
})

test("country comparison accepts only the registered nurse starting profile", () => {
  const supported = parseCountryComparisonState(new URLSearchParams("goal=registered-nurse&profile=starting-from-scratch"))
  assert.equal(supported.contextState, "supported")
  assert.equal(supported.countries.length, 0)

  const invalidGoal = parseCountryComparisonState(new URLSearchParams("goal=software-developer&profile=starting-from-scratch"))
  assert.equal(invalidGoal.contextState, "unsupported")

  const invalidProfile = parseCountryComparisonState(new URLSearchParams("goal=registered-nurse&profile=already-qualified"))
  assert.equal(invalidProfile.contextState, "unsupported")
})

test("country codes normalize, validate membership, dedupe and cap at three", () => {
  assert.deepEqual(
    normalizeCountryCodes(" au,IE,AU,sydney,sg,UK"),
    ["AU", "IE", "UK"],
  )
  assert.deepEqual(normalizeCountryCodes(" , ,:sydney,AU:,XX"), [])
})

test("country and external ISO codes remain distinct at the adapter boundary", () => {
  assert.equal(toExternalIsoCountryCode("AU"), "AU")
  assert.equal(toExternalIsoCountryCode("IE"), "IE")
  assert.equal(toExternalIsoCountryCode("UK"), "GB")
  assert.equal(fromExternalIsoCountryCode("GB"), "UK")
  assert.equal(fromExternalIsoCountryCode("UK"), null)
})

test("country URLs are canonical and omit incomplete selections", () => {
  assert.equal(
    buildCountryCompareHref(["AU", "IE"]),
    "/compare?type=country&goal=registered-nurse&profile=starting-from-scratch&countries=AU,IE",
  )
  assert.deepEqual(
    completeCountryCodes([
      { countryCode: "AU", optional: false },
      { countryCode: null, optional: false },
    ]),
    ["AU"],
  )
})

test("selection helpers preserve order, compact removals and cancel optional slots", () => {
  const initial = slotsFromCountryCodes(["AU", "IE"])
  assert.deepEqual(initial.map((slot) => slot.countryCode), ["AU", "IE"])

  const replaced = replaceCountryInSlot(initial, 0, "UK")
  assert.deepEqual(replaced.map((slot) => slot.countryCode), ["UK", "IE"])
  assert.deepEqual(replaceCountryInSlot(replaced, 0, "IE").map((slot) => slot.countryCode), ["UK", "IE"])

  const withExtra = addCountrySlot(replaced)
  assert.equal(withExtra.length, 3)
  assert.equal(withExtra[2].optional, true)
  assert.equal(cancelEmptyCountrySlot(withExtra, 2).length, 2)

  const removed = removeCountrySlot(replaced, 0)
  assert.deepEqual(removed.map((slot) => slot.countryCode), ["IE", null])
})

test("selection helpers expose the 0-to-3 state progression", () => {
  assert.equal(completeCountryCodes(slotsFromCountryCodes([])).length, 0)
  assert.equal(completeCountryCodes(slotsFromCountryCodes(["AU"])).length, 1)
  assert.equal(completeCountryCodes(slotsFromCountryCodes(["AU", "IE"])).length, 2)
  assert.equal(completeCountryCodes(slotsFromCountryCodes(["AU", "IE", "UK"])).length, 3)
})

test("country selection has a hard three-slot ceiling", () => {
  let slots = slotsFromCountryCodes(["AU", "IE"])
  slots = addCountrySlot(slots)
  slots = addCountrySlot(slots)
  slots = addCountrySlot(slots)
  assert.equal(slots.length, COUNTRY_COMPARE_MAX_COUNTRIES)
  assert.equal(addCountrySlot(slots).length, COUNTRY_COMPARE_MAX_COUNTRIES)
})

test("country parser ignores invalid codes without falling back to another country", () => {
  const parsed = parseCountryComparisonState(new URLSearchParams(
    "goal=registered-nurse&profile=starting-from-scratch&countries=AU,dublin,IE,sg,UK:london",
  ))
  assert.deepEqual(parsed.countries, ["AU", "IE"])
})

test("AU, IE, and UK share the same null-safe RN contract", () => {
  assert.deepEqual(REGISTERED_NURSE_COUNTRY_SHELL.map((country) => country.countryCode), ["AU", "IE", "UK"])
  for (const country of REGISTERED_NURSE_COUNTRY_SHELL) {
    assert.equal(country.goal, "registered-nurse")
    assert.equal(country.profile, "starting-from-scratch")
    assert.equal(country.audience, "international-student")
    assert.equal(country.qualificationProfile, "no-nursing-qualification-or-registration")
    assert.equal(country.pathway.qualificationRoute, null)
    assert.equal(country.pathway.studyDuration, null)
    assert.equal(country.studyCost.annualTuition, null)
    assert.equal(country.visa.studentVisa, null)
    assert.equal(country.professionalIncome.startingIncome, null)
    assert.equal(country.timeAndInvestment.recoveryPeriod, null)
    assert.deepEqual(country.sources, [])
    assert.equal("citySlug" in country, false)
  }
  assert.deepEqual(COUNTRY_COMPARE_CATALOG.map((country) => country.productCode), ["AU", "IE", "UK"])
})

test("common value types support ranges, null values, and value-type validation", () => {
  const tuitionRange: MoneyValue = {
    currency: "AUD",
    amount: null,
    min: 30000,
    max: 50000,
    period: "year",
    effectiveYear: null,
    valueType: "range",
    sourceIds: [],
  }
  assert.equal(tuitionRange.amount, null)
  assert.equal(tuitionRange.valueType, "range")
  assert.equal(isCountryComparisonValueType("official"), true)
  assert.equal(isCountryComparisonValueType("unavailable"), true)
  assert.equal(isCountryComparisonValueType("fabricated"), false)
})

test("source references resolve known IDs and safely ignore missing IDs", () => {
  const source: SourceReference = {
    id: "source-au-rn-1",
    label: "Example official source",
    url: "https://example.com/source",
    sourceType: "official",
    reviewedAt: null,
    effectiveYear: null,
    verificationStatus: "verified",
  }
  assert.equal(areSourceIdsKnown(["source-au-rn-1"], [source]), true)
  assert.equal(areSourceIdsKnown(["missing-source"], [source]), false)
  assert.deepEqual(resolveSourceReferences(["source-au-rn-1", "missing-source"], [source]), [source])
})

test("RN matrix rows use shared definitions and keep missing values safe", () => {
  const country = REGISTERED_NURSE_COUNTRY_SHELL.find((entry) => entry.countryCode === "AU")!
  const context = { country, city: null, cityCost: null }
  const rowKeys = REGISTERED_NURSE_MATRIX_ROWS.map((row) => row.fieldKey)
  assert.equal(new Set(rowKeys).size, rowKeys.length)
  assert.equal(formatCountryComparisonRow(REGISTERED_NURSE_MATRIX_ROWS.find((row) => row.fieldKey === "studyCost.annualTuition")!, context), "Not available")
  assert.equal(formatCountryComparisonRow(REGISTERED_NURSE_MATRIX_ROWS.find((row) => row.fieldKey === "currency")!, context), "AUD (A$)")
  assert.deepEqual([...new Set(REGISTERED_NURSE_MATRIX_ROWS.map((row) => row.section))], [
    "Pathway",
    "Study cost",
    "Living in selected city",
    "Visa and post-study",
    "Professional income",
    "Time and investment",
    "Source",
  ])
})