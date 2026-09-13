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
    matches: (pathname) => pathname === "/programs" || pathname.startsWith("/programs/") || pathname === "/courses" || pathname.startsWith("/courses/") || pathname === "/study" || pathname.startsWith("/study/"),
    copy: {
      eyebrow: { en: "CAREER PATH", ko: "커리어 경로" },
      title: { en: "Programs support the career path", ko: "프로그램은 커리어 경로를 지원합니다" },
      detail: { en: "Use this surface after evaluating the career. Keep courses tied to the job outcome you want.", ko: "먼저 커리어를 평가한 뒤 이용하세요. 과정 선택은 목표 직업과 연결해서 판단합니다." },
    },
  },
  {
    matches: (pathname) => pathname === "/compare" || pathname.startsWith("/compare/"),
    copy: {
      eyebrow: { en: "SECONDARY ACTION", ko: "보조 기능" },
      title: { en: "Compare a decision, not everything", ko: "판단할 대상을 정한 뒤 비교하세요" },
      detail: { en: "Comparison is a supporting tool. CampCareer Score and the Career Page remain the primary decision surface.", ko: "비교는 보조 도구입니다. CampCareer Score와 Career Page가 기본 판단 화면입니다." },
    },
  },
  {
    matches: (pathname) => pathname === "/visas" || pathname.startsWith("/visas/"),
    copy: {
      eyebrow: { en: "PATH CONTEXT", ko: "경로 맥락" },
      title: { en: "Visa and work rights shape the path", ko: "비자와 근무 권한은 경로를 바꿉니다" },
      detail: { en: "Visa information can change your route, but it never changes the public CampCareer Score.", ko: "비자 정보는 진입 경로를 바꿀 수 있지만 공개 CampCareer Score를 바꾸지는 않습니다." },
    },
  },
  {
    matches: (pathname) => pathname === "/institutions" || pathname.startsWith("/institutions/"),
    copy: {
      eyebrow: { en: "PROVIDER CONTEXT", ko: "교육기관 맥락" },
      title: { en: "Choose providers for the career path", ko: "커리어 경로에 맞는 교육기관을 고르세요" },
      detail: { en: "Choose providers in the context of a career-relevant program, not as an independent ranking exercise.", ko: "교육기관 자체 순위보다 목표 커리어에 필요한 프로그램을 기준으로 판단합니다." },
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
