import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, GraduationCap, MapPin } from "lucide-react"
import { JsonLd, breadcrumbLd, itemListLd } from "@/components/seo/json-ld"
import { getIrelandCountryDegreeInstitutionConnections } from "@/lib/career-degree/ireland-institution-evidence.server"
import { getIrelandEmploymentEcosystem } from "@/lib/employment/ireland-employment-ecosystem.server"
import {
  buildIrelandCareerCompareHref,
  IE_CAREER_COMPARE_IDS,
  IE_CAREER_COMPARE_LABELS,
} from "@/lib/ireland-career-comparison"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Careers in Ireland",
  description: "Explore six reviewed Ireland career paths with source-backed demand, pay context, entry requirements, industries and connected study areas.",
  alternates: { canonical: "/countries/ie/careers" },
  robots: { index: true, follow: true },
}

export default async function IrelandCareersPage() {
  const [degreeConnections, ecosystem] = await Promise.all([
    getIrelandCountryDegreeInstitutionConnections(),
    getIrelandEmploymentEcosystem(),
  ])

  const careers = IE_CAREER_COMPARE_IDS.map((careerId) => {
    const studyAreas = degreeConnections
      .filter((connection) => connection.careers.some((career) => career.careerId === careerId))
      .map((connection) => connection.degree.name)
    const industries = ecosystem.industries
      .filter((industry) => industry.careers.some((career) => career.careerId === careerId))
      .map((industry) => industry.name)

    return {
      careerId,
      label: IE_CAREER_COMPARE_LABELS[careerId],
      href: careerCanonicalPath("IE", careerId),
      studyAreas,
      industries,
    }
  })

  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: "Countries", path: "/countries" },
        { name: "Ireland", path: "/countries/ie" },
        { name: "Careers", path: "/countries/ie/careers" },
      ])} />
      <JsonLd data={itemListLd(careers.map((career) => ({ name: career.label, path: career.href })))} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#77746e]" aria-label="Breadcrumb">
          <Link href="/countries" className="hover:text-[#1b1b1b]">Countries</Link>
          <span>/</span>
          <Link href="/countries/ie" className="hover:text-[#1b1b1b]">Ireland</Link>
          <span>/</span>
          <span>Careers</span>
        </nav>

        <section className="mt-7 rounded-2xl border border-[#d9e3f7] bg-[#f7f9fe] p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2563eb]">Ireland career intelligence</p>
          <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.035em] text-[#1b1b1b] sm:text-[40px]">Careers in Ireland</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-[#5d6470]">
            Six reviewed Career paths with public decision evidence and connected study areas. Missing or broad evidence stays labelled rather than being converted into a precise claim.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={buildIrelandCareerCompareHref()} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#2557e0] px-4 text-[12px] font-semibold text-white hover:bg-[#1d4ed8]">
              Compare careers <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/countries/ie" className="inline-flex min-h-11 items-center rounded-lg border border-[#cfd9ec] bg-white px-4 text-[12px] font-semibold text-[#3e4a5b] hover:text-[#2563eb]">
              Ireland overview
            </Link>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="reviewed-careers">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="size-4 text-[#2563eb]" />
            <h2 id="reviewed-careers" className="text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Reviewed career paths</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {careers.map((career) => (
              <Link key={career.careerId} href={career.href} className="group rounded-xl border border-[#e7e6e3] bg-white p-5 transition hover:border-[#c9d7f5] hover:shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8f8c85]">Reviewed career</p>
                <div className="mt-1 flex items-start justify-between gap-3">
                  <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1b1b1b] group-hover:text-[#2563eb]">{career.label}</h3>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-[#aaa7a0] group-hover:text-[#2563eb]" aria-hidden="true" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66805f]"><GraduationCap className="size-3" />Study areas</p>
                    <p className="mt-1 text-[11.5px] leading-5 text-[#6f6d68]">{career.studyAreas.join(" · ") || "Reviewed study connection pending"}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5e6f91]"><BriefcaseBusiness className="size-3" />Industry context</p>
                    <p className="mt-1 text-[11.5px] leading-5 text-[#6f6d68]">{career.industries.join(" · ") || "Industry context pending"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/countries/ie/education" className="group rounded-xl border border-[#dfe8db] bg-[#f7faf5] p-5">
            <GraduationCap className="size-4 text-[#3e7a2e]" />
            <h2 className="mt-2 text-[16px] font-semibold text-[#1b1b1b] group-hover:text-[#3e7a2e]">Education pathways</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#6f6d68]">See the reviewed study areas and verified Ireland institutions connected to this first Career cohort.</p>
          </Link>
          <Link href="/countries/ie/cities" className="group rounded-xl border border-[#eadfca] bg-[#fffaf1] p-5">
            <MapPin className="size-4 text-[#a86514]" />
            <h2 className="mt-2 text-[16px] font-semibold text-[#1b1b1b] group-hover:text-[#a86514]">Ireland cities</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#6f6d68]">Compare Dublin, Cork, Galway and Limerick using verified student-planning context.</p>
          </Link>
        </section>
      </main>
    </>
  )
}
