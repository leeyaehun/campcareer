"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LanguageMenu } from "@/components/layout/language-menu"
import { CompareNavigationAction, PrimaryProductNavigation } from "@/components/layout/primary-product-nav"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { localizePath } from "@/lib/i18n/config"
import { WorkspaceUserMenu } from "./workspace-user-menu"

export function WorkspaceTopbar() {
  const locale = useRouteLocale()
  const pathname = usePathname() || "/"

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[hsl(var(--cc-border))] bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center gap-4 px-6 max-sm:px-[18px]">
        <Link
          href={localizePath("/", locale)}
          className="campcareer-wordmark shrink-0 text-[hsl(var(--cc-ink))]"
          aria-label="CampCareer career search"
        >
          campcareer
        </Link>

        <PrimaryProductNavigation pathname={pathname} locale={locale} />
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <CompareNavigationAction pathname={pathname} locale={locale} />
        <LanguageMenu buttonClassName="text-[hsl(var(--cc-muted))] hover:bg-slate-100" />
        <WorkspaceUserMenu />
        </div>
      </div>
    </header>
  )
}
