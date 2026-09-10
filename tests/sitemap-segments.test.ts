import assert from "node:assert/strict"
import test from "node:test"
import sitemap from "../src/app/sitemap"
import { ROUTE_GUIDES, routeGuideHref } from "../src/data/route-guides"
import { CANONICAL_COUNTRY_SLUGS, SITE_URL, countryCanonicalPath } from "../src/lib/seo-routes.mjs"

// Final PR #244 CI validation covers the complete root-level unit suite.
test("the sitemap publishes canonical Home, countries, maps, legal pages, and verified routes", () => {
  const entries = sitemap()
  const urls = entries.map((entry) => entry.url)

  assert.ok(urls.includes(`${SITE_URL}/`))
  assert.equal(urls.includes(`${SITE_URL}/home`), false)
  assert.equal(urls.includes(`${SITE_URL}/ko`), false)
  assert.ok(urls.includes(`${SITE_URL}/maps`))
  for (const slug of CANONICAL_COUNTRY_SLUGS) {
    assert.ok(urls.includes(`${SITE_URL}${countryCanonicalPath(slug)}`))
    assert.equal(urls.includes(`${SITE_URL}/${slug}`), false)
  }
  assert.equal(urls.includes(`${SITE_URL}/sg`), false)
  for (const guide of ROUTE_GUIDES) {
    assert.ok(urls.includes(`${SITE_URL}${routeGuideHref(guide)}`))
    assert.ok(urls.includes(`${SITE_URL}/ko${routeGuideHref(guide)}`))
  }
  assert.equal(urls.some((url) => url.includes("/au/majors/")), false)
  assert.equal(urls.some((url) => url.includes("/roi-explorer")), false)
})
