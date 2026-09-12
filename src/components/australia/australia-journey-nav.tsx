"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Search, Scale } from "lucide-react"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { useRouteTranslations } from "@/lib/i18n/use-translations"
import { localeFromPathname, localizePath, withoutLocalePrefix } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

const JOURNEY_ITEMS = [
  { href: "/", key: "findPath", icon: Search },
  { href: "/au/study", key: "compareStudy", icon: Scale },
] as const

function isCurrentStep(pathname: string, href: (typeof JOURNEY_ITEMS)[number]["href"]) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/au/majors")
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** A shared, intentionally small journey so public Australia screens answer “what next?” clearly. */
export function AustraliaJourneyNav({ className }: { className?: string }) {
  const pathname = usePathname()
  const locale = useRouteLocale()
  const pathLocale = localeFromPathname(pathname) ?? locale
  const barePathname = withoutLocalePrefix(pathname)
  const t = useRouteTranslations().australia.journey

  return (
    <section className={cn("rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_12px_35px_rgba(37,99,235,.07)] sm:p-5", className)}>
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-blue-700">{t.eyebrow}</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">{t.heading}</h2>
        </div>
        <p className="max-w-xl text-sm leading-5 text-slate-600">{t.summary}</p>
      </div>

      <nav aria-label={t.ariaLabel} className="mt-3 grid gap-2 sm:grid-cols-2">
        {JOURNEY_ITEMS.map((item, index) => {
          const current = isCurrentStep(barePathname, item.href)
          const Icon = item.icon
          const label = t[item.key]
          const description = t[`${item.key}Description`]
          return (
            <Link
              key={item.href}
              href={localizePath(item.href, pathLocale)}
              aria-current={current ? "step" : undefined}
              className={cn(
                "group flex min-w-0 items-center gap-3 rounded-2xl border p-3 transition sm:min-h-[5.75rem] sm:items-start",
                current
                  ? "border-blue-300 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
              )}
            >
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl text-xs font-bold", current ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700")}>
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-950">
                  <Icon className="size-4 text-blue-700" />
                  {label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">{description}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-700" />
            </Link>
          )
        })}
      </nav>
    </section>
  )
}
