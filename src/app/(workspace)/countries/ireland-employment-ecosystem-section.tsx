import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, ExternalLink, MapPin } from "lucide-react"
import { CANONICAL_CAREER_BY_ID } from "@/data/career-comparison-catalog"
import { ieCityPath } from "@/lib/cities/city-routes"
import type {
  IrelandEmploymentEcosystem,
  IrelandSelectedEmployer,
} from "@/lib/employment/ireland-employment-ecosystem-contract"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"

function EmployerCard({ employer }: { employer: IrelandSelectedEmployer }) {
  return (
    <article className="mt-3 rounded-lg border border-[#e5e4df] bg-[#fafaf8] px-3 py-3">
      <a
        href={employer.careersUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#1b1b1b] hover:text-[#3e7a2e] hover:underline"
      >
        {employer.name} <ExternalLink className="size-3" aria-hidden="true" />
      </a>
      <p className="mt-1 text-[10.5px] leading-4 text-[#6f6d68]">
        Ireland presence: <a href={employer.irelandPresence.url} target="_blank" rel="noreferrer" className="font-semibold text-[#3e7a2e] hover:underline">officially verified</a> · checked {employer.checkedAt}
      </p>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f6d68]">Relevant reviewed careers</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {employer.careers.map((connection) => (
          <Link key={connection.careerId} href={careerCanonicalPath("IE", connection.careerId)} className="text-[10.5px] font-semibold text-[#2563eb] hover:underline">
            {CANONICAL_CAREER_BY_ID.get(connection.careerId)?.label ?? connection.careerId}
          </Link>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {employer.careers.map((connection) => (
          <a key={connection.evidence.url} href={connection.evidence.url} target="_blank" rel="noreferrer" className="text-[10px] font-semibold text-[#3e7a2e] hover:underline">
            Career evidence <ExternalLink className="inline size-2.5" aria-hidden="true" />
          </a>
        ))}
      </div>
      {employer.cities.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {employer.cities.map((city) => {
            const cityPath = ieCityPath(city.citySlug)
            return cityPath ? (
              <Link key={city.citySlug} href={cityPath} className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#2563eb] hover:underline">
                <MapPin className="size-3" aria-hidden="true" />{city.cityName}
              </Link>
            ) : null
          })}
        </div>
      ) : null}
    </article>
  )
}

export function IrelandEmploymentEcosystemSection({ ecosystem }: { ecosystem: IrelandEmploymentEcosystem }) {
  return (
    <section className="mt-4 rounded-xl border border-[#e7e6e3] bg-white p-5" aria-labelledby="ireland-employment-ecosystem-heading">
      <div className="flex items-center gap-2 text-[#2563eb]">
        <BriefcaseBusiness className="size-4" />
        <h2 id="ireland-employment-ecosystem-heading" className="text-[14.5px] font-semibold">Industries &amp; employers</h2>
      </div>
      <p className="mt-2 max-w-3xl text-[11px] leading-4 text-[#6f6d68]">
        Reviewed Industry-to-Career and selected Employer context for the Ireland MVP. Employer links are evergreen careers sources, not current-vacancy, salary or sponsorship claims.
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {ecosystem.industries.map((industry) => {
          const employers = ecosystem.employers.filter((employer) => employer.industryId === industry.id)
          return (
            <article key={industry.id} className="rounded-lg border border-[#dfe8db] bg-[#f7faf5] px-3 py-3">
              <h3 className="text-[12.5px] font-semibold text-[#2f5f25]">{industry.name}</h3>
              <p className="mt-1 text-[10.5px] leading-4 text-[#66805f]">{industry.rationale}</p>
              <div className="mt-3 flex flex-wrap gap-2">
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
              {employers.map((employer) => <EmployerCard key={employer.id} employer={employer} />)}
              <a
                href={industry.evidence.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#3e7a2e] hover:underline"
              >
                Industry evidence: {industry.evidence.authority} <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </article>
          )
        })}
      </div>
    </section>
  )
}
