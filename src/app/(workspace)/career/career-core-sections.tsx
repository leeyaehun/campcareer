"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleAlert,
  ExternalLink,
  GraduationCap,
} from "lucide-react"
import { localizePath } from "@/lib/i18n/config"
import type { CareerProfile } from "@/lib/career-data-foundation/career-profile-contract"
import type { CareerMarketInsight } from "@/lib/workspace/career-market-contract"
import { SourceInfo } from "@/components/ui/data-display"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState as SurfaceEmptyState } from "@/components/ui/status-state"
import type { OverviewSearchValues } from "../home/home-overview-config"

type Locale = "en" | "ko"

type ResourceLink = {
  key: string
  label: string
  detail?: string | null
  href: string
  meta?: string | null
}

const tr = (locale: Locale, ko: string, en: string) => (locale === "ko" ? ko : en)

function careerProgramsHref(query: OverviewSearchValues, locale: Locale) {
  const country = query.country.toUpperCase()
  const params = new URLSearchParams({
    country,
    careerContext: query.occupation,
  })

  // Canada has a reviewed career-to-program relation that can be used as an
  // actual catalogue filter. Other countries keep the career as context only.
  if (country === "CA") params.set("career", query.occupation)

  return `${localizePath("/programs", locale)}?${params.toString()}`
}

function compactNumber(value: number | null | undefined, locale: Locale) {
  if (value == null) return null
  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value)
}

function money(value: number | null | undefined, currency: string | null | undefined, locale: Locale) {
  if (value == null) return null
  const formatted = compactNumber(value, locale)
  return currency ? `${currency} ${formatted}` : formatted
}

