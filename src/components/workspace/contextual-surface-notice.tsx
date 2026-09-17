"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { localizePath } from "@/lib/i18n/config"
import { useRouteLocale } from "@/lib/i18n/locale-provider"

type SurfaceCopy = {
  eyebrow: { en: string; ko: string }
  title: { en: string; ko: string }
  detail: { en: string; ko: string }
}

const SURFACES: Array<{ matches: (pathname: string) => boolean; copy: SurfaceCopy }> = [
  {
    matches: (pathname) => pathname === "/visas" || pathname.startsWith("/visas/"),
    copy: {
      eyebrow: { en: "PATH CONTEXT", ko: "경로 맥락" },
      title: { en: "Visa and work rights shape the path", ko: "비자와 근무 권한은 경로를 바꿉니다" },
      detail: { en: "Visa information can change your route, but it never changes the public CampCareer Score.", ko: "비자 정보는 진입 경로를 바꿀 수 있지만 공개 CampCareer Score를 바꾸지는 않습니다." },
    },
  },
  {
    matches: (pathname) => pathname === "/occupation" || pathname.startsWith("/occupation/"),
    copy: {
      eyebrow: { en: "CAREER DISCOVERY", ko: "커리어 탐색" },
      title: { en: "Discovery should lead to a Career Page", ko: "탐색은 Career Page로 이어져야 합니다" },
      detail: { en: "Use occupation exploration to find a career, then judge it with CampCareer Score, evidence and path.", ko: "직업 탐색으로 커리어를 찾은 뒤 CampCareer Score, 근거, 경로로 판단합니다." },
    },
  },
]

export function ContextualSurfaceNotice({ pathname }: { pathname: string }) {
  const locale = useRouteLocale()
  const surface = SURFACES.find((item) => item.matches(pathname))
  if (!surface) return null

  const homeHref = localizePath("/", locale)
  const copy = surface.copy

  return (
    <aside className="border-b border-[hsl(var(--cc-border))] bg-[hsl(var(--cc-canvas))]" aria-label={locale === "ko" ? "제품 맥락" : "Product context"}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-brand">{copy.eyebrow[locale]}</p>
          <p className="mt-0.5 text-sm font-semibold text-[hsl(var(--cc-ink))]">{copy.title[locale]}</p>
          <p className="mt-0.5 hidden max-w-3xl text-xs leading-5 text-[hsl(var(--cc-muted))] sm:block">{copy.detail[locale]}</p>
        </div>
        <Link href={homeHref} prefetch={false} className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand transition hover:underline">
          {locale === "ko" ? "커리어 평가하기" : "Evaluate a career"}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </aside>
  )
}
