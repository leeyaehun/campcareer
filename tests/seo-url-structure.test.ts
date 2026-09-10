import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import nextConfig from "../next.config.mjs"
import robots from "../src/app/robots"
import sitemap from "../src/app/sitemap"
import {
  CANONICAL_COUNTRY_SLUGS,
  HOME_CANONICAL_PATH,
  LEGACY_SEO_REDIRECTS,
  SITE_URL,
  countryCanonicalPath,
  isLegacyGonePath,
  programsCanonicalPath,
} from "../src/lib/seo-routes.mjs"

function sitemapUrls() {
  return sitemap().map((entry) => entry.url)
}

test("the canonical home is root and retired /home stays out of the sitemap", () => {
  const urls = sitemapUrls()
  const homeSource = readFileSync("src/app/page.tsx", "utf8")

  assert.equal(HOME_CANONICAL_PATH, "/")
  assert.ok(homeSource.includes("alternates: { canonical: HOME_CANONICAL_PATH }"))
  assert.ok(urls.includes(`${SITE_URL}/`))
  assert.ok(!urls.includes(`${SITE_URL}/home`))
})

test("country sitemap entries use /countries/{code}, with /sg retained as the active Singapore destination", () => {
  const urls = sitemapUrls()

  for (const slug of CANONICAL_COUNTRY_SLUGS) {
    assert.ok(urls.includes(`${SITE_URL}${countryCanonicalPath(slug)}`))
    if (slug === "sg") {
      assert.ok(urls.includes(`${SITE_URL}/sg`))
    } else {
      assert.ok(!urls.includes(`${SITE_URL}/${slug}`))
    }
  }
})

test("each country page declares the same canonical URL format", () => {
  for (const slug of CANONICAL_COUNTRY_SLUGS) {
    const source = readFileSync(`src/app/(workspace)/countries/${slug}/page.tsx`, "utf8")
    assert.ok(
      source.includes(`alternates: { canonical: "/countries/${slug}" }`),
      `${slug} must self-canonicalize to ${countryCanonicalPath(slug)}`,
    )
  }
})

test("legacy redirect sources never appear in the sitemap and targets do", () => {
  const urls = new Set(sitemapUrls())

  for (const redirect of LEGACY_SEO_REDIRECTS) {
    assert.ok(!urls.has(`${SITE_URL}${redirect.source}`))
    assert.ok(urls.has(redirect.destination === "/" ? `${SITE_URL}/` : `${SITE_URL}${redirect.destination}`))
    assert.equal(redirect.permanent, true)
  }
  assert.ok(urls.has(`${SITE_URL}/sg`))
})

test("Next redirects wire the centralized permanent SEO registry before broad legacy rules", async () => {
  const redirectsFactory = nextConfig.redirects
  if (!redirectsFactory) {
    throw new Error("next.config.mjs must define redirects")
  }

  const redirects = await redirectsFactory()

  assert.deepEqual(redirects.slice(0, LEGACY_SEO_REDIRECTS.length), [...LEGACY_SEO_REDIRECTS])
  assert.ok(!redirects.some((redirect) => redirect.source === "/" && redirect.destination === "/home"))
  assert.ok(redirects.some((redirect) => redirect.source === "/home/:path*" && redirect.destination === "/"))
  assert.ok(redirects.some((redirect) => redirect.source === "/fifo/:path*" && redirect.destination === "/"))
})

test("legacy country roots redirect permanently except the active /sg destination", () => {
  for (const slug of CANONICAL_COUNTRY_SLUGS) {
    const redirect = LEGACY_SEO_REDIRECTS.find((entry) => entry.source === `/${slug}`)
    if (slug === "sg") {
      assert.equal(redirect, undefined)
      continue
    }
    assert.deepEqual(
      redirect,
      { source: `/${slug}`, destination: countryCanonicalPath(slug), permanent: true },
    )
  }
})

test("sitemap URLs are unique and the Programs base canonical matches the sitemap", () => {
  const urls = sitemapUrls()
  const programsSource = readFileSync("src/app/(workspace)/programs/page.tsx", "utf8")

  assert.equal(new Set(urls).size, urls.length)
  assert.equal(programsCanonicalPath("AU"), "/programs")
  assert.ok(programsSource.includes("programsCanonicalPath(filters.country)"))
  assert.ok(urls.includes(`${SITE_URL}${programsCanonicalPath("AU")}`))
})

test("robots includes the production root sitemap without blocking canonical country pages", () => {
  const value = robots()
  const sitemapReferences = Array.isArray(value.sitemap) ? value.sitemap : [value.sitemap]

  assert.ok(sitemapReferences.includes(`${SITE_URL}/sitemap.xml`))
  assert.ok(!JSON.stringify(value.rules).includes("/countries"))
})

test("only verified retired URL families are treated as gone", () => {
  assert.equal(isLegacyGonePath("/2021/05/old-post"), true)
  assert.equal(isLegacyGonePath("/category/old"), true)
  assert.equal(isLegacyGonePath("/jobs/old-card"), true)
  assert.equal(isLegacyGonePath("/countries/au"), false)
  assert.equal(isLegacyGonePath("/programs"), false)
})
