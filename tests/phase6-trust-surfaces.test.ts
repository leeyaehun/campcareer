import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import sitemap from "../src/app/sitemap"
import { SITE_URL } from "../src/lib/seo-routes.mjs"

test("data policy is a canonical trust page linked from the footer and sitemap", () => {
  const page = readFileSync("src/app/data-policy/page.tsx", "utf8")
  const footer = readFileSync("src/components/layout/site-footer.tsx", "utf8")
  assert.match(page, /path: "\/data-policy"/)
  assert.match(page, /DataIssueReport/)
  assert.match(footer, /href="\/data-policy"/)
  assert.ok(sitemap().some((entry) => entry.url === `${SITE_URL}/data-policy`))
})

test("the consent boundary is the only GA4 mounting point", () => {
  const boundary = readFileSync("src/components/consent-gated-insights.tsx", "utf8")
  const ga = readFileSync("src/components/analytics/google-analytics.tsx", "utf8")
  assert.match(boundary, /<GoogleAnalytics \/>/)
  assert.match(ga, /NEXT_PUBLIC_GA_MEASUREMENT_ID/)
  assert.match(ga, /isGoogleAnalyticsMeasurementId/)
})

test("generic usefulness prompts are not mounted, while explicit data-issue reporting remains available", () => {
  const footer = readFileSync("src/components/layout/site-footer.tsx", "utf8")
  const careerPage = readFileSync("src/app/(workspace)/career/[country]/[career]/page.tsx", "utf8")
  const report = readFileSync("src/components/feedback/data-issue-report.tsx", "utf8")
  assert.doesNotMatch(footer, /PageFeedback|Was this useful|usePathname/)
  assert.doesNotMatch(careerPage, /PageFeedback|Was this useful/)
  assert.match(report, /Report a data issue/)
  assert.match(report, /fetch\("\/api\/v1\/feedback"/)
})

test("Country and City routes no longer show the shared contextual notice", () => {
  const notice = readFileSync("src/components/workspace/contextual-surface-notice.tsx", "utf8")
  assert.doesNotMatch(notice, /COUNTRY CONTEXT|Location gives a career context|pathname === "\/countries"|pathname === "\/cities"/)
  assert.match(notice, /CAREER PATH/)
  assert.match(notice, /SECONDARY ACTION/)
  assert.match(notice, /PATH CONTEXT/)
})
