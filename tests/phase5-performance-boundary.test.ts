import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const topNav = readFileSync("src/components/layout/top-nav.tsx", "utf8")
const rootLayout = readFileSync("src/app/layout.tsx", "utf8")
const lighthouseAudit = readFileSync("scripts/lighthouse-release-audit.mjs", "utf8")
const analyticsConsent = readFileSync("src/components/analytics-consent.tsx", "utf8")
const countryDashboard = readFileSync("src/app/(workspace)/countries/country-dashboard-shell.tsx", "utf8")
const careerFoundationRead = readFileSync("src/lib/career-data-foundation/read.ts", "utf8")

test("global navigation defers the Supabase browser client until after initial load", () => {
  assert.doesNotMatch(topNav, /import\s+\{\s*createClient\s*\}\s+from\s+["']@\/lib\/supabase-client["']/)
  assert.match(topNav, /await import\(["']@\/lib\/supabase-client["']\)/)
  assert.match(topNav, /window\.addEventListener\(["']load["']/)
})

test("the global mono font is not preloaded on every route", () => {
  assert.match(rootLayout, /geistMono\s*=\s*localFont\([\s\S]*?preload:\s*false/)
})

test("the Phase 5 Lighthouse audit preserves the representative route set and LCP budget", () => {
  for (const route of [
    "/",
    "/careers",
    "/career/australia/registered-nurse",
    "/countries/au",
    "/programs/au/1-bachelor-of-arts",
    "/institutions/au/australian-catholic-university",
    "/sources",
  ]) {
    assert.ok(lighthouseAudit.includes(`"${route}"`), `missing Lighthouse route: ${route}`)
  }
  assert.match(lighthouseAudit, /LIGHTHOUSE_LCP_BUDGET_MS\s*\?\?\s*["']2500["']/)
})


test("consent prompt is present in initial HTML and returning visitors are hidden before paint", () => {
  assert.match(analyticsConsent, /useState\(true\)/)
  assert.match(analyticsConsent, /id=["']cc-analytics-consent["']/)
  assert.match(rootLayout, /cc_analytics_consent=/)
  assert.match(rootLayout, /dataset\.ccAnalyticsConsent\s*=\s*["']set["']/)
})

test("country hero exposes its LCP image with high browser fetch priority", () => {
  assert.match(countryDashboard, /fetchPriority=["']high["']/)
  assert.doesNotMatch(countryDashboard, /style=\{\{\s*backgroundImage:/)
})

test("career foundation reads are deduplicated with primitive cache keys", () => {
  assert.match(careerFoundationRead, /cache\(\(countryCode: string, careerId: string\)/)
  assert.match(careerFoundationRead, /getCareerDataFoundationCached\(countryCode\.trim\(\)\.toUpperCase\(\), careerId\)/)
})
