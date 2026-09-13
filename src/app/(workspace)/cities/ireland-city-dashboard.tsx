import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Clock3,
  ExternalLink,
  GraduationCap,
  Info,
  MapPin,
  TrainFront,
  Users,
  Wallet,
} from "lucide-react"
import type { IrelandCityDecisionConnections } from "@/lib/cities/ireland-city-decision-connections.server"
import type { IeCityProfile } from "@/lib/cities/ie-city-profile.server"
import { buildCityCompareCanonicalHref } from "@/lib/compare-routes"
import { institutionDetailPath } from "@/lib/institutions/institution-search"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"

function money(value: number, currency = "EUR", decimals = 0) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function compact(value: number) {
  return new Intl.NumberFormat("en-IE", { notation: "compact", maximumFractionDigits: 2 }).format(value)
}

function periodLabel(period: string) {
  return period.replaceAll("_", " ")
}

function livingValue(profile: IeCityProfile) {
  if (!profile.livingCost) return "—"
  if (Math.abs(profile.livingCost.high - profile.livingCost.low) < 1) {
    return `~${money(profile.livingCost.low, profile.livingCost.currency)}`
  }
  return `${money(profile.livingCost.low, profile.livingCost.currency)}–${money(profile.livingCost.high, profile.livingCost.currency)}`
}

function transportValue(profile: IeCityProfile) {
  if (!profile.transport) return "—"
  const decimals = profile.transport.referenceAmount % 1 === 0 ? 0 : 2
  return `${money(profile.transport.referenceAmount, profile.transport.currency, decimals)} / ${periodLabel(profile.transport.period)}`
}

function MetricCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <article className="rounded-xl border border-[#e7e6e3] bg-white p-4">
      <div className="flex items-center gap-2 text-[#77746e]">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em]">{label}</p>
      </div>
      <p className="mt-3 text-[22px] font-semibold tracking-[-0.03em] text-[#1b1b1b]">{value}</p>
      <p className="mt-1.5 text-[11.5px] leading-5 text-[#77746e]">{note}</p>
    </article>
  )
}

