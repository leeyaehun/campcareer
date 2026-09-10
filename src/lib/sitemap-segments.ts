import type { MetadataRoute } from "next"
import { LAUNCH_COUNTRIES, getLaunchCountry } from "@/data/launch-countries"

const BASE = "https://www.campcareer.com"

export const SITEMAP_SEGMENTS = [
  "core-en",
  "core-ko",
  "countries-en",
  "fields-en",
  "fields-ko",
  "careers",
  "schools",
  "regional-maps",
  "blog-en",
] as const

export type SitemapSegment = (typeof SITEMAP_SEGMENTS)[number]

export function isSitemapSegment(value: string): value is SitemapSegment {
  return SITEMAP_SEGMENTS.includes(value as SitemapSegment)
}

export async function getSitemapSegment(segment: SitemapSegment): Promise<MetadataRoute.Sitemap> {
  const { default: buildLegacySitemap } = await import("@/app/sitemap")
  const entries = await buildLegacySitemap()
  return entries.filter((entry) => belongsToSegment(new URL(entry.url).pathname, segment))
}

/** Country files are intentionally independent from broad legacy segments. */
export async function getCountrySitemap(countryCode: string): Promise<MetadataRoute.Sitemap | null> {
  const country = getLaunchCountry(countryCode)
  if (!country || country.publicationStage === "REVIEW_REQUIRED") return null

  const { default: buildLegacySitemap } = await import("@/app/sitemap")
  const entries = await buildLegacySitemap()
  const shortCode = country.code.toLowerCase()
  return entries.filter((entry) => belongsToCountrySitemap(new URL(entry.url).pathname, shortCode))
}

export function sitemapIndexXml(lastModified = "2026-07-12") {
  const segments = [
    ...SITEMAP_SEGMENTS.map((segment) => ({ loc: `${BASE}/sitemaps/${segment}.xml` })),
    ...LAUNCH_COUNTRIES
      .filter((country) => country.publicationStage !== "REVIEW_REQUIRED")
      .map((country) => ({ loc: `${BASE}/sitemaps/country-${country.code.toLowerCase()}.xml` })),
  ]
  const rows = segments.map(({ loc }) => [
    "  <sitemap>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastModified}</lastmod>`,
    "  </sitemap>",
  ].join("\n")).join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</sitemapindex>\n`
}

function belongsToCountrySitemap(pathname: string, code: string) {
  return pathname === `/${code}` || pathname === `/${code}/jobs` ||
    pathname.startsWith(`/maps/${code}/`) || pathname.startsWith(`/map/${code}/`)
}

export function urlSetXml(entries: MetadataRoute.Sitemap) {
  const rows = entries.map((entry) => {
    const lastModified = entry.lastModified instanceof Date
      ? entry.lastModified.toISOString()
      : entry.lastModified
    return [
      "  <url>",
      `    <loc>${escapeXml(entry.url)}</loc>`,
      ...(lastModified ? [`    <lastmod>${escapeXml(String(lastModified))}</lastmod>`] : []),
      "  </url>",
    ].join("\n")
  }).join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`
}

export function belongsToSegment(pathname: string, segment: SitemapSegment) {
  switch (segment) {
    case "core-ko":
      return pathname === "/ko/fr"
    case "fields-ko":
      return pathname.startsWith("/ko/fields/")
    case "fields-en":
      return pathname.startsWith("/fields/") || /^\/countries\/[^/]+\/fields\//.test(pathname)
    case "countries-en":
      return /^\/countries\/[^/]+$/.test(pathname) || /^\/(au|be|ca|de|dk|es|fi|fr|ie|kr|nl|no|nz|se|sg|uk|us)(\/jobs)?$/.test(pathname)
    case "careers":
      return pathname.startsWith("/maps/") && !pathname.includes("/regions/") && !pathname.includes("/cities/") && !pathname.includes("/areas/") && !pathname.includes("/prefectures/")
    case "schools":
      return pathname.includes("/university/") || pathname.includes("/language-schools")
    case "regional-maps":
      return (pathname.startsWith("/map/") && !pathname.includes("/university/")) || /\/(regions|cities|areas|prefectures|provinces)\//.test(pathname)
    case "blog-en":
      return pathname === "/blog" || pathname.startsWith("/blog/")
    case "core-en":
      return ["/", "/maps", "/roi-explorer", "/degree-risk", "/methodology", "/privacy", "/terms"].includes(pathname)
  }
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}
