import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const compare = read("src/app/(workspace)/compare/page.tsx")
const profile = read("src/components/country-profiles/singapore-study-destination-profile.tsx")
const loader = read("src/lib/destinations/sg-destination-profile.server.ts")

test("SG city compare intent resolves to city-state guidance, not a fabricated city matrix", () => {
  assert.match(compare, /countryCode === "SG"/)
  assert.match(compare, /SingaporeCityStateDecision/)
  assert.match(compare, /There is no Singapore city shortlist to compare/)
  assert.doesNotMatch(compare, /getSgCityComparison/)
})

test("SG decision routes preserve map, living-area and country-compare choices", () => {
  assert.match(compare, /href="\/maps\?country=sg"/)
  assert.match(compare, /\/map\?country=sg&area=central/)
  assert.match(compare, /buildCountryCompareCanonicalHref\(\)/)
  assert.match(profile, /Explore Singapore job signals/)
  assert.match(profile, /Compare living areas/)
})

test("SG destination data remains country scoped", () => {
  assert.match(loader, /study_destination_sg_v1/)
  assert.match(loader, /study_destination_metric_sg_v1/)
  assert.doesNotMatch(loader, /getSgCity/)
  assert.doesNotMatch(loader, /report_metric_evidence_city/)
})
