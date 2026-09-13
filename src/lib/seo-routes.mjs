export const SITE_URL = "https://www.campcareer.com"
export const HOME_CANONICAL_PATH = "/"

export const CANONICAL_COUNTRY_SLUGS = Object.freeze([
  "au",
  "ca",
  "us",
  "uk",
  "ie",
  "de",
  "nl",
  "be",
  "fr",
  "es",
  "sg",
  "kr",
  "jp",
  "nz",
  "no",
  "se",
  "dk",
  "fi",
  "ch",
  "ae",
])

export function countryCanonicalPath(slug) {
  const normalized = String(slug).toLowerCase()
  if (!CANONICAL_COUNTRY_SLUGS.includes(normalized)) {
    throw new Error(`Unsupported canonical country slug: ${slug}`)
  }
  return `/countries/${normalized}`
}

export function programsCanonicalPath(countryCode = "AU") {
  const normalized = String(countryCode).toUpperCase()
  return normalized === "AU" ? "/programs" : `/programs?country=${encodeURIComponent(normalized)}`
}

// Exact legacy routes with a verified replacement. Keep these separate from
// broad retired funnels so permanent SEO redirects never swallow active child routes.
// /sg is an active Singapore study-destination root, so it is intentionally not legacy.
const LEGACY_AU_INDEXABLE_CAREER_SLUGS = Object.freeze([
  "care-worker",
  "carpenter",
  "electrician",
  "medical-laboratory-technician",
  "midwife",
  "occupational-therapist",
  "pharmacist",
  "physiotherapist",
  "radiographer",
  "registered-nurse",
  "welder",
])

export const LEGACY_SEO_REDIRECTS = Object.freeze([
  // Preserve the strongest legacy Australia job intent where a reviewed
  // canonical Career replacement is already indexable.
  ...LEGACY_AU_INDEXABLE_CAREER_SLUGS.map((careerId) => ({
    source: `/au/jobs/${careerId}`,
    destination: `/career/australia/${careerId}`,
    permanent: true,
  })),
  { source: "/au/jobs", destination: "/careers", permanent: true },

  // Old ROI detail URLs carried country-level education intent. The retired
  // UUID route cannot be reconstructed safely, so consolidate it into the
  // corresponding canonical Country hub instead of the homepage.
  ...CANONICAL_COUNTRY_SLUGS.map((slug) => ({
    source: `/roi-explorer/${slug}/:path*`,
    destination: countryCanonicalPath(slug),
    permanent: true,
  })),
  { source: "/roi-explorer", destination: "/careers", permanent: true },

  ...CANONICAL_COUNTRY_SLUGS.filter((slug) => slug !== "sg").map((slug) => ({
    source: `/${slug}`,
    destination: countryCanonicalPath(slug),
    permanent: true,
  })),

  // Retired country sub-routes must never collapse to the homepage. When no
  // exact replacement is known, the canonical Country hub is the closest
  // durable, indexable destination.
  ...CANONICAL_COUNTRY_SLUGS.filter((slug) => slug !== "sg").map((slug) => ({
    source: `/${slug}/:path*`,
    destination: countryCanonicalPath(slug),
    permanent: true,
  })),
])

// Verified URL families that have no replacement. Do not add a pattern here
// unless the matching URLs are known to be permanently retired.
export const LEGACY_GONE_PATTERNS = Object.freeze([
  /^\/\d{4}\/\d{2}(\/|$)/,
  /^\/category(\/|$)/,
  /^\/tag(\/|$)/,
  /^\/author(\/|$)/,
  /^\/page\/\d+(\/|$)/,
  /^\/feed(\/|$)/,
  /^\/comments\/feed(\/|$)/,
  /^\/sample-page(\/|$)/,
  /^\/jobs?(\/|$)/,
])

export function isLegacyGonePath(pathname) {
  return LEGACY_GONE_PATTERNS.some((pattern) => pattern.test(pathname))
}
