import Link from "next/link"
import { ArrowRight, ArrowUpRight, Building2, ExternalLink, MapPin, ShieldCheck } from "lucide-react"
import { institutionCountryPath } from "@/lib/institutions/institution-search"
import type { IrelandInstitution } from "@/lib/institutions/ireland-institutions.server"
import type { IrelandInstitutionCareerDegreeEvidence } from "@/lib/career-degree/contract"
import {
  buildIrelandCareerCompareHref,
  IE_CAREER_COMPARE_MIN_CAREERS,
  normalizeIrelandCareerIds,
} from "@/lib/ireland-career-comparison"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"

export function IrelandInstitutionDetailView({
  institution,
  careerDegreeEvidence,
}: {
  institution: IrelandInstitution
  careerDegreeEvidence: readonly IrelandInstitutionCareerDegreeEvidence[]
}) {
  const countryPath = institutionCountryPath("IE")
  const compareCareerIds = normalizeIrelandCareerIds(careerDegreeEvidence.map((relation) => relation.career.careerId))
  const compareHref = compareCareerIds.length >= IE_CAREER_COMPARE_MIN_CAREERS
    ? buildIrelandCareerCompareHref(compareCareerIds)
    : null

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[#6f6d68]">
        <Link href="/countries/ie" className="transition hover:text-[#3e7a2e]">Ireland</Link>
        <span>/</span>
        <Link href={countryPath} className="transition hover:text-[#3e7a2e]">Institutions</Link>
        <span>/</span>
        <span className="truncate text-[#5f5d58]">{institution.name}</span>
      </nav>

      <header className="mt-5 rounded-2xl border border-[#e7e6e3] bg-white p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#edf5ea] text-[#3e7a2e]"><Building2 className="size-5" aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3e7a2e]">Ireland institution</p>
              <h1 className="mt-2 max-w-3xl text-[27px] font-semibold leading-tight tracking-[-0.025em] text-[#1b1b1b] sm:text-3xl">{institution.name}</h1>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#edf5ea] px-3 py-1.5 text-[11px] font-semibold text-[#3e7a2e]"><ShieldCheck className="size-3.5" aria-hidden="true" />HEA-recognised identity</p>
            </div>
          </div>
          <a href={institution.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3e7a2e] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#326625]">
            Official website <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[#e7e6e3] bg-white p-5">
          <div className="flex items-center gap-2 text-[#3e7a2e]"><MapPin className="size-4" aria-hidden="true" /><h2 className="text-[14.5px] font-semibold">Verified locations</h2></div>
          <p className="mt-2 text-[12px] leading-5 text-[#6f6d68]">Each location is linked only where its Ireland City page is already published.</p>
          <div className="mt-4 space-y-3">
            {institution.locations.map((location) => {
              const address = [location.addressLine, location.postalCode].filter(Boolean).join(" ")
              return (
                <article key={location.id} className="rounded-xl border border-[#e7e6e3] bg-[#fafaf8] p-4">
                  <h3 className="text-[13px] font-semibold text-[#1b1b1b]">{location.name}</h3>
                  <Link href={location.city.path} className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563eb] hover:underline">
                    {location.city.name} <ArrowUpRight className="size-3" aria-hidden="true" />
                  </Link>
                  <p className="mt-1 text-[10.5px] leading-4 text-[#6f6d68]">{[address, location.region].filter(Boolean).join(" · ")}</p>
                  <a href={location.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#3e7a2e] hover:underline">
                    Official location evidence <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </article>
              )
            })}
          </div>
        </section>

        <div className="space-y-4">
          {careerDegreeEvidence.length > 0 ? (
            <section className="rounded-xl border border-[#e7e6e3] bg-white p-5">
              <div className="flex items-center gap-2 text-[#3e7a2e]"><ShieldCheck className="size-4" aria-hidden="true" /><h2 className="text-[14.5px] font-semibold">Career-linked study evidence</h2></div>
              <p className="mt-3 text-[12px] leading-5 text-[#6f6d68]">Reviewed provider evidence connects these degree fields to Careers. It is not a programme listing or availability claim.</p>
              <div className="mt-4 space-y-3">
                {careerDegreeEvidence.map((relation) => (
                  <article key={`${relation.degree.id}-${relation.career.careerId}`} className="rounded-xl border border-[#e7e6e3] bg-[#fafaf8] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66805f]">Degree → Career</p>
                    <p className="mt-1 text-[13px] font-semibold text-[#1b1b1b]">{relation.degree.name}</p>
                    <Link href={careerCanonicalPath("IE", relation.career.careerId)} className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563eb] hover:underline">
                      {relation.career.careerName} <ArrowRight className="size-3" aria-hidden="true" />
                    </Link>
                    <a href={relation.career.evidence.url} target="_blank" rel="noreferrer" className="mt-2 flex w-fit items-center gap-1 text-[10.5px] font-semibold text-[#3e7a2e] hover:underline">
                      Reviewed provider evidence <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </article>
                ))}
              </div>
              {compareHref ? (
                <Link href={compareHref} className="mt-4 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563eb] hover:underline">
                  Compare these careers <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              ) : null}
            </section>
          ) : null}
          <section className="rounded-xl border border-[#e7e6e3] bg-white p-5">
            <div className="flex items-center gap-2 text-[#6d4fc4]"><ShieldCheck className="size-4" aria-hidden="true" /><h2 className="text-[14.5px] font-semibold">Programme availability</h2></div>
            <p className="mt-3 text-[12.5px] leading-5 text-[#4d4c48]">Verified programme listings are not yet published for this institution.</p>
            <p className="mt-2 text-[11px] leading-5 text-[#77746e]">Institution verification does not establish programme availability or international-student eligibility.</p>
          </section>
          <section className="rounded-xl border border-[#e7e6e3] bg-white p-5">
            <div className="flex items-center gap-2 text-[#3e7a2e]"><ShieldCheck className="size-4" aria-hidden="true" /><h2 className="text-[14.5px] font-semibold">Evidence</h2></div>
            <p className="mt-3 text-[12px] leading-5 text-[#6f6d68]">Identity and official location evidence are disclosed separately.</p>
            <a href={institution.providerSourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#3e7a2e] hover:underline">
              {institution.providerAuthority} recognition <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </section>
        </div>
      </div>
    </>
  )
}
