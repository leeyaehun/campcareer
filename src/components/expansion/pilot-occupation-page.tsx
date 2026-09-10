import Link from "next/link"
import type { PilotOccupation } from "@/lib/pilot-launch-gate"
import { scoreHiddenRoiPath } from "@/lib/hidden-roi"
import { buildCountryCompareCanonicalHref } from "@/lib/compare-routes"

export function pilotOccupationSlug(occupation: Pick<PilotOccupation, "nameEn" | "sourceCode">) {
  const base = (occupation.nameEn ?? occupation.sourceCode)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return base || occupation.sourceCode.toLowerCase()
}

export function PilotOccupationPage({
  occupation,
  locale,
}: {
  occupation: PilotOccupation
  locale: "en" | "ko"
}) {
  const roi = scoreHiddenRoiPath(occupation)
  const korean = locale === "ko"
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
          <Link href={korean ? `/ko/${occupation.country.toLowerCase()}/jobs` : `/expansion/${occupation.country.toLowerCase()}/jobs`} className="text-sm font-semibold text-slate-500 hover:text-slate-950">
            {korean ? "직업 목록" : "Occupation list"}
          </Link>
          <p className="mt-7 text-xs font-semibold uppercase tracking-widest text-brand">{occupation.sourceCode} · ISCO {occupation.iscoCode ?? "pending"}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">{korean ? occupation.nameKo : occupation.nameEn}</h1>
          {occupation.localName && <p className="mt-3 text-lg text-slate-500">{occupation.localName}</p>}
          <p className="mt-5 text-base leading-7 text-slate-600">
            {korean ? "임금, 수요, 외국인 취업 경로, 언어 장벽을 함께 검증한 숨은 고ROI 직업 경로입니다." : "A hidden high-ROI path validated across income, demand, foreign-worker access, and language barriers."}
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-4xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6">
        <Metric label={korean ? "대표 임금" : "Representative pay"} value={formatSalary(occupation, korean)} />
        <Metric label={korean ? "수요 점수" : "Demand score"} value={occupation.shortageScore === null ? "Pending" : `${occupation.shortageScore}/100`} />
        <Metric label={korean ? "고ROI 점수" : "Hidden ROI score"} value={roi.score === null ? "Pending" : `${roi.score}/100`} />
      </section>
      {occupation.details && <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Detail title={korean ? "수요와 지역" : "Demand and geography"} value={formatDemand(occupation, korean)} />
          <Detail title={korean ? "통계 기준" : "Statistical basis"} value={[occupation.details.statisticPeriod, occupation.details.salary?.definition].filter(Boolean).join(" · ") || (korean ? "검토 중" : "Under review")} />
          <Detail title={korean ? "외국인 취업 경로" : "Foreign-worker pathway"} value={occupation.details.foreignWorkerPathway || (korean ? "공식 정책 검토 전" : "Official policy review pending")} />
          <Detail title={korean ? "언어 요건" : "Language requirement"} value={occupation.details.languageRequirement || (korean ? "직업별 공식 근거 없음" : "No occupation-specific official evidence")} />
        </div>
        {occupation.details.evidence && occupation.details.evidence.length > 0 && <div className="mt-6 border-t border-slate-200 pt-5">
          <h2 className="text-lg font-semibold">{korean ? "출처" : "Sources"}</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {occupation.details.evidence.map((evidence) => <li key={evidence.sourceUrl}><a className="font-medium text-slate-950 hover:underline" href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer">{evidence.sourceName}</a> · {evidence.lastChecked} · {evidence.confidence}</li>)}
          </ul>
        </div>}
        <Link href={buildCountryCompareCanonicalHref({ goal: occupation.nameEn ?? occupation.sourceCode })} className="mt-7 inline-flex text-sm font-semibold text-slate-950 hover:underline">{korean ? "내 조건으로 국가 비교하기" : "Compare countries for my situation"}</Link>
      </section>}
    </main>
  )
}

function formatSalary(occupation: PilotOccupation, korean: boolean) {
  const salary = occupation.details?.salary
  if (!salary) return occupation.medianSalary === null ? "Pending" : occupation.medianSalary.toLocaleString()
  const value = salary.annualizedValue ?? salary.value
  return `${occupation.details?.currency ?? ""} ${value.toLocaleString()}${salary.annualizedValue ? (korean ? "/년 추정" : "/year est.") : `/${salary.unit}`}`.trim()
}

function formatDemand(occupation: PilotOccupation, korean: boolean) {
  const demand = occupation.details?.demand
  if (!demand) return korean ? "검토 중" : "Pending"
  const ratio = demand.openingsToApplicantsRatio === null ? "N/A" : demand.openingsToApplicantsRatio.toFixed(2)
  return korean
    ? `구인 ${demand.jobOpenings?.toLocaleString() ?? "N/A"} · 구직 ${demand.applicants?.toLocaleString() ?? "N/A"} · 비율 ${ratio}`
    : `Openings ${demand.jobOpenings?.toLocaleString() ?? "N/A"} · applicants ${demand.applicants?.toLocaleString() ?? "N/A"} · ratio ${ratio}`
}

function Detail({ title, value }: { title: string; value: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p><p className="mt-2 text-sm leading-6 text-slate-700">{value}</p></div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}
