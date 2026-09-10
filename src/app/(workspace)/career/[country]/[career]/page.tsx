import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound, permanentRedirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { localizePath, type Locale } from "@/lib/i18n/config"
import { SITE_URL } from "@/lib/seo-routes.mjs"
import { getPublicCareerProfile } from "@/lib/career-data-foundation/public-career-profile-read"
import { getCareerRoute, getIndexableCareerRoute } from "@/lib/workspace/occupation-routes"
import { CampCareerScoreHero } from "../../campcareer-score-hero"
import { CareerCoreSections } from "../../career-core-sections"
import { CareerResultActions } from "../../career-result-actions"

export const dynamic = "force-dynamic"

type CareerCanonicalPageProps = {
  params: Promise<{ country: string; career: string }>
}

const verdictLabel = {
  excellent: "Excellent",
  strong: "Strong",
  mixed: "Mixed",
  challenging: "Challenging",
  tough: "Tough",
} as const

async function getRouteLocale(): Promise<Locale> {
  const routeLocale = (await headers()).get("x-campcareer-route-locale")
  return routeLocale === "ko" ? "ko" : "en"
}

function getScore(profile: Awaited<ReturnType<typeof getPublicCareerProfile>>) {
  return profile?.score ?? null
}

function metadataCopy(
  careerName: string,
  countryName: string,
  score: NonNullable<ReturnType<typeof getScore>> | null,
  locale: Locale,
) {
  if (locale === "ko") {
    return score
      ? {
          title: `${countryName} ${careerName}: CampCareer Score ${score.total}`,
          description: `${countryName} ${careerName}의 CampCareer Score는 ${score.total}/100 (${verdictLabel[score.verdict]})입니다. 수요, 보수, 진입 요건, 근거, 과정과 일자리 경로를 확인하세요.`,
        }
      : {
          title: `${countryName} ${careerName}: 커리어 경로`,
          description: `${countryName}에서 ${careerName}로 진입하기 위한 수요, 보수, 자격 요건, 과정과 일자리 경로를 확인하세요.`,
        }
  }

  return score
    ? {
        title: `${careerName} in ${countryName}: CampCareer Score ${score.total}`,
        description: `CampCareer Score ${score.total}/100 (${verdictLabel[score.verdict]}) for ${careerName} in ${countryName}. See demand, pay, entry requirements, evidence, study routes and jobs.`,
      }
    : {
        title: `${careerName} in ${countryName}: Career Path`,
        description: `See demand, pay, entry requirements, evidence, study routes and jobs for ${careerName} in ${countryName}.`,
      }
}

export async function generateMetadata({ params }: CareerCanonicalPageProps): Promise<Metadata> {
  const { country, career } = await params
  const route = getCareerRoute(country, career)
  if (!route) return { title: "Career", robots: { index: false, follow: false } }

  const [locale, profile] = await Promise.all([
    getRouteLocale(),
    getPublicCareerProfile(route.country.code, route.career.id),
  ])
  const score = getScore(profile)
  const indexable = Boolean(getIndexableCareerRoute(route.country.code, route.career.id) && score)
  const careerName = locale === "ko" ? route.career.labelKo : route.career.label
  const copy = metadataCopy(careerName, route.country.name, score, locale)
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

export default async function CareerCanonicalPage({ params }: CareerCanonicalPageProps) {
  const { country, career } = await params
  const route = getCareerRoute(country, career)
  if (!route) notFound()

  const locale = await getRouteLocale()
  const canonicalPath = localizePath(route.path, locale)
  if (country !== route.country.slug || career !== route.career.id) {
    permanentRedirect(canonicalPath)
  }

  const profile = await getPublicCareerProfile(route.country.code, route.career.id)
  if (!profile?.country) notFound()

  const query = { country: route.country.code, occupation: route.career.id }
  const score = getScore(profile)
  const careerName = locale === "ko" ? route.career.labelKo : route.career.label
  const copy = metadataCopy(careerName, route.country.name, score, locale)
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
      <main className="cc-result-motion min-h-[calc(100vh-4rem)] bg-white px-4 pb-16 pt-5 sm:px-8 sm:pt-8">
        <div className="mx-auto max-w-5xl">
          <Link href={localizePath("/", locale)} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-campcareer-muted transition-colors hover:bg-[hsl(var(--brand-tint))] hover:text-brand">
            <ArrowLeft className="size-4" /> {locale === "ko" ? "다시 검색하기" : "Search again"}
          </Link>
          <CampCareerScoreHero
            key={`score-${route.country.code}-${route.career.id}`}
            query={query}
            locale={locale}
            initialInsight={profile.compatibility}
          />
          <CareerCoreSections
            key={`sections-${route.country.code}-${route.career.id}`}
            query={query}
            locale={locale}
            initialInsight={profile.compatibility}
          />
          <CareerResultActions query={query} locale={locale} />
        </div>
      </main>
    </>
  )
}
