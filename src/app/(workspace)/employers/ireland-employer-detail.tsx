import Link from "next/link"
import { ArrowRight, ExternalLink, MapPin, ShieldCheck } from "lucide-react"
import { EntityLogo } from "@/components/ui/entity-logo"
import { ieEmployerDirectoryPath } from "@/lib/employment/ireland-employer-routes"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"
import { IE_CAREER_COMPARE_LABELS } from "@/lib/ireland-career-comparison"
import type { IrelandEmploymentEcosystem, IrelandSelectedEmployer } from "@/lib/employment/ireland-employment-ecosystem-contract"

function careerLabel(careerId: string) {
  return IE_CAREER_COMPARE_LABELS[careerId as keyof typeof IE_CAREER_COMPARE_LABELS] ?? careerId
}

export async function IrelandEmployerDetailView({
  employer,
  ecosystem,
}: {
  employer: IrelandSelectedEmployer
  ecosystem: IrelandEmploymentEcosystem
}) {
  const industry = ecosystem.industries.find((candidate) => candidate.id === employer.industryId) ?? null
  const directoryPath = ieEmployerDirectoryPath()

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[#6f6d68]">
        <Link href="/countries/ie" className="transition hover:text-brand">Ireland</Link>
        <span>/</span>
        <Link href={directoryPath} className="transition hover:text-brand">Employers</Link>
        <span>/</span>
        <span className="truncate text-[#5f5d58]">{employer.name}</span>
      </nav>

      <header className="mt-5 rounded-2xl border border-campcareer-border bg-white p-6 shadow-cc-surface sm:flex sm:items-start sm:justify-between sm:p-7">
        <div className="flex min-w-0 items-start gap-4">
          <EntityLogo name={employer.name} size="lg" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">Ireland employer</p>
            <h1 className="mt-2 max-w-3xl text-[27px] font-semibold leading-tight tracking-[-0.025em] text-campcareer-ink sm:text-3xl">{employer.name}</h1>
            <p className="mt-2 text-[12.5px] font-medium text-campcareer-ink-secondary">{employer.descriptor}</p>
            {industry ? (
              <Link href={`${directoryPath}?industry=${industry.slug}`} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-campcareer-border bg-campcareer-surface px-2.5 py-1 text-[11px] font-semibold text-campcareer-ink-secondary transition hover:border-brand/40 hover:text-brand">
                {industry.name}
              </Link>
            ) : null}
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-[11px] font-semibold text-brand">
              <ShieldCheck className="size-3.5" aria-hidden="true" />Verified Ireland presence
            </p>
          </div>
        </div>
        <a href={employer.websiteUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-brand-strong sm:mt-0">
          Official website <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-campcareer-border bg-white p-5">
          <div className="flex items-center gap-2 text-brand"><MapPin className="size-4" aria-hidden="true" /><h2 className="text-[14.5px] font-semibold">Presence in Ireland</h2></div>
          <p className="mt-2 text-[12.5px] leading-5 text-campcareer-ink-secondary">{employer.irelandPresenceDescription}</p>
          <a href={employer.irelandPresence.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand hover:underline">
            {employer.irelandPresence.authority} — official evidence <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </section>

        {employer.cities.length > 0 ? (
          <section className="rounded-xl border border-campcareer-border bg-white p-5">
            <div className="flex items-center gap-2 text-brand"><MapPin className="size-4" aria-hidden="true" /><h2 className="text-[14.5px] font-semibold">Verified locations</h2></div>
            <p className="mt-2 text-[12px] leading-5 text-campcareer-ink-secondary">Each location links to its published Ireland City page.</p>
            <div className="mt-3 space-y-2">
              {employer.cities.map((city) => (
                <article key={city.citySlug} className="rounded-lg border border-campcareer-border bg-campcareer-surface p-3">
                  <p className="text-[13px] font-semibold text-campcareer-ink">{city.cityName}</p>
                  <a href={city.evidence.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline">
                    Location evidence <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {employer.careers.length > 0 ? (
        <section className="mt-4 rounded-xl border border-campcareer-border bg-white p-5">
          <div className="flex items-center gap-2 text-brand"><ShieldCheck className="size-4" aria-hidden="true" /><h2 className="text-[14.5px] font-semibold">Career context</h2></div>
          <p className="mt-2 text-[12px] leading-5 text-campcareer-ink-secondary">Reviewed CampCareer connections for this employer. This is employer context, not a vacancy claim or affinity signal for other careers.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {employer.careers.map((connection) => (
              <article key={connection.careerId} className="rounded-lg border border-campcareer-border bg-campcareer-surface p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-ink-muted">Employer → Career</p>
                <Link href={careerCanonicalPath("IE", connection.careerId)} className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-campcareer-ink transition hover:text-brand">
                  {careerLabel(connection.careerId)} <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
                <a href={connection.evidence.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline">
                  Reviewed evidence <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-4 rounded-xl border border-campcareer-border bg-white p-5">
        <div className="flex items-center gap-2 text-brand"><ShieldCheck className="size-4" aria-hidden="true" /><h2 className="text-[14.5px] font-semibold">Trust boundary</h2></div>
        <p className="mt-2 text-[12.5px] leading-5 text-campcareer-ink-secondary">CampCareer shows verified employer context, not live vacancy status.</p>
        <p className="mt-2 text-[11.5px] leading-5 text-campcareer-ink-secondary">
          No salary, hiring volume, visa sponsorship, employee count or candidate-affinity claims are made. Checked {employer.checkedAt.replaceAll("-", " · ")}.
        </p>
      </section>
    </>
  )
}