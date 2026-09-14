import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, GraduationCap, MapPin } from "lucide-react"
import { JsonLd, breadcrumbLd, itemListLd } from "@/components/seo/json-ld"
import { getIrelandCountryDegreeInstitutionConnections } from "@/lib/career-degree/ireland-institution-evidence.server"
import { getIrelandInstitutions, type IrelandInstitution } from "@/lib/institutions/ireland-institutions.server"
import { institutionDetailPath } from "@/lib/institutions/institution-search"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Education in Ireland: Study Areas and Institutions",
  description: "Explore reviewed Ireland study areas, their connected careers and nine verified HEA-recognised institutions across Dublin, Cork, Galway and Limerick.",
  alternates: { canonical: "/countries/ie/education" },
  robots: { index: true, follow: true },
}

async function safeIrelandInstitutions(): Promise<readonly IrelandInstitution[]> {
  try {
    return await getIrelandInstitutions()
  } catch (error) {
    console.error("Unable to load Ireland institutions for Education hub", error)
    return []
  }
}

export default async function IrelandEducationPage() {
  const [degreeConnections, institutions] = await Promise.all([
    getIrelandCountryDegreeInstitutionConnections(),
    safeIrelandInstitutions(),
  ])

  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: "Countries", path: "/countries" },
        { name: "Ireland", path: "/countries/ie" },
        { name: "Education", path: "/countries/ie/education" },
      ])} />
      <JsonLd data={itemListLd(institutions.map((institution) => ({
        name: institution.name,
        path: institutionDetailPath("IE", institution.slug),
      })))} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#77746e]" aria-label="Breadcrumb">
          <Link href="/countries" className="hover:text-[#1b1b1b]">Countries</Link>
          <span>/</span>
          <Link href="/countries/ie" className="hover:text-[#1b1b1b]">Ireland</Link>
          <span>/</span>
          <span>Education</span>
        </nav>

        <section className="mt-7 rounded-2xl border border-[#dfe8db] bg-[#f7faf5] p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3e7a2e]">Ireland education intelligence</p>
          <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.035em] text-[#1b1b1b] sm:text-[40px]">Education in Ireland</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-[#5f6f5b]">
            Reviewed study areas connect the first Ireland Career cohort to verified institution evidence. Exact public programme listings remain gated until current programme-level eligibility is verified.
          </p>
        </section>

        <section className="mt-8" aria-labelledby="study-areas">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-[#3e7a2e]" />
            <h2 id="study-areas" className="text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Reviewed study areas</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {degreeConnections.map((connection) => (
              <article key={connection.degree.id} className="rounded-xl border border-[#e7e6e3] bg-white p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66805f]">Study area</p>
                <h3 className="mt-1 text-[16px] font-semibold text-[#1b1b1b]">{connection.degree.name}</h3>
                {connection.degree.description ? <p className="mt-2 text-[11.5px] leading-5 text-[#77746e]">{connection.degree.description}</p> : null}
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8f8c85]">Connected careers</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {connection.careers.map((career) => (
                    <Link key={career.careerId} href={careerCanonicalPath("IE", career.careerId)} className="inline-flex items-center gap-1 rounded-md border border-[#d8e7d2] bg-[#f7faf5] px-2.5 py-1.5 text-[11px] font-semibold text-[#2563eb] hover:underline">
                      {career.careerName} <ArrowRight className="size-3" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="verified-institutions">
          <div className="flex flex-wrap items-center gap-2">
            <Building2 className="size-4 text-[#6d4fc4]" />
            <h2 id="verified-institutions" className="text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Verified institutions</h2>
            <Link href="/institutions/ie" className="ml-auto text-[11.5px] font-semibold text-[#2563eb] hover:underline">Open institution explorer</Link>
          </div>
          <p className="mt-1 text-[12px] text-[#6f6d68]">HEA-recognised institutions with verified locations in the current four-city Ireland scope.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {institutions.map((institution) => (
              <Link key={institution.id} href={institutionDetailPath("IE", institution.slug)} className="group rounded-xl border border-[#e7e6e3] bg-white p-5 transition hover:border-[#c9d7f5] hover:shadow-sm">
                <h3 className="text-[15px] font-semibold text-[#1b1b1b] group-hover:text-[#2563eb]">{institution.name}</h3>
                <p className="mt-1 text-[10.5px] font-medium text-[#77746e]">{institution.providerAuthority}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {institution.locations.map((location) => (
                    <span key={location.id} className="inline-flex items-center gap-1 rounded-md bg-[#fafaf8] px-2 py-1 text-[10.5px] font-semibold text-[#6f6d68]">
                      <MapPin className="size-3" aria-hidden="true" />{location.city.name}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/countries/ie/careers" className="rounded-xl border border-[#d9e3f7] bg-[#f7f9fe] p-5">
            <h2 className="text-[16px] font-semibold text-[#1b1b1b]">Careers in Ireland</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#6f6d68]">Start from a reviewed Career and follow its connected study areas.</p>
          </Link>
          <Link href="/countries/ie/cities" className="rounded-xl border border-[#eadfca] bg-[#fffaf1] p-5">
            <h2 className="text-[16px] font-semibold text-[#1b1b1b]">Study cities</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#6f6d68]">Compare the four published Ireland cities and their verified institution coverage.</p>
          </Link>
        </section>
      </main>
    </>
  )
}
