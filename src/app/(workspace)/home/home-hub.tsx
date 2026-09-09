"use client"

import Link from "next/link"
import {
  ArrowRight,
  FileText,
  ShieldCheck,
} from "lucide-react"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { localizePath } from "@/lib/i18n/config"

export function HomeHub() {
  const locale = useRouteLocale()
  const isKo = locale === "ko"

  const copy = isKo
    ? {
        headlineLead: "호주 유학과 커리어의",
        headlineAccent: "투자회수를 계산하세요",
        description: "학비, 생활비, 취업률, 연봉을 반영한 호주 학업·커리어의 투자회수 비교 데이터와 개인화 의사결정 리포트입니다.",
        explore: "ROI 가이드 보기",
        trust: "CampCareer는 막연한 조언이 아니라 데이터 기반 의사결정을 돕습니다.",
        benefitJobs: "학부터 직업까지 데이터",
        benefitJobsText: "학비부터 첫 연봉까지 일관된 기준으로 비교합니다.",
        benefitTickets: "도시별 생활비 조정",
        benefitTicketsText: "시드니과 애들레이드의 생활비 차이를 반영한 ROI를 봅니다.",
        benefitPay: "출처가 있는 데이터",
        benefitPayText: "모든 통계는 정부 공개 자료 기준일로 공개됩니다.",
      }
    : {
        headlineLead: "Calculate your return on investment",
        headlineAccent: "in Australian education and careers.",
        description: "Compare education ROI across Australian degrees, careers and cities using tuition, living costs, employment and salary data.",
        explore: "Explore ROI Data",
        trust: "CampCareer helps you make data-driven decisions, not vague career choices.",
        benefitJobs: "Data from study to salary",
        benefitJobsText: "Compare outcomes consistently from tuition fees through first-year earnings.",
        benefitTickets: "Cost of living by city",
        benefitTicketsText: "ROI adjusted for the real difference between Sydney and Adelaide living costs.",
        benefitPay: "Sourced data",
        benefitPayText: "Every statistic is published with government source and review date.",
      }

  return (
    <div className="bg-white text-[hsl(var(--cc-ink))]">
      <section className="px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-brand">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Australia Study & Career ROI · 2026
              </div>

              <h1 className="mt-5 text-[44px] font-semibold leading-[0.99] tracking-[-0.055em] text-[hsl(var(--cc-ink))] sm:text-[58px] lg:text-[66px]">
                {copy.headlineLead}{" "}
                <span className="text-brand">{copy.headlineAccent}</span>
              </h1>

              <p className="mt-6 max-w-xl text-[16px] leading-7 text-[hsl(var(--cc-ink-secondary))] sm:text-[18px] sm:leading-8">
                {copy.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={localizePath("/roi", locale)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-[hsl(var(--brand-press))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
                >
                  {copy.explore}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href={localizePath("/blog", locale)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[hsl(var(--cc-ink))] transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15"
                >
                  {isKo ? "가이드와 리서치 보기" : "Read guides & research"}
                  <FileText className="size-4 text-brand" aria-hidden="true" />
                </Link>
              </div>

              <p className="mt-5 flex max-w-xl items-start gap-2 text-xs leading-5 text-[hsl(var(--cc-muted))] sm:text-sm">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                {copy.trust}
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-[22px] border border-[hsl(var(--cc-border))] bg-white p-8 shadow-[0_22px_60px_rgba(16,24,40,0.09)]">
                <div className="space-y-6">
                  <BenefitCard icon="📚" title={copy.benefitJobs} text={copy.benefitJobsText} />
                  <BenefitCard icon="🏙️" title={copy.benefitTickets} text={copy.benefitTicketsText} />
                  <BenefitCard icon="📊" title={copy.benefitPay} text={copy.benefitPayText} />
                </div>
              </div>
            </div>
          </div>

          <section className="mt-10 sm:mt-12 lg:hidden">
            <div className="grid gap-4 md:grid-cols-3">
              <BenefitCardMobile icon="📚" title={copy.benefitJobs} text={copy.benefitJobsText} />
              <BenefitCardMobile icon="🏙️" title={copy.benefitTickets} text={copy.benefitTicketsText} />
              <BenefitCardMobile icon="📊" title={copy.benefitPay} text={copy.benefitPayText} />
            </div>
          </section>

          <div className="mt-7 text-center text-xs text-[hsl(var(--cc-muted))]">
            <Link href={localizePath("/blog", locale)} className="font-semibold text-brand transition hover:text-[hsl(var(--brand-press))]">
              {isKo ? "CampCareer 리서치와 가이드 보기" : "Read CampCareer research and guides"}<ArrowRight className="ml-1 inline size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function BenefitCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-5 text-[hsl(var(--cc-muted))]">{text}</p></div>
    </div>
  )
}

function BenefitCardMobile({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="rounded-[18px] border border-[hsl(var(--cc-border))] bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.045)] sm:p-6">
      <div className="flex items-start gap-4">
        <span className="text-3xl">{icon}</span>
        <div><h3 className="text-base font-semibold tracking-[-0.02em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--cc-muted))]">{text}</p></div>
      </div>
    </article>
  )
}
