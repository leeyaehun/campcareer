import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { headers } from "next/headers"
import { notFound, permanentRedirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { EntityPageHeader } from "@/components/ui/entity-page"
import { Skeleton } from "@/components/ui/skeleton"
import { localizePath, type Locale } from "@/lib/i18n/config"
import { SITE_URL } from "@/lib/seo-routes.mjs"
import { getPublicCareerPageProfile } from "@/lib/career-data-foundation/public-career-profile-read"
import { getCareerRoute, getIndexableCareerRoute } from "@/lib/workspace/occupation-routes"
import { SCORE_READY_CAREER_PROFILES } from "@/lib/workspace/career-coverage"
import { getLaunchCountry } from "@/data/launch-countries"
import type { OverviewSearchValues } from "../../../home/home-overview-config"
import { CampCareerScoreHero } from "../../campcareer-score-hero"
import { CareerCoreSections } from "../../career-core-sections"
import { CareerResultActions } from "../../career-result-actions"
import { IrelandCareerFutureOutlook } from "../../career-future-outlook"

export const dynamic = "force-dynamic"

type CareerCanonicalPageProps = {
  params: Promise<{ country: string; career: string }>
}

type PublicCareerProfilePromise = ReturnType<typeof getPublicCareerPageProfile>

async function getRouteLocale(): Promise<Locale> {
  const routeLocale = (await headers()).get("x-campcareer-route-locale")
  return routeLocale === "ko" ? "ko" : "en"
}

function metadataCopy(careerName: string, countryName: string, locale: Locale) {
  if (locale === "ko") {
    return {
      title: `${countryName} ${careerName}: 커리어 경로`,
      description: `${countryName}에서 ${careerName}로 진입하기 위한 수요, 보수, 자격 요건, 과정과 일자리 경로를 확인하세요.`,
    }
  }

  return {
    title: `${careerName} in ${countryName}: Career Path`,
    description: `See demand, pay, entry requirements, evidence, study routes and jobs for ${careerName} in ${countryName}.`,
  }
}

export async function generateMetadata({ params }: CareerCanonicalPageProps): Promise<Metadata> {
  const { country, career } = await params
  const route = getCareerRoute(country, career)
  if (!route) return { title: "Career", robots: { index: false, follow: false } }

  const locale = await getRouteLocale()
  const indexable = Boolean(getIndexableCareerRoute(route.country.code, route.career.id))
  const careerName = locale === "ko" ? route.career.labelKo : route.career.label
  const copy = metadataCopy(careerName, route.country.name, locale)
  const canonicalPath = localizePath(route.path, locale)
  const canonicalUrl = `${SITE_URL}${canonicalPath}`

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: route.path,
        ko: localizePath(route.path, "ko"),
        "x-default": route.path,
      },
    },
    robots: {
      index: indexable,
      follow: true,
      googleBot: {
        index: indexable,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: "CampCareer",
      locale: locale === "ko" ? "ko_KR" : "en_US",
      title: copy.title,
      description: copy.description,
      images: [{
        url: "/og-career-path.png",
        width: 1200,
        height: 630,
        alt: `${careerName} in ${route.country.name} — CampCareer`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: ["/og-career-path.png"],
    },
  }
}

function CareerScoreFallback() {
  return (
    <div className="mt-8 border-t border-campcareer-border pt-6" aria-hidden="true">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-16 w-40" />
      <Skeleton className="mt-6 h-16" />
    </div>
  )
}

function CareerSectionsFallback() {
  return (
    <div className="mt-8 space-y-4" aria-hidden="true">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

async function CareerScoreContent({
  profilePromise,
  query,
  locale,
}: {
  profilePromise: PublicCareerProfilePromise
  query: OverviewSearchValues
  locale: Locale
}) {
  const profile = await profilePromise
  if (!profile?.country) notFound()

  return (
    <CampCareerScoreHero
      query={query}
      locale={locale}
      initialInsight={profile.compatibility}
      embedded
      showHeader={false}
    />
  )
}

async function CareerSectionsContent({
  profilePromise,
  query,
  locale,
}: {
  profilePromise: PublicCareerProfilePromise
  query: OverviewSearchValues
  locale: Locale
}) {
  const profile = await profilePromise
  if (!profile?.country) notFound()

  return (
    <CareerCoreSections
      query={query}
      locale={locale}
      initialInsight={profile.compatibility}
    />
  )
}

export default async function CareerCanonicalPage({ params }: CareerCanonicalPageProps) {
  const { country, career } = await params
  const route = getCareerRoute(country, career)
  if (!route) notFound()

  const locale = await getRouteLocale()
  const canonicalPath = localizePath(route.path, locale)
  if (country !== route.country.slug || career !== route.career.id) {
    permanentRedirect(canonicalPath)
  }

  const query: OverviewSearchValues = { country: route.country.code, occupation: route.career.id }
  const profilePromise = getPublicCareerPageProfile(route.country.code, route.career.id)
  const careerName = locale === "ko" ? route.career.labelKo : route.career.label
  const copy = metadataCopy(careerName, route.country.name, locale)
  const canonicalUrl = `${SITE_URL}${canonicalPath}`
  const countryUrl = `${SITE_URL}/countries/${route.country.code.toLowerCase()}`
  const countryContextPath = route.country.code === "IE" ? "/countries/ie" : countryUrl.replace(SITE_URL, "")
  const careersContextPath = `/careers?country=${route.country.code}`
  const availableCountries = SCORE_READY_CAREER_PROFILES
    .filter((profile) => profile.careerId === route.career.id)
    .map((profile) => ({
      code: profile.countryCode,
      country: getLaunchCountry(profile.countryCode),
      isCurrent: profile.countryCode === route.country.code,
    }))
    .filter((entry) => entry.country)
    .sort((a, b) => (a.isCurrent ? -1 : b.isCurrent ? 1 : 0))

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: copy.title,
        description: copy.description,
        inLanguage: locale === "ko" ? "ko-KR" : "en",
        about: { "@id": `${canonicalUrl}#occupation` },
      },
      {
        "@type": "Occupation",
        "@id": `${canonicalUrl}#occupation`,
        name: careerName,
        description: copy.description,
        occupationLocation: {
          "@type": "Country",
          name: route.country.name,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "CampCareer",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: route.country.name,
            item: countryUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: careerName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div>
        <nav aria-label="Career context" className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-campcareer-muted">
          <Link href={countryContextPath} prefetch={false} className="inline-flex items-center gap-1.5 rounded-cc-control px-2.5 py-2 transition-colors duration-cc-fast hover:bg-brand-tint hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            <ArrowLeft className="size-4" /> {locale === "ko" ? `${route.country.name}(으)로 돌아가기` : `Back to ${route.country.name}`}
          </Link>
          <Link href={careersContextPath} prefetch={false} className="rounded-cc-control px-2.5 py-2 transition-colors duration-cc-fast hover:bg-brand-tint hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            {locale === "ko" ? `${route.country.name} 커리어` : `Browse ${route.country.name} careers`}
          </Link>
        </nav>

        <section className="mt-6 rounded-cc-large border border-campcareer-border bg-campcareer-surface px-5 py-6 shadow-cc-surface sm:px-8 sm:py-8" aria-labelledby="career-heading">
          <EntityPageHeader title={careerName} titleId="career-heading" subtitle={route.country.name} />
          <p className="mt-4 max-w-xl text-sm leading-6 text-campcareer-ink-secondary sm:text-base sm:leading-7">
            {locale === "ko"
              ? `${route.country.name}에서 수요, 보수와 진입 요건의 근거를 확인하세요.`
              : `Compare demand, pay and entry evidence for this career in ${route.country.name}.`}
          </p>
          <Suspense fallback={<CareerScoreFallback />}>
            <CareerScoreContent profilePromise={profilePromise} query={query} locale={locale} />
          </Suspense>
        </section>

        {availableCountries.length > 1 ? (
          <section className="mt-6" aria-label={locale === "ko" ? "이 커리어를 둘러볼 수 있는 국가" : "Explore this career by country"}>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-campcareer-muted">
              {locale === "ko" ? "국가" : "Countries"}
            </p>
            <h2 className="mt-2 text-sm font-semibold text-campcareer-ink">
              {locale === "ko"
                ? `다른 국가에서 ${careerName} 살펴보기`
                : `Explore ${careerName} in other countries`}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableCountries.map((entry) => (
                entry.country ? (
                  <Link
                    key={entry.code}
                    href={localizePath(`/career/${entry.country.slug}/${route.career.id}`, locale)}
                    prefetch={false}
                    className={`inline-flex min-h-9 items-center rounded-cc-control px-3 text-sm font-semibold transition-colors duration-cc-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                      entry.isCurrent
                        ? "border border-brand bg-brand-tint text-brand"
                        : "border border-campcareer-border bg-campcareer-surface text-campcareer-ink hover:border-brand/40 hover:bg-brand-tint"
                    }`}
                  >
                    {entry.country.name}
                  </Link>
                ) : null
              ))}
            </div>
          </section>
        ) : null}

        {route.country.code === "IE" ? (
          <IrelandCareerFutureOutlook countryCode={route.country.code} careerId={route.career.id} locale={locale} />
        ) : null}

        <Suspense fallback={<CareerSectionsFallback />}>
          <CareerSectionsContent profilePromise={profilePromise} query={query} locale={locale} />
        </Suspense>

        <CareerResultActions query={query} locale={locale} />
      </div>
    </>
  )
}
