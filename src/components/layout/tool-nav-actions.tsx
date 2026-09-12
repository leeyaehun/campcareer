"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { LayoutGrid, LogIn, Map } from "lucide-react"
import { LanguageToggle } from "@/components/language-toggle"
import { Button } from "@/components/ui/button"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { useRouteTranslations } from "@/lib/i18n/use-translations"
import { localeFromPathname, localizePath } from "@/lib/i18n/config"
import { createClient } from "@/lib/supabase-client"
import { cn } from "@/lib/utils"

/** Shared account and app controls for focused product surfaces such as Maps. */
export function ToolNavActions({ className, minimal = false, onLanding = false, hideLanguage = false, onAvatarClick }: { className?: string; minimal?: boolean; onLanding?: boolean; hideLanguage?: boolean; onAvatarClick?: () => void }) {
  const pathname = usePathname()
  const locale = useRouteLocale()
  const pathLocale = localeFromPathname(pathname) ?? locale
  const t = useRouteTranslations()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [appsOpen, setAppsOpen] = useState(false)
  const appsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
    // The browser client is intentionally shared by this visual-only account control.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!appsOpen) return
    const closeApps = (event: MouseEvent) => {
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) setAppsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAppsOpen(false)
    }
    document.addEventListener("mousedown", closeApps)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("mousedown", closeApps)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [appsOpen])

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = user
    ? ((user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined) || user.email?.split("@")[0] || "C")
    : "C"
  const accountInitial = Array.from(displayName.trim())[0]?.toLocaleUpperCase() || "C"

  return <div className={cn("flex shrink-0 items-center gap-2 max-[360px]:gap-1", className)}>
    {minimal ? (
      <>
        {!hideLanguage && <LanguageToggle className="text-xs font-medium text-slate-500 hover:text-slate-700" />}
        <div className="relative" ref={appsRef}>
          <button
            type="button"
            aria-label={locale === "ko" ? "CampCareer 도구 열기" : "Open CampCareer tools"}
            aria-expanded={appsOpen}
            aria-haspopup="menu"
            onClick={() => setAppsOpen((open) => !open)}
            className="grid size-8 place-items-center rounded-lg transition hover:bg-slate-100"
          >
            <LayoutGrid className="size-[18px] text-slate-500" strokeWidth={2.1} />
          </button>
          {appsOpen && <div role="menu" aria-label={locale === "ko" ? "CampCareer 도구" : "CampCareer tools"} className="absolute right-0 top-full z-[2300] mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_20px_55px_rgba(15,23,42,.18)] max-sm:right-[-3rem]">
            <div className="flex items-center justify-between px-2 pb-2"><p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-500">CampCareer</p><span className="text-xs text-slate-400">{locale === "ko" ? "도구" : "Tools"}</span></div>
            <div className="grid grid-cols-4 gap-2">
              <Link href={localizePath("/career", pathLocale)} role="menuitem" onClick={() => setAppsOpen(false)} className="group rounded-2xl border border-transparent p-3 transition hover:border-blue-200 hover:bg-blue-50"><span className="grid size-12 place-items-center rounded-2xl bg-blue-100 text-2xl shadow-sm transition group-hover:-translate-y-0.5">🔎</span><span className="mt-3 block text-sm font-semibold text-slate-900">{t.australia.journey.findPath}</span></Link>
              <Link href={localizePath("/compare", pathLocale)} role="menuitem" onClick={() => setAppsOpen(false)} className="group rounded-2xl border border-transparent p-3 transition hover:border-blue-200 hover:bg-blue-50"><span className="grid size-12 place-items-center rounded-2xl bg-sky-100 text-2xl shadow-sm transition group-hover:-translate-y-0.5">⚖️</span><span className="mt-3 block text-sm font-semibold text-slate-900">{t.australia.journey.compareStudy}</span></Link>
              <Link href={localizePath("/", pathLocale)} role="menuitem" onClick={() => setAppsOpen(false)} className="group rounded-2xl border border-transparent p-3 transition hover:border-violet-200 hover:bg-violet-50"><span className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-2xl shadow-sm transition group-hover:-translate-y-0.5">🧭</span><span className="mt-3 block text-sm font-semibold text-slate-900">{t.australia.journey.plan}</span></Link>
              <Link href="/maps?country=au" role="menuitem" onClick={() => setAppsOpen(false)} className="group rounded-2xl border border-transparent p-3 transition hover:border-emerald-200 hover:bg-emerald-50"><span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm transition group-hover:-translate-y-0.5"><Map className="size-6" strokeWidth={2} /></span><span className="mt-3 block text-sm font-semibold text-slate-900">{locale === "ko" ? "지도" : "Maps"}</span></Link>
            </div>
          </div>}
        </div>
        {user ? (
          onAvatarClick ? (
            <button type="button" onClick={onAvatarClick} aria-label={locale === "ko" ? "프로필 열기" : "Open profile"} className="rounded-full transition hover:ring-2 hover:ring-blue-200">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className="grid size-7 place-items-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700" aria-hidden="true">{accountInitial}</div>}
            </button>
          ) : (
            <Link href={localizePath("/profile", pathLocale)} aria-label={locale === "ko" ? "프로필 열기" : "Open profile"}>
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className="grid size-7 place-items-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700" aria-hidden="true">{accountInitial}</div>}
            </Link>
          )
        ) : (
          <button type="button" onClick={() => router.push(localizePath("/login", pathLocale))} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
            <LogIn className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </>
    ) : (
      <>
        {!hideLanguage && <LanguageToggle className={onLanding ? "text-blue-100 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"} />}
        <div className="relative" ref={appsRef}>
          <button
            type="button"
            aria-label={locale === "ko" ? "CampCareer 도구 열기" : "Open CampCareer tools"}
            aria-expanded={appsOpen}
            aria-haspopup="menu"
            onClick={() => setAppsOpen((open) => !open)}
            className={cn("grid size-9 place-items-center rounded-xl border transition max-[360px]:size-8",
              onLanding
                ? appsOpen ? "border-white/30 bg-white/20 text-white shadow-sm" : "border-transparent text-blue-100 hover:border-white/20 hover:bg-white/10 hover:text-white"
                : appsOpen ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm" : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-900"
            )}
          >
            <LayoutGrid className="size-[18px]" strokeWidth={2.1} />
          </button>
          {appsOpen && <div role="menu" aria-label={locale === "ko" ? "CampCareer 도구" : "CampCareer tools"} className="absolute right-0 top-full z-[2300] mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_20px_55px_rgba(15,23,42,.18)] max-sm:right-[-3rem]">
            <div className="flex items-center justify-between px-2 pb-2"><p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-500">CampCareer</p><span className="text-xs text-slate-400">{locale === "ko" ? "도구" : "Tools"}</span></div>
            <div className="grid grid-cols-4 gap-2">
              <Link href={localizePath("/career", pathLocale)} role="menuitem" onClick={() => setAppsOpen(false)} className="group rounded-2xl border border-transparent p-3 transition hover:border-blue-200 hover:bg-blue-50"><span className="grid size-12 place-items-center rounded-2xl bg-blue-100 text-2xl shadow-sm transition group-hover:-translate-y-0.5">🔎</span><span className="mt-3 block text-sm font-semibold text-slate-900">{t.australia.journey.findPath}</span></Link>
              <Link href={localizePath("/compare", pathLocale)} role="menuitem" onClick={() => setAppsOpen(false)} className="group rounded-2xl border border-transparent p-3 transition hover:border-blue-200 hover:bg-blue-50"><span className="grid size-12 place-items-center rounded-2xl bg-sky-100 text-2xl shadow-sm transition group-hover:-translate-y-0.5">⚖️</span><span className="mt-3 block text-sm font-semibold text-slate-900">{t.australia.journey.compareStudy}</span></Link>
              <Link href={localizePath("/", pathLocale)} role="menuitem" onClick={() => setAppsOpen(false)} className="group rounded-2xl border border-transparent p-3 transition hover:border-violet-200 hover:bg-violet-50"><span className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-2xl shadow-sm transition group-hover:-translate-y-0.5">🧭</span><span className="mt-3 block text-sm font-semibold text-slate-900">{t.australia.journey.plan}</span></Link>
              <Link href="/maps?country=au" role="menuitem" onClick={() => setAppsOpen(false)} className="group rounded-2xl border border-transparent p-3 transition hover:border-emerald-200 hover:bg-emerald-50"><span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm transition group-hover:-translate-y-0.5"><Map className="size-6" strokeWidth={2} /></span><span className="mt-3 block text-sm font-semibold text-slate-900">{locale === "ko" ? "지도" : "Maps"}</span></Link>
            </div>
          </div>}
        </div>
        {user ? (
          onAvatarClick ? (
            <button type="button" onClick={onAvatarClick} aria-label={locale === "ko" ? "프로필 열기" : "Open profile"} className={cn("rounded-full transition hover:ring-2 hover:ring-blue-200", onLanding && "hover:ring-white/30")}>
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className={cn("grid size-7 place-items-center rounded-full text-[11px] font-semibold", onLanding ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700")} aria-hidden="true">{accountInitial}</div>}
            </button>
          ) : (
            <Link href={localizePath("/profile", pathLocale)} aria-label={locale === "ko" ? "프로필 열기" : "Open profile"}>
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className={cn("grid size-7 place-items-center rounded-full text-[11px] font-semibold", onLanding ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700")} aria-hidden="true">{accountInitial}</div>}
            </Link>
          )
        ) : (
          <Button variant="outline" size="sm" onClick={() => router.push(localizePath("/login", pathLocale))} className={cn(onLanding ? "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white" : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700", "max-[360px]:size-8 max-[360px]:px-0")}><LogIn className="hidden size-4 max-[360px]:block" /><span className="max-[360px]:sr-only">{t.common.signIn}</span></Button>
        )}
      </>
    )}
  </div>
}
