import assert from "node:assert/strict"
import test from "node:test"
import { getCompareAnalyticsDetails } from "../src/components/analytics/decision-session-tracker"

test("Compare measurement records only a mode and selected-item count", () => {
  assert.deepEqual(
    getCompareAnalyticsDetails(new URLSearchParams("type=career&country=AU&careers=registered-nurse,software-engineer")),
    { comparison_category: "career", entity_count: 2 },
  )
  assert.deepEqual(
    getCompareAnalyticsDetails(new URLSearchParams("type=city&country=AU&left=sydney&right=melbourne")),
    { comparison_category: "city", entity_count: 2 },
  )
})
