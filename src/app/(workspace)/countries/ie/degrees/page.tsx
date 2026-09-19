import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, BriefcaseBusiness, GraduationCap } from "lucide-react"
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld"
import { buildIrelandDegreeDiscovery } from "@/lib/degree-match/ireland-degree-discovery"
import { buildIrelandDegreeCompareHref } from "@/lib/degree-match/ireland-degree-comparison"
import { IrelandDegreesExplorer } from "./degrees-explorer"

export const dynamic = "force-dynamic"

type IrelandDegreesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const DEGREE_FILTER_KEYS = ["career", "relationship", "regulation"] as const

function hasDegreeFilters(params: Record<string, string | string[] | undefined>) {
  return DEGREE_FILTER_KEYS.some((key) => Boolean(params[key]))
}

export async function generateMetadata({ searchParams }: IrelandDegreesPageProps): Promise<Metadata> {
  const params = await searchParams
  return {
    title: "Degrees in Ireland: Reviewed study fields and connected careers",
    description: "Explore the six reviewed Ireland Degrees, the Careers they can lead toward, evidence confidence and professional requirements.",
    alternates: { canonical: "/countries/ie/degrees" },
    robots: hasDegreeFilters(params) ? { index: false, follow: false } : { index: true, follow: true },
  }
}

export default async function IrelandDegreesPage() {
  const entries = buildIrelandDegreeDiscovery("en")

  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: "Countries", path: "/countries" },
        { name: "Ireland", path: "/countries/ie" },
        { name: "Degrees", path: "/countries/ie/degrees" },
      ])} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#77746e]" aria-label="Breadcrumb">
          <Link href="/countries" className="hover:text-[#1b1b1b]">Countries</Link>
          <span>/</span>
          <Link href="/countries/ie" className="hover:text-[#1b1b1b]">Ireland</Link>
          <span>/</span>
          <span>Degrees</span>
        </nav>

        <section className="mt-7 rounded-2xl border border-[#dfe8db] bg-[#f7faf5] p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3e7a2e]">Ireland degree intelligence</p>
          <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.035em] text-[#1b1b1b] sm:text-[40px]">Degrees in Ireland</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-[#5f6f5b]">
            What can you study in Ireland, and where can it lead? Six reviewed Degrees connect to the
            first Ireland Career cohort with categorical relationships, evidence confidence and
            professional requirements — never a numeric Degree score or ranking.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={buildIrelandDegreeCompareHref()} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#3e7a2e] px-4 text-[12px] font-semibold text-white hover:bg-[#356a28]">
              Compare degrees <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/countries/ie/education" className="inline-flex min-h-11 items-center rounded-lg border border-[#d5e3cf] bg-white px-4 text-[12px] font-semibold text-[#3e4a5b] hover:text-[#3e7a2e]">
              Education &amp; institutions
            </Link>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="reviewed-degrees">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-[#3e7a2e]" />
            <h2 id="reviewed-degrees" className="text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Reviewed degrees</h2>
          </div>
          <Suspense fallback={<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="rounded-xl border border-[#e7e6e3] bg-[#fafaf8] p-5">
                <div className="h-3 w-1/3 rounded bg-[#e7e6e3]" />
                <div className="mt-3 h-3 w-2/3 rounded bg-[#efeee9]" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[#efeee9]" />
              </div>
            ))}
          </div>}>
            <IrelandDegreesExplorer entries={entries} />
          </Suspense>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/countries/ie/careers" className="group rounded-xl border border-[#d9e3f7] bg-[#f7f9fe] p-5">
            <BriefcaseBusiness className="size-4 text-[#2563eb]" />
            <h2 className="mt-2 text-[16px] font-semibold text-[#1b1b1b] group-hover:text-[#2563eb]">Careers in Ireland</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#6f6d68]">Start from a reviewed Career and follow its Connected study field, or open the Career Page verdict.</p>
          </Link>
          <Link href="/countries/ie/education" className="group rounded-xl border border-[#dfe8db] bg-[#f7faf5] p-5">
            <GraduationCap className="size-4 text-[#3e7a2e]" />
            <h2 className="mt-2 text-[16px] font-semibold text-[#1b1b1b] group-hover:text-[#3e7a2e]">Education &amp; institutions</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#6f6d68]">Verified Ireland institution evidence connected to this first Career cohort.</p>
          </Link>
        </section>
      </main>
    </>
  )
}