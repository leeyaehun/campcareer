import type { MetadataRoute } from "next"
import { ROUTE_GUIDES, routeGuideHref } from "@/data/route-guides"
import { AU_PROGRAMMATIC_STUDY_PAGES } from "@/lib/programs/au-programmatic-seo"
import { INDEXABLE_AU_PROGRAMS, indexableAuProgramPath } from "@/lib/programs/program-routes"
import { INDEXABLE_AE_PROGRAM_PATHS } from "@/lib/programs/ae-program-seo"
import { INDEXABLE_KR_PROGRAM_PATHS } from "@/lib/programs/kr-program-seo"
import { INDEXABLE_JP_PROGRAM_PATHS } from "@/lib/programs/jp-program-seo"
import { INDEXABLE_NO_PROGRAM_PATHS } from "@/lib/programs/no-program-seo"
import { INDEXABLE_FI_PROGRAM_PATHS } from "@/lib/programs/fi-program-seo"
import { INDEXABLE_DK_PROGRAM_PATHS } from "@/lib/programs/dk-program-seo"
import { INDEXABLE_SE_PROGRAM_PATHS } from "@/lib/programs/se-program-seo"
import { INDEXABLE_CH_PROGRAM_PATHS } from "@/lib/programs/ch-program-seo"
import { INDEXABLE_BE_PROGRAM_PATHS } from "@/lib/programs/be-program-seo"
import { INDEXABLE_ES_PROGRAM_PATHS } from "@/lib/programs/es-program-seo"
import { INDEXABLE_FR_PROGRAM_PATHS } from "@/lib/programs/fr-program-seo"
import { INDEXABLE_DE_PROGRAM_PATHS } from "@/lib/programs/de-program-seo"
import { INDEXABLE_SG_PROGRAM_PATHS } from "@/lib/programs/sg-program-seo"
import { INDEXABLE_UK_PROGRAM_PATHS } from "@/lib/programs/uk-program-seo"
import { INDEXABLE_NZ_PROGRAM_PATHS } from "@/lib/programs/nz-program-seo"
import { INDEXABLE_NL_PROGRAM_PATHS } from "@/lib/programs/nl-program-seo"
import { AU_OCCUPATION_STATE_PAGES } from "@/lib/workspace/au-occupation-state-seo"
import { INDEXABLE_OCCUPATION_PROFILES, occupationCanonicalPath } from "@/lib/workspace/occupation-routes"
import { getCompletedVisaCatalog } from "@/lib/workspace/visa-catalog-complete"
import { getIndexableVisaRoutes } from "@/lib/workspace/visa-routes"
import { INDEXABLE_AE_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-ae"
import { INDEXABLE_AUTHORITY_FASTPATH_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-authority-fastpath"
import { INDEXABLE_DE_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-de"
import { INDEXABLE_ES_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-es"
import { INDEXABLE_EU_FASTPATH_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-eu-fastpath"
import { INDEXABLE_FR_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-fr"
import { INDEXABLE_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo"
import { INDEXABLE_NL_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-nl"
import { INDEXABLE_NZ_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-nz"
import { INDEXABLE_SG_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-sg"
import { INDEXABLE_UK_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-uk"
import { INDEXABLE_US_INSTITUTION_PATHS } from "@/lib/institutions/institution-seo-us"
import { PUBLISHED_AE_CITY_SLUGS, PUBLISHED_BE_CITY_SLUGS, PUBLISHED_DE_CITY_SLUGS, PUBLISHED_DK_CITY_SLUGS, PUBLISHED_ES_CITY_SLUGS, PUBLISHED_FI_CITY_SLUGS, PUBLISHED_FR_CITY_SLUGS, PUBLISHED_IE_CITY_SLUGS, PUBLISHED_KR_CITY_SLUGS, PUBLISHED_NL_CITY_SLUGS, PUBLISHED_NO_CITY_SLUGS, PUBLISHED_NZ_CITY_SLUGS, PUBLISHED_SE_CITY_SLUGS, PUBLISHED_UK_CITY_SLUGS, PUBLISHED_US_CITY_SLUGS } from "@/lib/cities/city-routes"
import { CANONICAL_COUNTRY_SLUGS, SITE_URL, countryCanonicalPath } from "@/lib/seo-routes.mjs"

const lastModified = new Date("2026-08-10")
const franceCityLastModified = new Date("2026-08-11")
const spainCityLastModified = new Date("2026-08-11")
const norwayCityLastModified = new Date("2026-08-11")
const uaeCityLastModified = new Date("2026-08-12")
const koreaCityLastModified = new Date("2026-08-12")

export default function sitemap(): MetadataRoute.Sitemap {
  const methodologies = ["australia", "canada", "united-states", "united-kingdom", "ireland", "germany", "netherlands", "belgium", "france", "spain", "singapore", "south-korea", "japan", "new-zealand", "norway", "sweden", "denmark", "finland", "switzerland", "united-arab-emirates"]
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, priority: 1, changeFrequency: "weekly" },
    { url: `${SITE_URL}/maps`, lastModified, priority: 0.9, changeFrequency: "daily" },
    { url: `${SITE_URL}/programs`, lastModified, priority: 0.85, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions`, lastModified, priority: 0.85, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/au`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/ca`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/uk`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/nl`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/nz`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/sg`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/de`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/fr`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/es`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/be`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/ch`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/se`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/dk`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/fi`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/no`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/jp`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/kr`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/ae`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    { url: `${SITE_URL}/institutions/us`, lastModified, priority: 0.82, changeFrequency: "weekly" },
    ...CANONICAL_COUNTRY_SLUGS.map((slug) => ({ url: `${SITE_URL}${countryCanonicalPath(slug)}`, lastModified, priority: 0.85, changeFrequency: "monthly" as const })),
    { url: `${SITE_URL}/cities/au/sydney`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/au/melbourne`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/au/brisbane`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/au/perth`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/au/adelaide`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/ca/toronto`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/ca/vancouver`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/ca/montreal`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/ca/ottawa`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/ca/calgary`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/ca/waterloo`, lastModified, priority: 0.78, changeFrequency: "monthly" },
    { url: `${SITE_URL}/cities/ca/edmonton`, lastModified, priority: 0.78, changeFrequency: "monthly" },
    ...PUBLISHED_DE_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/de/${slug}`, lastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_BE_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/be/${slug}`, lastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_FR_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/fr/${slug}`, lastModified: franceCityLastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_ES_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/es/${slug}`, lastModified: spainCityLastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_NO_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/no/${slug}`, lastModified: norwayCityLastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_AE_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/ae/${slug}`, lastModified: uaeCityLastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_KR_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/kr/${slug}`, lastModified: koreaCityLastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_FI_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/fi/${slug}`, lastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_IE_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/ie/${slug}`, lastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_US_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/us/${slug}`, lastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_UK_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/uk/${slug}`, lastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_NZ_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/nz/${slug}`, lastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_NL_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/nl/${slug}`, lastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_SE_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/se/${slug}`, lastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    ...PUBLISHED_DK_CITY_SLUGS.map((slug) => ({ url: `${SITE_URL}/cities/dk/${slug}`, lastModified, priority: 0.8, changeFrequency: "monthly" as const })),
    { url: `${SITE_URL}/methodology`, lastModified, priority: 0.5, changeFrequency: "monthly" },
    ...methodologies.map((slug) => ({ url: `${SITE_URL}/methodology/${slug}`, lastModified, priority: 0.45, changeFrequency: "monthly" as const })),
    { url: `${SITE_URL}/privacy`, lastModified, priority: 0.2, changeFrequency: "yearly" },
    { url: `${SITE_URL}/terms`, lastModified, priority: 0.2, changeFrequency: "yearly" },
  ]
  const programPages: MetadataRoute.Sitemap = [
    ...INDEXABLE_AU_PROGRAMS.map((program) => ({ url: `${SITE_URL}${indexableAuProgramPath(program)}`, lastModified: new Date(program.sourceCheckedAt), priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_AE_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_UK_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_NZ_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_NL_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_KR_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_JP_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_NO_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_FI_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_DK_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_SE_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_CH_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_BE_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_ES_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_FR_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_DE_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
    ...INDEXABLE_SG_PROGRAM_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.74, changeFrequency: "weekly" as const })),
  ]
  const occupationPages: MetadataRoute.Sitemap = INDEXABLE_OCCUPATION_PROFILES.map((profile) => ({ url: `${SITE_URL}${occupationCanonicalPath(profile.countryCode, profile.careerId)}`, lastModified: new Date(profile.sourceCheckedAt), priority: 0.74, changeFrequency: "weekly" as const }))
  const visaPages: MetadataRoute.Sitemap = getIndexableVisaRoutes(getCompletedVisaCatalog()).map((route) => ({ url: `${SITE_URL}${route.path}`, lastModified, priority: 0.7, changeFrequency: "monthly" as const }))
  const studyPages: MetadataRoute.Sitemap = AU_PROGRAMMATIC_STUDY_PAGES.map((page) => ({ url: `${SITE_URL}${page.path}`, lastModified, priority: 0.72, changeFrequency: "weekly" as const }))
  const occupationStatePages: MetadataRoute.Sitemap = AU_OCCUPATION_STATE_PAGES.map((page) => ({ url: `${SITE_URL}${page.path}`, lastModified, priority: 0.71, changeFrequency: "monthly" as const }))
  const institutionPages: MetadataRoute.Sitemap = [
    ...INDEXABLE_INSTITUTION_PATHS,
    ...INDEXABLE_UK_INSTITUTION_PATHS,
    ...INDEXABLE_NL_INSTITUTION_PATHS,
    ...INDEXABLE_NZ_INSTITUTION_PATHS,
    ...INDEXABLE_SG_INSTITUTION_PATHS,
    ...INDEXABLE_DE_INSTITUTION_PATHS,
    ...INDEXABLE_FR_INSTITUTION_PATHS,
    ...INDEXABLE_ES_INSTITUTION_PATHS,
    ...INDEXABLE_EU_FASTPATH_INSTITUTION_PATHS,
    ...INDEXABLE_AUTHORITY_FASTPATH_INSTITUTION_PATHS,
    ...INDEXABLE_AE_INSTITUTION_PATHS,
    ...INDEXABLE_US_INSTITUTION_PATHS,
  ].map((path) => ({ url: `${SITE_URL}${path}`, lastModified, priority: 0.72, changeFrequency: "weekly" as const }))
  const routePages: MetadataRoute.Sitemap = ROUTE_GUIDES.flatMap((guide) => [
    { url: `${SITE_URL}${routeGuideHref(guide)}`, lastModified: new Date(guide.lastVerified), priority: 0.95, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/ko${routeGuideHref(guide)}`, lastModified, priority: 0.9, changeFrequency: "weekly" as const },
  ])
  return Array.from(new Map([...staticPages, ...programPages, ...occupationPages, ...visaPages, ...studyPages, ...occupationStatePages, ...institutionPages, ...routePages].map((entry) => [entry.url, entry])).values())
}
