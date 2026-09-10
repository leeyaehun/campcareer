import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const sitemap = read("src/app/sitemap.ts")
const profile = read("src/components/country-profiles/singapore-study-destination-profile.tsx")
const loader = read("src/lib/destinations/sg-destination-profile.server.ts")
const decision = read("docs/data-foundation/sg-destination-decision-v1.md")

test("Phase 7 keeps Singapore as one city-state destination", () => {
  assert.match(decision, /city-state/i)
  assert.match(decision, /\/compare\?type=city&country=SG/)
  assert.doesNotMatch(sitemap, /`\$\{SITE_URL\}\/sg`/)
})

test("Phase 7 preserves programme verification and eligibility caveats", () => {
  assert.match(loader, /Programme delivery verification pending/)
  assert.match(loader, /Institution or campus presence is never used to infer programme delivery/)
  assert.match(profile, /profile\.programmeCoverage/)
  assert.match(profile, /Eligibility conditions apply/)
  assert.match(profile, /not an unconditional allowance/)
})
