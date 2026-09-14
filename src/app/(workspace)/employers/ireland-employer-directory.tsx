import Link from "next/link"
import { ChevronRight, Building2, ExternalLink } from "lucide-react"
import { EntityCardLink } from "@/components/ui/entity-card"
import { EntityLogo } from "@/components/ui/entity-logo"
import { ieEmployerDetailPath } from "@/lib/employment/ireland-employer-routes"
import type { IrelandEmploymentEcosystem, IrelandSelectedEmployer } from "@/lib/employment/ireland-employment-ecosystem-contract"

function IrelandEmployerCard({
  employer,
  industryName,
}: {
  employer: IrelandSelectedEmployer
  industryName: string
}) {
  const detailPath = ieEmployerDetailPath(employer.slug)
  const cityNames = employer.cities.map((city) => city.cityName).slice(0, 3)

  return (
    <article className="rounded-xl border border-[#e7e6e3] bg-white p-4">
      <EntityCardLink href={detailPath} className="rounded-lg border-0 p-0 hover:border-0 hover:bg-transparent hover:shadow-none">
        <div className="flex items-start gap-3">
          <EntityLogo name={employer.name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-semibold leading-5 tracking-[-0.01em] text-[#1b1b1b] transition group-hover:text-[#2563eb]">{employer.name}</p>
            <p className="mt-1 text-[11px] font-medium text-[#6f6d68]">{employer.descriptor}</p>
            <p className="mt-0.5 text-[10.5px] font-medium text-[#8f8c85]">{industryName}</p>
            {cityNames.length > 0 ? <p className="mt-1.5 text-[10.5px] text-[#8f8c85]">{cityNames.join(" · ")}</p> : null}
          </div>
          <ChevronRight className="mr-1 mt-1 size-3.5 shrink-0 text-[#aaa7a0] transition group-hover:translate-x-0.5 group-hover:text-[#2563eb]" aria-hidden="true" />
        </div>
      </EntityCardLink>
      <div className="mt-3 border-t border-[#f0efec] pt-2.5">
        <a href={employer.careersUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6f6d68] hover:text-[#2563eb]">
          {employer.careersSourceTitle} <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

export async function IrelandEmployerDirectory({
  ecosystem,
  industryFilter,
  employers,
}: {
  ecosystem: IrelandEmploymentEcosystem
  industryFilter: string | null
  employers: readonly IrelandSelectedEmployer[]
}) {
  const industryById = new Map(ecosystem.industries.map((industry) => [industry.id, industry]))
  const allIndustries = ecosystem.industries
  const activeIndustry = industryFilter ? allIndustries.find((industry) => industry.slug === industryFilter) ?? null : null
  const visibleEmployers = employers

  return (
    <>
      <section className="rounded-cc-large border border-campcareer-border bg-brand-tint p-5 shadow-cc-surface sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">Employer context</p>
        <h1 className="mt-1.5 text-[28px] font-semibold leading-tight tracking-[-0.025em] text-campcareer-ink sm:text-3xl">Employers in Ireland</h1>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-5 text-campcareer-ink-secondary">
          A small trusted layer of verified Ireland employers with official sources. This is employer context, not live hiring, salary or sponsorship information.
        </p>
        <nav aria-label="Employer industry filter" className="mt-4 flex flex-wrap gap-2">
          <Link
            href="."
            className={`inline-flex min-h-8 items-center rounded-md px-3 text-[11.5px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
              !industryFilter ? "bg-brand text-white" : "border border-campcareer-border bg-campcareer-surface text-[#4d4c48] hover:border-[#c9d7f5] hover:text-brand"
            }`}
          >
            All industries
          </Link>
          {allIndustries.map((industry) => (
            <Link
              key={industry.id}
              href={`/countries/ie/employers?industry=${industry.slug}`}
              className={`inline-flex min-h-8 items-center rounded-md px-3 text-[11.5px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                industryFilter === industry.slug ? "bg-brand text-white" : "border border-campcareer-border bg-campcareer-surface text-[#4d4c48] hover:border-[#c9d7f5] hover:text-brand"
              }`}
            >
              {industry.name}
            </Link>
          ))}
        </nav>
      </section>

      <section className="mt-6" aria-labelledby="ie-employers-heading">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id="ie-employers-heading" className="text-[16px] font-semibold tracking-[-0.01em] text-[#1b1b1b]">
            Verified employers{activeIndustry ? ` in ${activeIndustry.name}` : ""}
          </h2>
          <span className="text-[12px] font-medium text-[#8f8c85]">{visibleEmployers.length} employer{visibleEmployers.length === 1 ? "" : "s"}</span>
        </div>
        {visibleEmployers.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEmployers.map((employer) => (
              <IrelandEmployerCard key={employer.id} employer={employer} industryName={industryById.get(employer.industryId)?.name ?? "Ireland"} />
            ))}
          </div>
        ) : (
          <div className="mt-3 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#dcdad4] bg-[#fbfbf9] p-8 text-center">
            <Building2 className="size-6 text-[#3e7a2e]" aria-hidden="true" />
            <h3 className="mt-3 text-[15px] font-semibold text-[#1b1b1b]">No verified employers in this industry yet</h3>
            <p className="mt-2 text-[12px] text-[#77746e]">Only employers meeting the verified evidence bar are published.</p>
          </div>
        )}
      </section>

      <p className="mt-4 text-[10.5px] leading-5 text-[#aaa7a0]">
        CampCareer shows verified employer context, not live vacancy status. This cohort is not a complete national company directory.
      </p>
    </>
  )
}