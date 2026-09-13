import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { COMPARE_MODE_NAV_ITEMS, resolveCompareModeType } from "../src/lib/compare-navigation"

test("Compare type navigation keeps all four working modes under root compare", () => {
  assert.deepEqual(
    COMPARE_MODE_NAV_ITEMS,
    [
      { type: "program", label: "Programs", href: "/compare?type=program&country=AU&field=nursing" },
      { type: "country", label: "Countries", href: "/compare?type=country&goal=registered-nurse&profile=starting-from-scratch" },
      { type: "city", label: "Cities", href: "/compare?type=city&country=AU" },
      { type: "career", label: "Careers", href: "/compare?type=career&country=AU&profile=starting-from-scratch" },
    ],
  )
})

test("Compare sidebar navigation keeps one stable item per supported type", () => {
  assert.equal(new Set(COMPARE_MODE_NAV_ITEMS.map((item) => item.type)).size, 4)
  assert.equal(new Set(COMPARE_MODE_NAV_ITEMS.map((item) => item.href)).size, 4)
  assert.ok(COMPARE_MODE_NAV_ITEMS.every((item) => item.href.startsWith("/compare?")))
  assert.deepEqual(COMPARE_MODE_NAV_ITEMS.map((item) => item.type), ["program", "country", "city", "career"])
  assert.ok(!COMPARE_MODE_NAV_ITEMS.some((item) => ["degree", "institution", "employer"].includes(item.type)))
})

test("query type resolver accepts Cities as a first-class mode", () => {
  assert.equal(resolveCompareModeType(null), "program")
  assert.equal(resolveCompareModeType("program"), "program")
  assert.equal(resolveCompareModeType("country"), "country")
  assert.equal(resolveCompareModeType("city"), "city")
  assert.equal(resolveCompareModeType("career"), "career")
  assert.equal(resolveCompareModeType("cities"), "unsupported")
})

test("legacy city compare route redirects to root Compare and is not in the sitemap", () => {
  const legacyRoute = readFileSync("src/app/(workspace)/cities/au/compare/page.tsx", "utf8")
  const sitemapSource = readFileSync("src/app/sitemap.ts", "utf8")

  assert.ok(legacyRoute.includes("buildCityCompareCanonicalHref"))
  assert.ok(!sitemapSource.includes("/cities/au/compare"))
})

test("root compare renders modes and mode subpaths only redirect for compatibility", () => {
  const rootRoute = readFileSync("src/app/(workspace)/compare/page.tsx", "utf8")
  const legacyModeRoute = readFileSync("src/app/(workspace)/compare/[mode]/page.tsx", "utf8")
  const compareHeader = readFileSync("src/app/(workspace)/compare/compare-mode-navigation.tsx", "utf8")
  const contextualNotice = readFileSync("src/components/workspace/contextual-surface-notice.tsx", "utf8")

  assert.ok(rootRoute.includes("resolveCompareModeType"))
  assert.ok(rootRoute.includes("getAuCityComparison"))
  assert.ok(rootRoute.includes("getCaCityComparison"))
  assert.ok(legacyModeRoute.includes("permanentRedirect"))
  assert.ok(legacyModeRoute.includes("buildCityCompareCanonicalHref"))
  assert.ok(compareHeader.includes('aria-label={locale === "ko" ? "비교 유형" : "Comparison type"}'))
  assert.ok(compareHeader.includes("href={item.href}"))
  assert.ok(!compareHeader.includes("SECONDARY DECISION"))
  assert.ok(!contextualNotice.includes("Compare a decision, not everything"))
  assert.ok(rootRoute.includes("robots: { index: false, follow: false }"))
})