export function IrelandCityDashboard({
  profile,
  decisionConnections,
}: {
  profile: IeCityProfile
  decisionConnections: IrelandCityDecisionConnections
}) {
  const institutionCount = decisionConnections.institutions.length
  const locationCount = decisionConnections.institutions.reduce(
    (total, institution) => total + institution.locations.length,
    0,
  )
  const scopeCopy =
    profile.studyDestinationScope === "dublin_four_local_authorities"
      ? "Dublin uses an explicit study-market boundary covering Dublin City, Fingal, Dún Laoghaire-Rathdown and South Dublin. Campus membership still requires verified official location evidence."
      : `${profile.name} uses the approved ${profile.scopeLabel.toLowerCase()}. County-wide or neighbouring-area membership is not inferred.`
  const compareReady = Boolean(
    profile.population &&
      profile.livingCost &&
      profile.transport &&
      profile.workRights &&
      profile.employmentSectors.length > 0 &&
      profile.linkedCampusCount > 0 &&
      profile.linkedInstitutionCount > 0,
  )
  const compareHref = buildCityCompareCanonicalHref({ country: "IE", left: profile.slug })

  return (
    <div>
      <section className="bg-gradient-to-br from-[#143b34] via-[#1f584d] to-[#3f786d] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-10">
          <nav className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/70" aria-label="Breadcrumb">
            <Link href="/countries" className="hover:text-white">Countries</Link>
            <span>/</span>
            <Link href="/countries/ie" className="hover:text-white">Ireland</Link>
            <span>/</span>
            <span>{profile.region}</span>
          </nav>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Cities</p>
          <h1 className="mt-2 text-[38px] font-semibold leading-tight tracking-[-0.03em] sm:text-[48px]">{profile.name}</h1>
          <p className="mt-2 text-[14px] font-medium text-white/85">{profile.region} · {profile.scopeLabel}</p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-8 lg:px-10">
        <section className="-mt-8 rounded-2xl border border-[#e7e6e3] bg-white p-5 shadow-xl shadow-black/10 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#16705f]">Student decision snapshot</p>
              <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Study destination evidence for {profile.name}</h2>
              <p className="mt-1.5 max-w-3xl text-[12px] leading-5 text-[#77746e]">{scopeCopy}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10.5px] font-semibold text-[#5d6470]">
                <span className="rounded-full bg-[#f4f6f9] px-2.5 py-1">{institutionCount} verified institutions</span>
                <span className="rounded-full bg-[#f4f6f9] px-2.5 py-1">{locationCount} verified locations</span>
                <span className="rounded-full bg-[#f4f6f9] px-2.5 py-1">5 verified city metrics</span>
              </div>
            </div>
            {compareReady ? (
              <Link href={compareHref} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#b8d8ce] px-3.5 py-2 text-[11.5px] font-semibold text-[#16705f] hover:bg-[#f3faf8]">
                Compare {profile.name} <ArrowRight className="size-3.5" />
              </Link>
            ) : null}
          </div>
        </section>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<Users className="size-4 text-[#16705f]" />}
            label="Population"
            value={profile.population ? compact(profile.population.amount) : "—"}
            note={profile.population ? `${profile.population.geography} · ${profile.population.dataAsOf}` : "Verified population unavailable"}
          />
          <MetricCard
            icon={<Wallet className="size-4 text-[#c2691e]" />}
            label="Student living"
            value={livingValue(profile)}
            note={profile.livingCost ? "Indicative monthly EUR reference · source methodologies differ by institution" : "Verified student living reference unavailable"}
          />
          <MetricCard
            icon={<TrainFront className="size-4 text-[#6d4fc4]" />}
            label="Student transport"
            value={transportValue(profile)}
            note={profile.transport ? `Source-native TFI fare period${profile.transport.eligibilityRequired ? " · Student/Young Adult eligibility applies" : ""}` : "Verified transport reference unavailable"}
          />
          <MetricCard
            icon={<Clock3 className="size-4 text-[#3e7a2e]" />}
            label="Stamp 2 work"
            value={profile.workRights ? `${profile.workRights.hoursTermTime} h term / ${profile.workRights.hoursDesignatedHolidays} h holidays` : "—"}
            note="National Stamp 2 rule; immigration, course and registration conditions apply"
          />
        </div>

        <section className="mt-5 rounded-xl border border-[#eadfca] bg-[#fffaf1] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-[#a86514]" />
            <div>
              <h2 className="text-[14px] font-semibold text-[#5d3a0b]">{profile.programmeCoverage.label}</h2>
              <p className="mt-1 text-[11.5px] leading-5 text-[#7a5a31]">{profile.programmeCoverage.detail}</p>
              <p className="mt-1 text-[11.5px] leading-5 text-[#7a5a31]">
                The catalogue gap is shown as verification pending rather than “0 programmes”. Verified delivery will appear only after explicit programme-offering-to-campus evidence is published.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
          <section className="rounded-xl border border-[#e7e6e3] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-[#16705f]">
              <GraduationCap className="size-4" />
              <h2 className="text-[15px] font-semibold">Verified institutions in {profile.scopeLabel}</h2>
              <span className="ml-auto rounded-full bg-[#edf7f4] px-2.5 py-1 text-[10.5px] font-semibold text-[#16705f]">
                {institutionCount} institutions · {locationCount} locations
              </span>
            </div>
            <p className="mt-2 text-[11.5px] leading-5 text-[#77746e]">
              This is the initial verified HEA-recognised institution set, not an exhaustive city directory. Each row requires an official institution website and explicit official location evidence.
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {decisionConnections.institutions.map((institution) => (
                <article key={institution.id} className="rounded-lg border border-[#eeece8] bg-[#fafaf8] p-3.5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[#16705f] shadow-sm"><Building2 className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <Link href={institutionDetailPath("IE", institution.slug)} className="text-[12.5px] font-semibold leading-5 text-[#1b1b1b] hover:text-[#16705f] hover:underline">{institution.name}</Link>
                      <p className="mt-0.5 text-[10.5px] text-[#8f8c85]">{institution.providerAuthority} · {institution.locations.length} verified {institution.locations.length === 1 ? "location" : "locations"}</p>
                      <div className="mt-2 space-y-1.5">
                        {institution.locations.map((location) => (
                          <div key={location.id} className="flex items-start gap-1.5 text-[10.5px] leading-4 text-[#77746e]">
                            <MapPin className="mt-0.5 size-3 shrink-0" />
                            <span>{location.name}{location.postalCode ? ` · ${location.postalCode}` : ""}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <a href={institution.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#16705f] hover:underline">
                          Official site <ExternalLink className="size-3" />
                        </a>
                        <a href={institution.providerSourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#16705f] hover:underline">
                          HEA source <ExternalLink className="size-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {decisionConnections.careerDegreeEvidence.length > 0 ? (
              <section className="mt-5 border-t border-[#eeece8] pt-5">
                <div className="flex items-center gap-2 text-[#3e7a2e]">
                  <BriefcaseBusiness className="size-4" />
                  <h2 className="text-[14.5px] font-semibold">Career-linked education evidence</h2>
                </div>
                <p className="mt-2 text-[11.5px] leading-5 text-[#77746e]">
                  Reviewed Degree → Career relationships supported by a verified institution in {profile.name}. They are not programme listings or city-level availability claims.
                </p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {decisionConnections.careerDegreeEvidence.map((relation) => (
                    <article key={`${relation.degree.id}-${relation.career.careerId}-${relation.institution.id}`} className="rounded-lg border border-[#dfe8db] bg-[#f7faf5] p-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66805f]">Degree → Career</p>
                      <h3 className="mt-1 text-[12.5px] font-semibold text-[#2f5f25]">{relation.degree.name}</h3>
                      <Link href={careerCanonicalPath("IE", relation.career.careerId)} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
                        {relation.career.careerName} <ArrowRight className="size-3" aria-hidden="true" />
                      </Link>
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66805f]">Reviewed evidence institution</p>
                      <Link href={institutionDetailPath(relation.institution.countryCode, relation.institution.slug)} className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
                        {relation.institution.name} <ArrowRight className="size-3" aria-hidden="true" />
                      </Link>
                      <p className="mt-2 text-[10.5px] leading-4 text-[#66805f]">{relation.career.rationale}</p>
                      <a href={relation.career.evidence.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#3e7a2e] hover:underline">
                        Evidence: {relation.career.evidence.authority} <ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </section>

          <div className="space-y-5">
            <section className="rounded-xl border border-[#e7e6e3] bg-white p-5">
              <div className="flex items-center gap-2 text-[#3e7a2e]"><BriefcaseBusiness className="size-4" /><h2 className="text-[14.5px] font-semibold">Career environment</h2></div>
              <p className="mt-2 text-[11.5px] leading-5 text-[#77746e]">
                {profile.employmentSectorBasis ?? "Official city economic-development focus sectors."} These are context signals, not shortage rankings or employment guarantees.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.employmentSectors.map((sector) => (
                  <span key={sector} className="rounded-full border border-[#dfe8db] bg-[#f7faf5] px-3 py-1.5 text-[11px] font-semibold text-[#3e7a2e]">{sector}</span>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#d9e3f7] bg-[#f7f9fe] p-5">
              <h2 className="text-[14.5px] font-semibold text-[#1b1b1b]">Stamp 2 work context</h2>
              <p className="mt-2 text-[11.5px] leading-5 text-[#5e6f91]">
                The stored national reference is {profile.workRights?.hoursTermTime ?? 20} hours per week during term and {profile.workRights?.hoursDesignatedHolidays ?? 40} hours per week during designated holiday periods. Eligibility depends on the conditions attached to the student&apos;s immigration permission.
              </p>
            </section>

            <section className="rounded-xl border border-[#d9e3f7] bg-[#f7f9fe] p-5">
              <h2 className="text-[14.5px] font-semibold text-[#1b1b1b]">Metric sources</h2>
              <div className="mt-3 space-y-2">
                {profile.sources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block rounded-lg bg-white px-3 py-2.5 text-[10.5px] leading-4 text-[#5e6f91] hover:underline">
                    {source.name} · {source.dataAsOf}
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
