import Link from "next/link"
import { BadgeCheck, BookOpen, BriefcaseBusiness } from "lucide-react"
import type { StudyConcept } from "@/lib/study-product/types"
import { getLocalizedConceptLabel } from "@/data/study-concepts"
import { COUNTRY_ROI_INSIGHTS } from "@/data/country-roi-mvp"
import { buildCompareHref } from "@/lib/blog/compare-link"

const COVERAGE_LABEL = {
  CATALOG: "Catalogued",
  PROFILE_READY: "Profile available",
  PATHWAY_READY: "Pathway available",
  DECISION_READY: "Decision-ready",
} as const

export function ConceptProfile({ concept, locale }: { concept: StudyConcept; locale: "en" | "ko-KR" }) {
  const korean = locale === "ko-KR"
  const label = getLocalizedConceptLabel(concept, locale)
  const kind = concept.kind === "TRADE_PATHWAY"
    ? (korean ? "기술·직업교육" : "Trade pathway")
    : concept.kind === "QUALIFICATION"
      ? (korean ? "Diploma·Certificate" : "Diploma or certificate")
      : (korean ? "학위·전공" : "Degree or study field")

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">{kind}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{label}</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
        {korean ? `${concept.description} 과정의 국가별 비용, 취업 결과와 학업 후 경로를 비교하세요.` : `${concept.description} Compare country coverage, verified pathways, costs and career evidence before choosing a course.`}
      </p>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Fact icon={BookOpen} title={korean ? "과정 유형" : "Study type"} value={kind} />
        <Fact icon={BriefcaseBusiness} title={korean ? "검색 별칭" : "Also searched as"} value={[...concept.aliases, ...(korean ? concept.aliasesKo : [])].slice(0, 3).join(", ")} />
        <Fact icon={BadgeCheck} title={korean ? "분류 원칙" : "Classification rule"} value={korean ? "국가별 공식 코드와 글로벌 개념을 분리" : "Global concept kept separate from country codes"} />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-950">{korean ? "국가별 데이터 범위" : "Country data coverage"}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(concept.coverageByCountry).map(([country, coverage]) => (
            <div key={country} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-950">{country}</p>
              <p className="mt-1 text-sm text-slate-600">{COVERAGE_LABEL[coverage]}</p>
              {coverage === "DECISION_READY" && (
                <Link href={`/countries/${COUNTRY_ROI_INSIGHTS.find((item) => item.code === country)?.slug ?? country.toLowerCase()}/fields/${concept.slug}`} className="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:underline">
                  {korean ? "근거 보기" : "View evidence"}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {concept.officialCodes?.length ? (
        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-950">{korean ? "연결된 공식 분류" : "Linked official classifications"}</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {concept.officialCodes.map((code) => <li key={`${code.system}-${code.version}-${code.code}`}>{code.country} · {code.system} {code.version} · {code.code}</li>)}
          </ul>
          <p className="mt-4 text-xs leading-5 text-slate-500">{korean ? "코드 간 연결은 검색을 위한 관계이며 임금·비자 결과를 자동 추론하지 않습니다." : "Code mappings support discovery; they never infer wages, licensing, or visa eligibility."}</p>
        </section>
      ) : null}

      <Link href={buildCompareHref({ major: concept.slug })} className="mt-12 inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700">
        {korean ? "내 조건으로 국가 비교하기" : "Compare countries for my situation"}
      </Link>
    </main>
  )
}

function Fact({ icon: Icon, title, value }: { icon: typeof BookOpen; title: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><Icon className="h-5 w-5 text-blue-700" /><p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-2 text-sm leading-6 text-slate-800">{value}</p></div>
}
