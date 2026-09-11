"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { LogIn } from "lucide-react"
import { LanguageMenu } from "@/components/layout/language-menu"
import { CompareNavigationAction, PrimaryProductNavigation } from "@/components/layout/primary-product-nav"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { localeFromPathname, localizePath, type LocaleOption } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

export function TopNav() {
  const pathname = usePathname() || "/"
  const routeLocale = useRouteLocale()
  const pathLocale = localeFromPathname(pathname) ?? routeLocale

  return <AccountTopNav pathname={pathname} pathLocale={pathLocale} />
}

function AccountTopNav({ pathname, pathLocale }: { pathname: string; pathLocale: LocaleOption }) {
  const homeDestination = localizePath("/", pathLocale)
  const profileDestination = localizePath("/profile", pathLocale)
  const loginPath = localizePath("/login", pathLocale)
  const fallbackLoginDestination = `${loginPath}?next=${encodeURIComponent(pathname || homeDestination)}`
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let active = true
    let timer: number | undefined
    let unsubscribe: (() => void) | undefined

    const initializeAuth = async () => {
      const { createClient } = await import("@/lib/supabase-client")
      if (!active) return

      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!active) return
      setUser(data.user)

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setUser(session?.user ?? null)
      })
      unsubscribe = () => subscription.unsubscribe()
    }

    // Auth state is useful after first paint, but it must not compete with
    // route-critical resources on the Lighthouse/LCP path.
    const scheduleAuth = () => {
      timer = window.setTimeout(() => {
        void initializeAuth()
      }, 0)
    }

    if (document.readyState === "complete") {
      scheduleAuth()
    } else {
      window.addEventListener("load", scheduleAuth, { once: true })
    }

    return () => {
      active = false
      window.removeEventListener("load", scheduleAuth)
      if (timer !== undefined) window.clearTimeout(timer)
      unsubscribe?.()
    }
  }, [])

  const displayName = user
    ? ((user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined) || user.email?.split("@")[0] || "C")
    : "C"
  const accountInitial = Array.from(displayName.trim())[0]?.toLocaleUpperCase() || "C"

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-campcareer-border bg-campcareer-surface">
      <div className="mx-auto max-w-[1240px] px-6 max-sm:px-[18px]">
        <div className="flex h-16 items-center gap-4">
          <Link
            href={homeDestination}
            prefetch={false}
            className="campcareer-wordmark shrink-0 text-campcareer-ink"
            aria-label="CampCareer home"
          >
            campcareer
          </Link>

          <PrimaryProductNavigation pathname={pathname} locale={pathLocale} />

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <CompareNavigationAction pathname={pathname} locale={pathLocale} />
            <LanguageMenu buttonClassName="text-campcareer-muted hover:bg-secondary" />

            {user ? (
              <Link
                href={profileDestination}
                prefetch={false}
                aria-label={pathLocale === "ko" ? "프로필 열기" : "Open profile"}
                className="inline-flex min-h-10 rounded-cc-control border border-campcareer-border bg-campcareer-surface p-1.5 text-sm font-semibold text-campcareer-ink shadow-cc-surface transition-colors duration-cc-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <span className="grid size-6 place-items-center rounded-full bg-blue-50 text-[10px] font-semibold text-brand" aria-hidden="true">
                  {accountInitial}
                </span>
              </Link>
            ) : (
              <Link
                href={fallbackLoginDestination}
                prefetch={false}
                onClick={(event) => {
                  event.preventDefault()
                  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
                  window.location.assign(`${loginPath}?next=${encodeURIComponent(returnTo || homeDestination)}`)
                }}
                className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3 text-sm font-semibold text-campcareer-ink shadow-cc-surface transition-colors duration-cc-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30")}
              >
                <LogIn className="size-4" />
                {pathLocale === "ko" ? "로그인" : "Log in"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
