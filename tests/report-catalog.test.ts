import assert from "node:assert/strict"
import test from "node:test"
import {
  PERSONALIZED_ROI_INPUTS,
  REPORT_CATALOG_COUNTRY,
  REPORT_CATALOG_CURRENCY,
  REPORT_PRODUCTS,
  TOPIC_REPORT_SCOPES,
  formatAud,
  getReportProduct,
} from "../src/lib/report-catalog"

test("the Australia report catalogue keeps the agreed AUD prices and scope", () => {
  assert.equal(REPORT_CATALOG_COUNTRY, "AU")
  assert.equal(REPORT_CATALOG_CURRENCY, "AUD")
  assert.equal(REPORT_PRODUCTS.length, 4)
  assert.equal(new Set(REPORT_PRODUCTS.map((product) => product.id)).size, REPORT_PRODUCTS.length)
  assert.deepEqual(REPORT_PRODUCTS.map((product) => product.amountAudCents), [900, 2900, 5900, 14900])
  assert.ok(REPORT_PRODUCTS.every((product) => product.country === "AU" && product.currency === "AUD"))
  assert.ok(REPORT_PRODUCTS.every((product) => product.salesStatus === "contracted"))
  assert.equal(formatAud(14900), "A$149")
})

test("the topic, personalised upgrade, and expert-review contracts stay intact", () => {
  const topic = getReportProduct("australia-topic-deep-dive")
  const personalised = getReportProduct("my-australia-roi-decision-report")
  const expert = getReportProduct("australia-expert-review")

  assert.deepEqual(topic?.topicScopes, TOPIC_REPORT_SCOPES)
  assert.deepEqual(TOPIC_REPORT_SCOPES, ["field", "city", "university"])
  assert.deepEqual(personalised?.pageCount, { min: 18, max: 30, target: 24 })
  assert.deepEqual(personalised?.upgrade, {
    fromProductId: "australia-study-roi-index-2026",
    additionalAmountAudCents: 3000,
  })
  assert.deepEqual(expert?.expertSettlement, {
    expertPayoutAudCents: 10000,
    platformGrossAudCents: 4900,
  })
  assert.ok(PERSONALIZED_ROI_INPUTS.includes("maximum-budget"))
  assert.ok(PERSONALIZED_ROI_INPUTS.includes("risk-tolerance"))
})
