"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { localizePath } from "@/lib/i18n/config"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { getCareerRoute } from "@/lib/workspace/occupation-routes"

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
      title: { en: "Study and programs support a career decision", ko: "학업과 프로그램은 커리어 결정을 지원합니다" },
      detail: { en: "Use this surface after evaluating the career. Keep courses tied to the job outcome you want.", ko: "먼저 커리어를 평가한 뒤 이용하세요. 과정 선택은 목표 직업과 연결해서 판단합니다." },
    },
  },
  {
    matches: (pathname) => pathname === "/compare" || pathname.startsWith("/compare/"),
    copy: {
      eyebrow: { en: "SECONDARY ACTION", ko: "보조 기능" },
      title: { en: "Compare after you have a decision to test", ko: "비교할 판단이 생긴 뒤 사용하세요" },
      detail: { en: "Comparison is a supporting tool. CampCareer Score and the Career Page remain the primary decision surface.", ko: "비교는 보조 도구입니다. CampCareer Score와 Career Page가 기본 판단 화면입니다." },
    },
  },
  {
    matches: (pathname) => pathname === "/countries" || pathname.startsWith("/countries/") || pathname === "/cities" || pathname.startsWith("/cities/"),
    copy: {
      eyebrow: { en: "COUNTRY CONTEXT", ko: "국가 맥락" },
      title: { en: "Location is context for a career", ko: "국가는 커리어 판단의 맥락입니다" },
      detail: { en: "Use country and city evidence to understand a career in place, not as a separate destination dashboard.", ko: "국가와 도시 정보는 별도 목적지 대시보드가 아니라 특정 커리어를 현지에서 이해하는 근거로 사용합니다." },
    },
  },
  {
    matches: (pathname) => pathname === "/visas" || pathname.startsWith("/visas/"),
    copy: {
      eyebrow: { en: "PATH CONTEXT", ko: "경로 맥락" },
      title: { en: "Visa and work rights belong in the path", ko: "비자와 근무 권한은 Path에서 판단합니다" },
      detail: { en: "Visa information can change your route, but it never changes the public CampCareer Score.", ko: "비자 정보는 진입 경로를 바꿀 수 있지만 공개 CampCareer Score를 바꾸지는 않습니다." },
    },
  },
  {
    matches: (pathname) => pathname === "/institutions" || pathname.startsWith("/institutions/"),
    copy: {
      eyebrow: { en: "PROVIDER CONTEXT", ko: "교육기관 맥락" },
      title: { en: "Institutions matter when a program serves the path", ko: "교육기관은 필요한 프로그램을 제공할 때 중요합니다" },
      detail: { en: "Choose providers in the context of a career-relevant program, not as an independent ranking exercise.", ko: "교육기관 자체 순위보다 목표 커리어에 필요한 프로그램을 기준으로 판단합니다." },
    },
  },
  {
    matches: (pathname) => pathname === "/occupation" || pathname.startsWith("/occupation/"),
    copy: {
      eyebrow: { en: "CAREER DISCOVERY", ko: "커리어 탐색" },
      title: { en: "Discovery should end on a Career Page", ko: "탐색의 목적지는 Career Page입니다" },
      detail: { en: "Use occupation exploration to find a career, then judge it with CampCareer Score, evidence and path.", ko: "직업 탐색으로 커리어를 찾은 뒤 CampCareer Score, 근거, 경로로 판단합니다." },
    },
  },
]

export function ContextualSurfaceNotice({ pathname }: { pathname: string }) {
  const locale = useRouteLocale()
  const searchParams = useSearchParams()
  const surface = SURFACES.find((item) => item.matches(pathname))
  if (!surface) return null

  const country = searchParams.get("country")?.toUpperCase() ?? null
  const career = searchParams.get("careerContext") ?? searchParams.get("career") ?? searchParams.get("occupation")
  const careerRoute = country && career ? getCareerRoute(country, career) : null
  const careerHref = careerRoute ? localizePath(careerRoute.path, locale) : null
  const homeHref = localizePath("/", locale)
  const copy = surface.copy

  return (
    <aside className="border-b border-[hsl(var(--cc-border))] bg-[hsl(var(--cc-canvas))]" aria-label={locale === "ko" ? "제품 맥락" : "Product context"}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-brand">{copy.eyebrow[locale]}</p>
          <p className="mt-0.5 text-sm font-semibold text-[hsl(var(--cc-ink))]">{copy.title[locale]}</p>
          <p className="mt-0.5 max-w-3xl text-xs leading-5 text-[hsl(var(--cc-muted))]">{copy.detail[locale]}</p>
        </div>
        <Link href={careerHref ?? homeHref} className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand transition hover:underline">
          {careerHref ? <ArrowLeft className="size-3.5" /> : null}
          {careerHref
            ? locale === "ko" ? "Career Page로 돌아가기" : "Back to Career Page"
            : locale === "ko" ? "커리어 평가하기" : "Evaluate a career"}
          {!careerHref ? <ArrowRight className="size-3.5" /> : null}
        </Link>
      </div>
    </aside>
  )
}
