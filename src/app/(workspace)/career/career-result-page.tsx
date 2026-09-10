"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { localizePath } from "@/lib/i18n/config"
import { getOverviewSearchQuery } from "../home/home-overview-config"
import { CampCareerScoreHero } from "./campcareer-score-hero"
import { CareerCoreSections } from "./career-core-sections"
import { CareerResultActions } from "./career-result-actions"

export function CareerResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useRouteLocale()
  const query = getOverviewSearchQuery(searchParams)

  useEffect(() => {
    if (!query) router.replace("/")
  }, [query, router])

  if (!query) return <main className="min-h-[calc(100vh-4rem)] bg-white" />

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-campcareer-surface px-4 pb-16 pt-5 sm:px-8 sm:pt-8">
      <div className="mx-auto max-w-5xl">
        <Link href={localizePath("/", locale)} className="inline-flex min-h-10 items-center gap-1.5 rounded-cc-control px-2.5 text-sm font-semibold text-campcareer-muted transition-colors duration-cc-fast hover:bg-brand-tint hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
          <ArrowLeft className="size-4" /> {locale === "ko" ? "다시 검색하기" : "Search again"}
        </Link>
        <CampCareerScoreHero query={query} locale={locale} />
        <CareerCoreSections query={query} locale={locale} />
        <CareerResultActions query={query} locale={locale} />
      </div>
    </main>
  )
}