function dedupeLinks(items: ResourceLink[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.href.trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function entryBlocker(insight: CareerMarketInsight, locale: Locale) {
  const foundationBlocker = insight.foundation?.blockers.find((blocker) =>
    ["licensing", "registration", "education_training", "safety_training"].includes(blocker.blockerType),
  )
  if (foundationBlocker) {
    return locale === "ko"
      ? "공식 자격·면허·교육 요건이 진입 경로에 영향을 줍니다. 아래 경로에서 해당 기관의 최신 기준을 확인하세요."
      : foundationBlocker.reason
  }

  const profile = insight.profile
  if (profile?.registrationRequired) {
    const authority = profile.registrationAuthority
    return authority
      ? tr(locale, `${authority}의 등록·면허 또는 자격 인정 요건을 확인해야 합니다.`, `Check registration, licensing or recognition requirements with ${authority}.`)
      : tr(locale, "현지 등록·면허 또는 자격 인정 요건을 확인해야 합니다.", "Check local registration, licensing or recognition requirements.")
  }

  return locale === "ko"
    ? insight.career.registration?.ko ?? "직무별 자격과 현지 진입 요건을 공식 출처에서 확인하세요."
    : insight.career.registration?.en ?? "Check role-specific qualifications and local entry requirements with official sources."
}

function evidenceRows(insight: CareerMarketInsight, locale: Locale) {
  const profile = insight.profile
  const foundation = insight.foundation
  const score = profile?.metric.campCareerScore ?? foundation?.campCareerScore ?? null
  const decision = foundation?.decisionMetrics

  const vacancy = profile?.metric.vacanciesThreeMonthAvg ?? decision?.projectedAnnualOpenings ?? null
  const vacancyLabel = profile?.metric.vacanciesThreeMonthAvg != null
    ? tr(locale, "최근 3개월 평균 채용 신호", "Latest three-month average hiring signal")
    : decision?.projectedAnnualOpenings != null
      ? tr(locale, "연간 예상 채용 기회", "Projected annual openings")
      : null
  const demandDetail = insight.demand?.note || (vacancy != null && vacancyLabel
    ? `${vacancyLabel}: ${compactNumber(vacancy, locale)}`
    : tr(locale, "공식 노동시장 수요 근거를 확인합니다.", "Review official labour-market demand evidence."))

  const salary = profile?.metric.annualisedMedianSalary ?? decision?.medianAnnualWage ?? null
  const currency = profile?.currency ?? foundation?.currency ?? null
  const payDetail = salary != null
    ? tr(locale, `연간 보수 지표: ${money(salary, currency, locale)}`, `Annual pay signal: ${money(salary, currency, locale)}`)
    : tr(locale, "직업과 국가에 맞는 상대 보수 근거를 확인합니다.", "Review relative pay evidence for this career and country.")

  return [
    { label: "Demand", score: score?.demand ?? null, detail: demandDetail },
    { label: "Pay", score: score?.pay ?? null, detail: payDetail },
    { label: "Entry", score: score?.entry ?? null, detail: entryBlocker(insight, locale) },
  ]
}

function evidenceSources(insight: CareerMarketInsight, locale: Locale): ResourceLink[] {
  if (insight.foundation?.sources.length) {
    return insight.foundation.sources.slice(0, 5).map((source) => ({
      key: source.sourceKey,
      label: source.title,
      detail: source.authority,
      href: source.url,
      meta: source.lastVerifiedOn,
    }))
  }

  const sources: ResourceLink[] = insight.career.sources.map((source, index) => ({
    key: `career-${index}`,
    label: source.label,
    href: source.url,
  }))
  if (insight.demand?.sourceUrl) {
    sources.unshift({
      key: "demand",
      label: insight.demand.sourceLabel ?? tr(locale, "직업 수요 근거", "Employment-demand source"),
      href: insight.demand.sourceUrl,
    })
  }
  return dedupeLinks(sources).slice(0, 5)
}

function studyResources(insight: CareerMarketInsight, locale: Locale): ResourceLink[] {
  const profile = insight.profile
  const foundation = insight.foundation
  const resources: ResourceLink[] = []

  for (const link of profile?.programLinks ?? []) {
    if (!link.program?.url) continue
    resources.push({
      key: `program-${link.programRef}`,
      label: link.program.title,
      detail: link.program.provider,
      href: link.program.url,
      meta: link.program.durationYears ? tr(locale, `${link.program.durationYears}년`, `${link.program.durationYears} years`) : null,
    })
  }

  for (const link of profile?.links ?? []) {
    if (!["entry_program", "graduate_program"].includes(link.linkType)) continue
    resources.push({
      key: `profile-${link.url}`,
      label: link.label,
      detail: link.providerType,
      href: link.url,
    })
  }

  for (const point of foundation?.entryPoints ?? []) {
    if (!["training", "apprenticeship"].includes(point.entryType)) continue
    resources.push({
      key: point.entryPointKey,
      label: point.label,
      detail: point.provider,
      href: point.url,
      meta: point.notes,
    })
  }

  return dedupeLinks(resources).slice(0, 6)
}

function jobResources(insight: CareerMarketInsight): ResourceLink[] {
  const resources: ResourceLink[] = []

  for (const job of insight.foundation?.jobOpportunities ?? []) {
    if (job.status === "expired") continue
    resources.push({
      key: job.opportunityKey,
      label: job.title,
      detail: job.employer,
      href: job.applyUrl || job.listingUrl,
      meta: job.locationText,
    })
  }

  for (const point of insight.foundation?.entryPoints ?? []) {
    if (!["job_search", "employer"].includes(point.entryType)) continue
    resources.push({
      key: point.entryPointKey,
      label: point.label,
      detail: point.provider,
      href: point.url,
      meta: point.notes,
    })
  }

  for (const link of insight.profile?.links ?? []) {
    if (!["job_search", "employer"].includes(link.linkType)) continue
    resources.push({
      key: `profile-${link.url}`,
      label: link.label,
      detail: link.providerType,
      href: link.url,
      meta: link.regionCode,
    })
  }

  return dedupeLinks(resources).slice(0, 8)
}

function routeSteps(insight: CareerMarketInsight, locale: Locale) {
  const profile = insight.profile
  const foundation = insight.foundation
  const hasStudy = studyResources(insight, locale).length > 0 || Boolean(foundation?.blockers.some((blocker) => blocker.blockerType === "education_training"))
  const licensing = foundation?.licensingEvidence.find((item) => item.mandatory) ?? null
  const visa = foundation?.visaPathways.find((item) => item.routeRole === "primary") ?? null
  const legacyVisa = insight.visas[0] ?? null

  const steps: { title: string; detail: string; href?: string | null }[] = []

  if (profile?.registrationRequired || licensing || foundation?.blockers.some((blocker) => ["licensing", "registration", "safety_training"].includes(blocker.blockerType))) {
    steps.push({
      title: tr(locale, "자격·면허 요건 확인", "Check qualification and licensing requirements"),
      detail: entryBlocker(insight, locale),
      href: licensing?.officialSourceUrl ?? profile?.registrationUrl ?? null,
    })
  }

  if (hasStudy) {
    steps.push({
      title: tr(locale, "필요한 교육·훈련 경로 선택", "Choose the required study or training route"),
      detail: tr(locale, "직업 진입에 실제로 필요한 과정만 비교하고, 등록이나 취업으로 이어지는지 확인하세요.", "Compare only the study or training that is actually required for entry, and verify that it leads toward registration or employment."),
    })
  }

  if (visa || legacyVisa) {
    steps.push({
      title: tr(locale, "근무 권한과 비자 조건 확인", "Check work rights and visa conditions"),
      detail: visa?.notes || legacyVisa?.note || tr(locale, "점수와 별개로 실제 근무 가능 조건을 확인합니다.", "Check the conditions that determine whether you can actually work, separately from the public score."),
      href: visa?.officialSourceUrl ?? legacyVisa?.sourceUrl ?? null,
    })
  }

  steps.push({
    title: tr(locale, "실제 채용 시장으로 이동", "Move into the live job market"),
    detail: tr(locale, "현지 직무명, 고용주, 지역과 채용 요건을 실제 공고에서 확인하세요.", "Check local role titles, employers, locations and requirements in live job listings."),
  })

  return steps
}

export function CareerCoreSections({
  query,
  locale,
  initialInsight = null,
}: {
  query: OverviewSearchValues
  locale: Locale
  initialInsight?: CareerMarketInsight | null
}) {
  const [insight, setInsight] = useState<CareerMarketInsight | null>(initialInsight)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (initialInsight) {
      setInsight(initialInsight)
      setFailed(false)
      return
    }

    const controller = new AbortController()
    setInsight(null)
    setFailed(false)
    fetch(`/api/home/career-insight?country=${encodeURIComponent(query.country)}&career=${encodeURIComponent(query.occupation)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Career insight request failed")
        return response.json() as Promise<CareerProfile>
      })
      .then((profile) => setInsight(profile.compatibility))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setFailed(true)
      })
    return () => controller.abort()
  }, [initialInsight, query.country, query.occupation])

  if (failed) {
    return (
      <section className="mt-10 border-t border-campcareer-border pt-8" aria-live="polite">
        <CircleAlert className="size-5 text-campcareer-caution" />
        <h2 className="mt-3 text-xl font-semibold text-campcareer-ink">{tr(locale, "상세 근거를 불러오지 못했습니다.", "We could not load the detailed evidence.")}</h2>
        <p className="mt-2 text-sm leading-6 text-campcareer-muted">{tr(locale, "점수는 그대로 유지됩니다. 잠시 후 상세 근거를 다시 확인해 주세요.", "Your score is unchanged. Please try the detailed evidence again shortly.")}</p>
      </section>
    )
  }

  if (!insight) return <CareerCoreSkeleton />
  if (!insight.country) return null

  const evidence = evidenceRows(insight, locale)
  const sources = evidenceSources(insight, locale)
  const steps = routeSteps(insight, locale)
  const study = studyResources(insight, locale)
  const jobs = jobResources(insight)
  const careerName = locale === "ko" ? insight.career.labelKo : insight.career.label
  const programsHref = careerProgramsHref(query, locale)

  return (
    <div className="mt-10">
      <nav aria-label={tr(locale, "커리어 페이지 섹션", "Career page sections")} className="flex flex-wrap gap-x-5 gap-y-2 border-y border-campcareer-border py-3 text-sm font-medium text-campcareer-muted">
        <a href="#evidence" className="transition hover:text-brand">{tr(locale, "근거", "Evidence")}</a>
        <a href="#path" className="transition hover:text-brand">{tr(locale, "경로", "Path")}</a>
        <a href="#study" className="transition hover:text-brand">{tr(locale, "학업·과정", "Study / Programs")}</a>
        <a href="#jobs" className="transition hover:text-brand">{tr(locale, "일자리", "Jobs")}</a>
      </nav>

      <section id="evidence" className="scroll-mt-24 border-b border-campcareer-border py-10" aria-labelledby="evidence-heading">
        <SectionHeading
          eyebrow={tr(locale, "CampCareer Score 근거", "CampCareer Score evidence")}
          title={tr(locale, "왜 이 점수인가", "Why this score")}
          description={tr(locale, `${careerName}의 공개 점수는 Demand, Pay, Entry 세 항목의 근거로 설명합니다.`, `The public score for ${careerName} is explained through Demand, Pay and Entry evidence.`)}
        />
        <div className="mt-7 divide-y divide-campcareer-border border-y border-campcareer-border">
          {evidence.map((row) => (
            <div key={row.label} className="grid gap-2 py-5 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-6">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-semibold text-campcareer-ink">{row.label}</p>
                {row.score != null && <span className="text-sm font-bold tabular-nums text-brand">{row.score}</span>}
              </div>
              <p className="text-sm leading-6 text-campcareer-ink-secondary">{row.detail}</p>
            </div>
          ))}
        </div>
        {sources.length > 0 && (
          <div className="mt-7">
            <p className="text-xs font-semibold text-campcareer-muted">{tr(locale, "주요 출처", "Key sources")}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {sources.map((source) => <ResourceRow key={source.key} resource={source} />)}
            </div>
          </div>
        )}
      </section>

      <section id="path" className="scroll-mt-24 border-b border-campcareer-border py-10" aria-labelledby="path-heading">
        <SectionHeading
          eyebrow={tr(locale, "기본 진입 경로", "Basic entry path")}
          title={tr(locale, "이 커리어에 도달하는 순서", "The path to get there")}
          description={tr(locale, "개인 정보를 요구하기 전에, 누구나 확인할 수 있는 기본 경로를 먼저 보여줍니다. 비자와 개인 자격은 점수와 분리해 실제 행동 단계에서 다룹니다.", "Before asking for personal details, CampCareer shows the basic public route. Visa and personal eligibility stay outside the score and appear here as action conditions.")}
        />
        <ol className="mt-7 divide-y divide-campcareer-border border-y border-campcareer-border">
          {steps.map((step, index) => (
            <li key={`${step.title}-${index}`} className="grid gap-3 py-5 md:grid-cols-[3rem_minmax(0,1fr)_auto] md:items-start md:gap-5">
              <span className="text-sm font-bold tabular-nums text-brand">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-base font-semibold text-campcareer-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-campcareer-ink-secondary">{step.detail}</p>
              </div>
              {step.href && <ExternalAction href={step.href} label={tr(locale, "공식 요건", "Official requirements")} />}
            </li>
          ))}
        </ol>
      </section>

      <section id="study" className="scroll-mt-24 border-b border-campcareer-border py-10" aria-labelledby="study-heading">
        <SectionHeading
          eyebrow={tr(locale, "경로에 필요한 경우", "When the path requires it")}
          title="Study / Programs"
          description={tr(locale, "학업은 독립적인 목적지가 아니라 이 커리어에 진입하는 데 필요한 경우에만 경로 안에서 제시합니다.", "Study is not a separate destination here. It appears when education or training helps you enter this career.")}
        />
        {study.length > 0 ? (
          <div className="mt-7">
            <div className="grid gap-3 md:grid-cols-2">
              {study.map((resource) => <ResourceCard key={resource.key} resource={resource} icon={<GraduationCap className="size-4" />} />)}
            </div>
            <Link href={programsHref} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:opacity-80">
              {tr(locale, "이 커리어의 프로그램 더 보기", "Explore more programs for this career")} <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <SurfaceEmptyState
            icon={<GraduationCap className="size-5" />}
            title={tr(locale, "검증된 직접 과정 링크를 더 정리하고 있습니다.", "We are still consolidating verified program links.")}
            detail={tr(locale, "직업 진입에 학업이 필요한 경우, 관련 과정만 연결합니다. 현재는 Programs에서 추가 옵션을 확인할 수 있습니다.", "When study is required for entry, CampCareer links only relevant routes. You can inspect additional options in Programs for now.")}
            action={<Link href={programsHref} className="inline-flex min-h-10 items-center gap-1.5 rounded-cc-control px-1 text-sm font-semibold text-brand transition-colors duration-cc-fast hover:text-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              {tr(locale, "이 커리어의 Programs 보기", "Explore Programs for this career")} <ArrowRight className="size-4" />
            </Link>}
          />
        )}
      </section>

      <section id="jobs" className="scroll-mt-24 py-10" aria-labelledby="jobs-heading">
        <SectionHeading
          eyebrow={tr(locale, "실제 노동시장", "Live labour market")}
          title="Jobs"
          description={tr(locale, "점수와 경로를 확인한 뒤, 실제 고용주와 채용 공고에서 요구 조건을 검증하세요.", "After reviewing the score and path, validate the requirements in real employer and job listings.")}
        />
        {jobs.length > 0 ? (
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {jobs.map((resource) => <ResourceCard key={resource.key} resource={resource} icon={<BriefcaseBusiness className="size-4" />} />)}
          </div>
        ) : (
          <SurfaceEmptyState
            icon={<BriefcaseBusiness className="size-5" />}
            title={tr(locale, "직접 연결된 채용 링크를 더 확인하고 있습니다.", "We are still verifying direct job links.")}
            detail={tr(locale, "CampCareer는 확인되지 않은 채용 공고를 만들어내지 않습니다. 공식 고용주나 채용 출처가 확인되면 이곳에 연결합니다.", "CampCareer does not invent job listings. Verified employer or job-search sources will appear here when available.")}
          />
        )}
      </section>
    </div>
  )
}

function CareerCoreSkeleton() {
  return (
    <div className="mt-10 border-t border-campcareer-border pt-8" aria-label="Loading" role="status">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-8 w-48" />
      <div className="mt-7 space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-semibold tracking-[0.06em] text-brand">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-campcareer-ink sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-campcareer-ink-secondary sm:text-base">{description}</p>
    </header>
  )
}

function ResourceRow({ resource }: { resource: ResourceLink }) {
  return (
    <SourceInfo label={resource.label} detail={[resource.detail, resource.meta].filter(Boolean).join(" · ") || undefined} href={resource.href} />
  )
}

function ResourceCard({ resource, icon }: { resource: ResourceLink; icon: ReactNode }) {
  return (
    <a href={resource.href} target="_blank" rel="noreferrer" className="group rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-4 shadow-cc-surface transition-colors duration-cc-fast hover:border-brand/40 hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-8 place-items-center rounded-cc-control bg-brand-tint text-brand">{icon}</span>
        <ExternalLink className="size-3.5 text-campcareer-muted transition-colors duration-cc-fast group-hover:text-brand" />
      </div>
      <h3 className="mt-4 text-sm font-semibold leading-5 text-campcareer-ink">{resource.label}</h3>
      {resource.detail && <p className="mt-1 text-xs leading-5 text-campcareer-ink-secondary">{resource.detail}</p>}
      {resource.meta && <p className="mt-2 text-xs leading-5 text-campcareer-muted">{resource.meta}</p>}
    </a>
  )
}

function ExternalAction({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-cc-control px-1 text-sm font-semibold text-brand transition-colors duration-cc-fast hover:text-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
      {label} <ExternalLink className="size-3.5" />
    </a>
  )
}
