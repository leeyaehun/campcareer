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
import type { OverviewSearchValues } from "../../../home/home-overview-config"
import { CampCareerScoreHero } from "../../campcareer-score-hero"
import { CareerCoreSections } from "../../career-core-sections"
import { CareerResultActions } from "../../career-result-actions"

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
      <main className="min-h-[calc(100vh-4rem)] bg-campcareer-surface px-4 pb-16 pt-5 sm:px-8 sm:pt-8">
        <div className="mx-auto max-w-5xl">
          <Link href={localizePath("/", locale)} prefetch={false} className="inline-flex min-h-10 items-center gap-1.5 rounded-cc-control px-2.5 text-sm font-semibold text-campcareer-muted transition-colors duration-cc-fast hover:bg-brand-tint hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            <ArrowLeft className="size-4" /> {locale === "ko" ? "다시 검색하기" : "Search again"}
          </Link>

          <section className="mt-6 rounded-cc-large border border-campcareer-border bg-campcareer-surface px-5 py-6 shadow-cc-surface sm:px-8 sm:py-8" aria-labelledby="career-heading">
            <EntityPageHeader title={careerName} titleId="career-heading" subtitle={route.country.name} />
            <p className="mt-4 max-w-2xl text-base leading-7 text-campcareer-ink-secondary">
              {locale === "ko"
                ? `${route.country.name}에서 이 커리어의 수요, 보수와 진입 요건을 근거와 함께 확인하세요.`
                : `See the evidence behind demand, pay and entry requirements for this career in ${route.country.name}.`}
            </p>
            <Suspense fallback={<CareerScoreFallback />}>
              <CareerScoreContent profilePromise={profilePromise} query={query} locale={locale} />
            </Suspense>
          </section>

          <Suspense fallback={<CareerSectionsFallback />}>
            <CareerSectionsContent profilePromise={profilePromise} query={query} locale={locale} />
          </Suspense>

          <CareerResultActions query={query} locale={locale} />
        </div>
      </main>
    </>
  )
}
