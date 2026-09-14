"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CountryPill } from "@/components/workspace/country-pill"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { COMPARE_MODE_NAV_ITEMS, type CompareModeType } from "@/lib/compare-navigation"
import {
  buildCareerCompareCanonicalHref,
  buildCityCompareCanonicalHref,
  buildProgramCompareCanonicalHref,
} from "@/lib/compare-routes"

export { COMPARE_MODE_NAV_ITEMS }

type ComparePageHeaderProps = {
  activeType: CompareModeType
  countryCode?: string | null
}

const TITLE: Record<CompareModeType, { en: string; ko: string }> = {
  program: { en: "Compare programs", ko: "프로그램 비교" },
  country: { en: "Compare countries", ko: "국가 비교" },
  city: { en: "Compare cities", ko: "도시 비교" },
  career: { en: "Compare careers", ko: "커리어 비교" },
}

export function ComparePageHeader({ activeType, countryCode }: ComparePageHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useRouteLocale()
  const showCountry = activeType === "career" || activeType === "city"
  const resolvedCountry = countryCode?.toUpperCase() || "AU"
  const title = TITLE[activeType]

  function updateCountry(code: string | null) {
    if (!code) return

    if (activeType === "city") {
      router.replace(buildCityCompareCanonicalHref({ country: code }), { scroll: false })
      return
    }

    if (activeType === "career") {
      router.replace(
        buildCareerCompareCanonicalHref({
          country: code,
          profile: searchParams.get("profile") ?? undefined,
          city: searchParams.get("city"),
          careers: (searchParams.get("careers") ?? "").split(",").filter(Boolean),
        }),
        { scroll: false },
      )
      return
    }

    router.replace(buildProgramCompareCanonicalHref(), { scroll: false })
  }

  return (
    <header className="mb-5 border-b border-[hsl(var(--cc-border))] pb-4">
      <div className="flex min-h-10 flex-wrap items-center gap-3">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-[hsl(var(--cc-ink))] sm:text-3xl">
          {locale === "ko" ? "비교" : "Compare"}
        </h1>
        {showCountry ? (
          <CountryPill value={resolvedCountry} allowAll={false} onChange={updateCountry} />
        ) : null}
      </div>
      <nav aria-label={locale === "ko" ? "비교 유형" : "Comparison type"} className="mt-4 flex flex-wrap gap-2">
        {COMPARE_MODE_NAV_ITEMS.map((item) => (
          <Link
            key={item.type}
            href={item.href}
            aria-current={item.type === activeType ? "page" : undefined}
            className={`rounded-cc-control border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${item.type === activeType ? "border-brand bg-brand text-white" : "border-campcareer-border text-campcareer-ink-secondary hover:border-brand/40 hover:text-brand"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mt-3 text-sm leading-6 text-[hsl(var(--cc-muted))]">{title[locale]}</p>
    </header>
  )
}
