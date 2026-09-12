import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { hasGrantedAnalyticsConsent } from "../src/lib/analytics-consent"

test("commercial measurement requires the same explicit consent in browser and server boundaries", () => {
  assert.equal(hasGrantedAnalyticsConsent(null), false)
  assert.equal(hasGrantedAnalyticsConsent("cc_analytics_consent=denied"), false)
  assert.equal(hasGrantedAnalyticsConsent("other=value; cc_analytics_consent=granted"), true)
  assert.equal(hasGrantedAnalyticsConsent("cc_analytics_consent=granted-extra"), false)

  const affiliateRoute = readFileSync("src/app/out/[partner]/route.ts", "utf8")
  assert.match(affiliateRoute, /hasGrantedAnalyticsConsent\(request\.headers\.get\("cookie"\)\)/)
})

test("independent score and ranking modules do not import commercial dependencies", () => {
  const modules = [
    "src/lib/campcareer-score.ts",
    "src/lib/career-data-foundation/opportunity-score.ts",
    "src/lib/career-comparison.ts",
    "src/lib/country-comparison.ts",
    "src/lib/discovery/search-contract.ts",
    "src/lib/school-score.ts",
  ]

  for (const file of modules) {
    const imports = readFileSync(file, "utf8")
      .split("\n")
      .filter((line) => /^\s*(?:import|export).*\bfrom\b/.test(line))
      .join("\n")
    assert.doesNotMatch(imports, /\b(?:partners?|affiliate|commission|sponsor|payment|billing|checkout|stripe)\b/i, file)
  }
})
