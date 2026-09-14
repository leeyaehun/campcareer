import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, Building2, ExternalLink } from "lucide-react"
import { EntityLogo } from "@/components/ui/entity-logo"
import { CANONICAL_CAREER_BY_ID } from "@/data/career-comparison-catalog"
import type { IrelandEmploymentEcosystem } from "@/lib/employment/ireland-employment-ecosystem-contract"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"

export function IrelandEmploymentEcosystemSection({ ecosystem }: { ecosystem: IrelandEmploymentEcosystem }) {
  const industryById = new Map(ecosystem.industries.map((industry) => [industry.id, industry]))
  return (
    <section className="mt-12 rounded-xl border border-[#e7e6e3] bg-white p-5 sm:p-6" aria-labelledby="ireland-employment-ecosystem-heading">
      <div className="flex items-center gap-2 text-[#2563eb]">
        <BriefcaseBusiness className="size-4" />
        <h2 id="ireland-employment-ecosystem-heading" className="text-[20px] font-semibold tracking-[-0.02em]">Industries</h2>
      </div>
      <p className="mt-1 text-[12px] text-[#6f6d68]">Industries connected to the reviewed Ireland Career cohort.</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {ecosystem.industries.map((industry) => {
          return (
            <article key={industry.id} className="rounded-lg border border-[#dfe8db] bg-[#f7faf5] p-4">
              <h3 className="text-[15px] font-semibold text-[#254d1e]">{industry.name}</h3>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66805f]">Related careers</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {industry.careers.map((connection) => (
                  <Link
                    key={connection.careerId}
                    href={careerCanonicalPath("IE", connection.careerId)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#d8e7d2] bg-white px-2 py-1 text-[10.5px] font-semibold text-[#2563eb] hover:underline"
                  >
                    {CANONICAL_CAREER_BY_ID.get(connection.careerId)?.label ?? connection.careerId}
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    {ecosystem.employers.length > 0 ? (
        <div className="mt-6 border-t border-[#e7e6e3] pt-6">
          <div className="flex items-center gap-2 text-[#3e7a2e]">
            <Building2 className="size-4" />
            <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Selected employers</h2>
          </div>
          <p className="mt-1 text-[12px] text-[#6f6d68]">
            Reviewed employer context for the Ireland cohort. These are evergreen official careers links, not vacancies.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {ecosystem.employers.map((employer) => {
              const industry = industryById.get(employer.industryId)
              const cityNames = employer.cities.map((city) => city.cityName).slice(0, 4)
              return (
                <article key={employer.id} className="rounded-lg border border-[#e7e6e3] bg-[#fafaf8] p-4">
                  <div className="flex items-start gap-3">
                    <EntityLogo name={employer.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-semibold text-[#1b1b1b]">{employer.name}</h3>
                      <p className="mt-0.5 text-[11px] text-[#77746e]">{industry?.name ?? "Ireland"}</p>
                      {cityNames.length > 0 ? <p className="mt-1.5 text-[10.5px] text-[#8f8c85]">{cityNames.join(" · ")}</p> : null}
                    </div>
                  </div>
                  <a
                    href={employer.careersUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563eb] hover:underline"
                  >
                    {employer.careersSourceTitle} <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </article>
              )
            })}
          </div>
        </div>
      ) : null}
    </section>
  )
}
