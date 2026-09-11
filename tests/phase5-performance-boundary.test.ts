import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const topNav = readFileSync("src/components/layout/top-nav.tsx", "utf8")
const rootLayout = readFileSync("src/app/layout.tsx", "utf8")
const lighthouseAudit = readFileSync("scripts/lighthouse-release-audit.mjs", "utf8")

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
