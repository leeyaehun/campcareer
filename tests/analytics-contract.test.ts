import assert from "node:assert/strict"
import test from "node:test"
import {
  CORE_ANALYTICS_EVENTS,
  analyticsConsentGranted,
  isGoogleAnalyticsMeasurementId,
  sanitizeAnalyticsParams,
  sanitizeSearchTerm,
} from "../src/lib/analytics"
import type { AnalyticsEntityType } from "../src/lib/analytics"
import { entityTypeForPath, nextDecisionSessionState } from "../src/components/analytics/decision-session-tracker"

test("Phase 6 event names remain stable lower_snake_case identifiers", () => {
  assert.ok(CORE_ANALYTICS_EVENTS.includes("search"))
  assert.ok(CORE_ANALYTICS_EVENTS.includes("compare_view"))
  assert.ok(CORE_ANALYTICS_EVENTS.includes("compare_complete"))
  assert.ok(CORE_ANALYTICS_EVENTS.includes("compare_share"))
  assert.ok(CORE_ANALYTICS_EVENTS.includes("decision_session"))
  for (const eventName of CORE_ANALYTICS_EVENTS) assert.match(eventName, /^[a-z]+(?:_[a-z]+)*$/)
})

test("analytics sanitization keeps product fields and removes obvious PII", () => {
  assert.equal(sanitizeSearchTerm("electrician"), "electrician")
  assert.equal(sanitizeSearchTerm("reader@example.com"), undefined)
  assert.equal(sanitizeSearchTerm("+353 86 123 4567"), undefined)
  assert.equal(sanitizeSearchTerm("Jane Doe"), undefined)
  assert.deepEqual(
    sanitizeAnalyticsParams({ search_location: "careers", result_count: 0, email: "reader@example.com", feedback_message: "private", invalid: Number.NaN }),
    { search_location: "careers", result_count: 0 },
  )
})

test("GA measurement IDs are optional and constrained", () => {
  assert.equal(isGoogleAnalyticsMeasurementId(undefined), false)
  assert.equal(isGoogleAnalyticsMeasurementId("UA-123"), false)
  assert.equal(isGoogleAnalyticsMeasurementId("G-ABC12345"), true)
})

test("analytics is a server/test no-op without a browser consent cookie", () => {
  assert.equal(analyticsConsentGranted(), false)
})

test("Decision Session counts unique meaningful paths and requires two entity types", () => {
  let state: { viewedPaths: string[]; entityTypes: AnalyticsEntityType[]; decisionRecorded: boolean } = { viewedPaths: [], entityTypes: [], decisionRecorded: false }
  state = nextDecisionSessionState(state, "/career/au/electrician", "career")
  state = nextDecisionSessionState(state, "/countries/au", "country")
  state = nextDecisionSessionState(state, "/programs/au/electrical", "program")
  const duplicate = nextDecisionSessionState(state, "/programs/au/electrical", "program")
  assert.equal(state.viewedPaths.length, 3)
  assert.equal(state.entityTypes.length, 3)
  assert.equal(duplicate, state)
  assert.equal(entityTypeForPath("/career/au/electrician"), "career")
  assert.equal(entityTypeForPath("/programs/au/electrical"), "program")
  assert.equal(entityTypeForPath("/careers"), null)
})
