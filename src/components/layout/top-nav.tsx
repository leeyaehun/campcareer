"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { LogIn } from "lucide-react"
import { LanguageMenu } from "@/components/layout/language-menu"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { localeFromPathname, localizePath, type LocaleOption } from "@/lib/i18n/config"
import { createClient } from "@/lib/supabase-client"
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
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let active = true

    const syncUser = async (nextUser?: User | null) => {
      const next = nextUser ?? (await supabase.auth.getUser()).data.user
      if (!active) return
      setUser(next)
    }

    void syncUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const displayName = user
    ? ((user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined) || user.email?.split("@")[0] || "C")
    : "C"
  const accountInitial = Array.from(displayName.trim())[0]?.toLocaleUpperCase() || "C"

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[hsl(var(--cc-border))] bg-white">
      <div className="mx-auto max-w-[1240px] px-6 max-sm:px-[18px]">
        <div className="flex h-16 items-center justify-between">
          <Link
            href={homeDestination}
            className="campcareer-wordmark shrink-0 text-[hsl(var(--cc-ink))]"
            aria-label="CampCareer home"
          >
            campcareer
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <LanguageMenu buttonClassName="text-[hsl(var(--cc-muted))] hover:bg-slate-100" />

            {user ? (
              <Link
                href={profileDestination}
                aria-label={pathLocale === "ko" ? "프로필 열기" : "Open profile"}
                className="inline-flex rounded-lg border border-[hsl(var(--cc-border))] bg-white p-1.5 text-sm font-semibold text-[hsl(var(--cc-ink))] transition hover:bg-slate-50"
              >
                <span className="grid size-6 place-items-center rounded-full bg-blue-50 text-[10px] font-semibold text-brand" aria-hidden="true">
                  {accountInitial}
                </span>
              </Link>
            ) : (
              <Link
                href={fallbackLoginDestination}
                onClick={(event) => {
                  event.preventDefault()
                  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
                  window.location.assign(`${loginPath}?next=${encodeURIComponent(returnTo || homeDestination)}`)
                }}
                className={cn("inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--cc-border))] bg-white px-3 py-2 text-sm font-semibold text-[hsl(var(--cc-ink))] transition hover:bg-slate-50")}
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
