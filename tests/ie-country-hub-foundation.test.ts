import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const dashboard = readFileSync("src/app/(workspace)/countries/ireland-country-dashboard.tsx", "utf8")
const explorer = readFileSync("src/lib/workspace/country-explorer.ts", "utf8")

test("Ireland Country Hub links only published city profiles and the existing city comparison", () => {
  assert.ok(dashboard.includes('ieCityPath(city)'))
  assert.ok(dashboard.includes('buildCityCompareCanonicalHref({ country: "IE" })'))
  assert.ok(dashboard.includes("Compare cities"))
})

test("Ireland regional membership belongs in shared country data, not the Country Hub view", () => {
  assert.match(explorer, /\{ name: "Munster", cities: \["Cork", "Limerick", "Waterford"\] \}/)
  assert.match(explorer, /\{ name: "Connacht", cities: \["Galway", "Sligo", "Castlebar"\] \}/)
  assert.doesNotMatch(dashboard, /region\.name === "Munster"|region\.name === "Connacht"/)
})
