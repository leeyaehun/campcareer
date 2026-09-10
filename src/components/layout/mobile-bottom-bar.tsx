"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouteLocale, useRouteTranslations } from "@/lib/i18n/locale-provider"
import { localeFromPathname, localizePath, withoutLocalePrefix } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"
import { Search, Scale, ClipboardList, LogIn } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase-client"

export function MobileBottomBar() {
  const pathname = usePathname()
  const locale = useRouteLocale()
  const t = useRouteTranslations()
  const pathLocale = localeFromPathname(pathname) ?? locale
  const barePathname = withoutLocalePrefix(pathname)
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    const onSearchOpen = () => setHidden(true)
    const onSearchClose = () => setHidden(false)
    window.addEventListener("search-modal-open", onSearchOpen)
    window.addEventListener("search-modal-close", onSearchClose)
    return () => {
      window.removeEventListener("search-modal-open", onSearchOpen)
      window.removeEventListener("search-modal-close", onSearchClose)
    }
  }, [])

  const isPathfinder = barePathname === "/career" || barePathname.startsWith("/career/")
  const isCompare = barePathname === "/compare" || barePathname.startsWith("/compare/")
  const isPlan = barePathname === "/"
  const isProfile = barePathname === "/profile" || barePathname.startsWith("/profile/")

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = user
    ? ((user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined) || user.email?.split("@")[0] || "C")
    : "C"
  const accountInitial = Array.from(displayName.trim())[0]?.toLocaleUpperCase() || "C"

  return (
    <div className={cn("sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-sm safe-area-bottom transition-all duration-300", hidden ? "translate-y-full opacity-0 pointer-events-none" : "")}>
      <div className="grid h-14 grid-cols-4">
        <Link href={localizePath("/career", pathLocale)} aria-current={isPathfinder ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium transition", isPathfinder ? "text-blue-600" : "text-slate-400")}>
          <Search className="size-5" strokeWidth={isPathfinder ? 2.4 : 1.8} />
          <span className="truncate">{t.australia.journey.findPath}</span>
        </Link>

        <Link href={localizePath("/compare", pathLocale)} aria-current={isCompare ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium transition", isCompare ? "text-blue-600" : "text-slate-400")}>
          <Scale className="size-5" strokeWidth={isCompare ? 2.4 : 1.8} />
          <span className="truncate">{t.australia.journey.compareStudy}</span>
        </Link>

        <Link href={localizePath("/", pathLocale)} aria-current={isPlan ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium transition", isPlan ? "text-violet-700" : "text-slate-400")}>
          <ClipboardList className="size-5" strokeWidth={isPlan ? 2.4 : 1.8} />
          <span className="truncate">{t.australia.journey.plan}</span>
        </Link>

        {/* Profile / Login */}
        {user ? (
          <Link href={localizePath("/profile", pathLocale)} aria-current={isProfile ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium transition", isProfile ? "text-blue-600" : "text-slate-400")}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" /> : <div className="grid size-5 place-items-center rounded-full bg-blue-100 text-[8px] font-semibold text-blue-700" aria-hidden="true">{accountInitial}</div>}
            <span>{locale === "ko" ? "프로필" : "Profile"}</span>
          </Link>
        ) : (
          <Link href={localizePath("/login", pathLocale)} className="flex flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium text-slate-400 transition">
            <LogIn className="w-5 h-5" strokeWidth={1.8} />
            <span>{t.common.signIn}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
