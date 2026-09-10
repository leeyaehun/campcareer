import Link from "next/link"
import type { ExpansionCountry } from "@/data/expansion-countries"
import { getPilotSources, type PilotCountryCode } from "@/data/pilot-source-registry"
import { PILOT_OCCUPATIONS } from "@/data/pilot-occupations"
import { evaluatePilotLaunch } from "@/lib/pilot-launch-gate"
import { buildCountryCompareCanonicalHref } from "@/lib/compare-routes"

const PILOT_CODE_BY_SLUG: Record<string, PilotCountryCode> = {
  kr: "KR",
  jp: "JP",
  sg: "SG",
  fr: "FR",
}

export function isPilotCountry(country: ExpansionCountry): country is ExpansionCountry & { slug: keyof typeof PILOT_CODE_BY_SLUG } {
  return country.slug in PILOT_CODE_BY_SLUG
}

export function PilotCountryPage({ country, locale }: { country: ExpansionCountry; locale: "en" | "ko" }) {
  if (!isPilotCountry(country)) return null

  const code = PILOT_CODE_BY_SLUG[country.slug]
  const sources = getPilotSources(code)
  const gate = evaluatePilotLaunch(code, sources, PILOT_OCCUPATIONS)
  const korean = locale === "ko"
  const alternateHref = korean ? `/expansion/${country.slug}` : `/ko/${country.slug}`

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-950">
            {korean ? "CampCareer 한국어" : "CampCareer"}
          </Link>
          <p className="mt-7 text-xs font-semibold uppercase tracking-widest text-brand">
            {korean ? "국가 데이터 파일럿" : "Country data pilot"}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
            {korean ? `${country.nameKo} 유학·취업 경로` : `Study and work pathways in ${country.nameEn}`}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {korean
              ? "연봉, 인력 부족, 외국인 취업 경로, 언어 장벽, 한국 귀국 대비를 함께 검증하는 국가 데이터 파일럿입니다."
              : "This pilot validates salary, labour demand, foreign-worker pathways, language barriers, and a South Korea return benchmark together."}
          </p>
          <Link href={alternateHref} className="mt-5 inline-flex text-sm font-semibold text-slate-700 hover:underline">
            {korean ? "View in English" : "한국어로 보기"}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {korean ? "출시 상태" : "Launch status"}
          </p>
          <p className={gate.ready ? "mt-2 text-2xl font-semibold text-emerald-700" : "mt-2 text-2xl font-semibold text-amber-700"}>
            {gate.ready ? (korean ? "색인 준비 완료" : "Ready for indexing") : (korean ? "공식 데이터 검증 진행 중" : "Official data validation in progress")}
          </p>
          {!gate.ready && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {korean
                ? "검증된 직업 데이터가 50개에 도달하고, 임금·수요 근거가 충족될 때까지 이 경로는 검색엔진에 색인되지 않습니다."
                : "This route remains out of search indexes until 50 reviewed occupations meet the salary, demand, and pathway evidence gate."}
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <Metric label={korean ? "등록 공식 출처" : "Registered official sources"} value={`${Math.round(gate.sourceCoverage * 100)}%`} />
          <Metric label={korean ? "수집 직업" : "Collected occupations"} value={`${gate.rawOccupationCount}`} />
          <Metric label={korean ? "승인 직업" : "Approved occupations"} value={`${gate.occupationCount}/50`} />
          <Metric label={korean ? "임금·수요 근거" : "Salary and demand evidence"} value={`${Math.round(gate.salaryAndDemandCoverage * 100)}%`} />
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">{korean ? "공식 데이터 소스" : "Official data sources"}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sources.map((source) => (
              <a key={source.category} href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{source.category}</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{source.sourceName}</p>
                <p className="mt-1 text-xs text-slate-500">{source.refreshCadence} refresh · {source.reviewStatus}</p>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">{korean ? "다음 행동" : "Next action"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {korean ? "직업 공개 전에는 개인 조건으로 국가 선택을 비교하고, 공개 후에는 직업별 숨은 고ROI 경로로 이어집니다." : "Compare countries by your situation now; reviewed occupation-level hidden high-ROI paths appear here after launch gates pass."}
          </p>
          <Link href={buildCountryCompareCanonicalHref({ goal: country.nameEn })} className="mt-4 inline-flex text-sm font-semibold text-slate-950 hover:underline">
            {korean ? "국가 비교하기" : "Compare countries"}
          </Link>
        </div>
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}
