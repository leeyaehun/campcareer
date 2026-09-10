import assert from "node:assert/strict"
import test from "node:test"

import { trendLabel, trendTone } from "../src/components/ui/data-display"

test("trend display preserves an explicit text label and semantic token for every state", () => {
  assert.deepEqual(
    ["up", "down", "steady", "unknown"].map((direction) => [trendLabel(direction as Parameters<typeof trendLabel>[0]), trendTone(direction as Parameters<typeof trendTone>[0])]),
    [
      ["Increasing", "success"],
      ["Decreasing", "caution"],
      ["Stable", "neutral"],
      ["Unavailable", "outline"],
    ],
  )
})
