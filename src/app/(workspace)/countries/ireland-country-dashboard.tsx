import Link from "next/link"
import {
  ArrowRight,
  Banknote,
  Building2,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  MapPin,
  Sparkles,
  Stamp,
  Wallet,
} from "lucide-react"
import { IRELAND_OCCUPATION_COUNTRY_PROFILE } from "@/data/ireland-occupation-country-profile"
import { ieCityPath } from "@/lib/cities/city-routes"
import type { CountryDegreeConnection, DegreeCareerOutcome } from "@/lib/career-degree/contract"
import { buildCityCompareCanonicalHref } from "@/lib/compare-routes"
import { institutionDetailPath } from "@/lib/institutions/institution-search"
import type { IrelandInstitution } from "@/lib/institutions/ireland-institutions.server"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"
import { formatMoneyRange, formatRankingValue, type CountryMetrics } from "@/lib/workspace/country-metric-contract"
import { getCountryExplorer } from "@/lib/workspace/country-explorer"
import { getCountryProfile } from "@/lib/workspace/country-profile"
import { VISA_CATALOG } from "@/lib/workspace/visa-catalog"
import { cn } from "@/lib/utils"

function MetricCard({ icon, label, value, hint, accent, href }: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
  accent: string
  href?: string
}) {
  const content = (
    <>
      <div className="flex items-center gap-2">
        <span className={cn("grid size-8 place-items-center rounded-lg", accent)}>{icon}</span>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#8f8c85]">{label}</p>
      </div>
      <p className="mt-3 text-[25px] font-semibold tracking-[-0.03em] text-[#1b1b1b]">{value}</p>
      <p className="mt-1.5 text-[11.5px] leading-5 text-[#77746e]">{hint}</p>
    </>
  )
  const className = "rounded-xl border border-[#e7e6e3] bg-white p-4 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2563eb]/15"
  if (href) return <Link href={href} className={cn(className, "block hover:border-[#c9d7f5] hover:shadow-sm")}>{content}</Link>
  return <article className={className}>{content}</article>
}

function relationshipLabel(career: DegreeCareerOutcome) {
  const relationType = {
    direct: "Direct",
    common_pathway: "Common pathway",
    related: "Related",
  }[career.relationType]
  const directness = career.directness === "direct" ? "Direct" : "Adjacent"
  const strength = career.relationshipStrength[0].toUpperCase() + career.relationshipStrength.slice(1)
  return career.relationType === "direct"
    ? `${directness} · ${strength}`
    : `${relationType} · ${directness} · ${strength}`
}

function DegreeConnectionCard({ connection }: { connection: CountryDegreeConnection }) {
  return (
    <article className="rounded-lg border border-[#dfe8db] bg-[#f7faf5] px-3 py-3">
      <h3 className="text-[12.5px] font-semibold text-[#2f5f25]">{connection.degree.name}</h3>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66805f]">Career connection</p>
      <div className="mt-1.5 space-y-2">
        {connection.careers.map((career) => (
          <div key={career.careerId}>
            <Link
              href={careerCanonicalPath("IE", career.careerId)}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
            >
              {career.careerName} <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
            {career.evidenceInstitution ? (
              <div className="mt-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66805f]">Reviewed evidence institution</p>
                <Link
                  href={institutionDetailPath(career.evidenceInstitution.countryCode, career.evidenceInstitution.slug)}
                  className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
                >
                  {career.evidenceInstitution.name} <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
            ) : null}
            <p className="mt-1 text-[10.5px] font-medium text-[#66805f]">{relationshipLabel(career)}</p>
            <p className="mt-1 text-[10.5px] leading-4 text-[#66805f]">{career.rationale}</p>
            <a
              href={career.evidence.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#3e7a2e] hover:underline"
            >
              Evidence: {career.evidence.authority} · {career.evidence.title}
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
            <p className="mt-1 text-[10px] text-[#66805f]">
              {career.evidence.referencePeriod} · checked {career.evidence.checkedAt}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}

function InstitutionConnectionCard({ institution }: { institution: IrelandInstitution }) {
  const detailPath = institutionDetailPath("IE", institution.slug)
  const locations = institution.locations

  return (
    <article className="rounded-lg border border-[#e5e4df] bg-[#fafaf8] px-3 py-3">
      <Link href={detailPath} className="inline-flex items-center gap-1 text-[12.5px] font-semibold leading-4 text-[#1b1b1b] hover:text-[#3e7a2e] hover:underline">
        {institution.name} <ArrowRight className="size-3" aria-hidden="true" />
      </Link>
      <p className="mt-1 text-[10.5px] font-medium text-[#6f6d68]">HEA-recognised institution</p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
        {locations.map((location) => (
          <Link key={location.id} href={location.city.path} className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#2563eb] hover:underline">
            <MapPin className="size-3" aria-hidden="true" />{location.city.name}
          </Link>
        ))}
      </div>
      <Link href={detailPath} className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#3e7a2e] hover:underline">
        View education profile <ArrowRight className="size-3" aria-hidden="true" />
      </Link>
    </article>
  )
}

export function IrelandCountryDashboard({
  metrics,
  degreeConnections,
  institutions,
}: {
  metrics: CountryMetrics
  degreeConnections: readonly CountryDegreeConnection[]
  institutions: readonly IrelandInstitution[]
}) {
  const explorer = getCountryExplorer("IE")
  const countryProfile = getCountryProfile("IE")
  const profile = IRELAND_OCCUPATION_COUNTRY_PROFILE
  const visas = VISA_CATALOG.filter((visa) => visa.countryCode === "IE")
  if (!explorer || !countryProfile) return null
  const cityCount = explorer.regions.reduce((total, region) => total + region.cities.length, 0)
  const salaryHint = metrics.salaryRange
    ? `CSO sector-average IQR · comparison value ${formatRankingValue(metrics.salaryRange)}`
    : "Verified salary range coming soon"
  const livingHint = metrics.livingCostRange ? "Immigration finance floor to Eurostudent observed average · tuition excluded" : "Verified student planning range coming soon"

  return (
    <div>
      <p className="mb-4 max-w-3xl text-[13px] leading-6 text-[#6f6d68]">{profile.introduction}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard icon={<Stamp className="size-4 text-[#6d4fc4]" />} accent="bg-[#f3f0fa]" label="Visa options" value={String(visas.length)} hint="Study, graduate-work and critical-skills pathways" href="/visas?country=IE" />
        <MetricCard icon={<Banknote className="size-4 text-[#2563eb]" />} accent="bg-[#eef4ff]" label="Salary range" value={formatMoneyRange(metrics.salaryRange)} hint={salaryHint} />
        <MetricCard icon={<Wallet className="size-4 text-[#c2691e]" />} accent="bg-[#fbf0e7]" label="Living costs" value={formatMoneyRange(metrics.livingCostRange)} hint={livingHint} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[#e7e6e3] bg-white p-5">
          <div className="flex items-center gap-2 text-[#2563eb]"><CalendarDays className="size-4" /><h2 className="text-[14.5px] font-semibold">Academic year</h2></div>
          <p className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">{profile.academicYear.headline}</p>
          <p className="mt-2 text-[12.5px] leading-5 text-[#6f6d68]">{profile.academicYear.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">{profile.academicYear.intakes.map((intake) => <span key={intake} className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[11px] font-semibold text-[#2563eb]">{intake}</span>)}</div>
        </section>
        <section className="rounded-xl border border-[#e7e6e3] bg-white p-5">
          <div className="flex items-center gap-2 text-[#3e7a2e]"><GraduationCap className="size-4" /><h2 className="text-[14.5px] font-semibold">Career-linked degree pathways</h2></div>
          <p className="mt-2 text-[11px] leading-4 text-[#66805f]">Reviewed Degree-to-Career relationships. These are not programme listings or availability claims.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">{degreeConnections.map((connection) => <DegreeConnectionCard key={connection.degree.id} connection={connection} />)}</div>
        </section>
      </div>
      <section className="mt-4 rounded-xl border border-[#e7e6e3] bg-white p-5">
        <div className="flex items-center gap-2 text-[#6d4fc4]"><Building2 className="size-4" /><h2 className="text-[14.5px] font-semibold">Education in Ireland</h2><Link href="/institutions/ie" className="ml-auto text-[11.5px] font-semibold text-[#2563eb] hover:text-[#1d4ed8]">Explore institutions</Link></div>
        <p className="mt-2 text-[11px] leading-4 text-[#6f6d68]">Verified Higher Education Authority institution identities with source-backed official locations. Programme listings are not published from this layer.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{institutions.map((institution) => <InstitutionConnectionCard key={institution.id} institution={institution} />)}</div>
      </section>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="min-w-0 rounded-xl border border-[#e7e6e3] bg-white lg:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-[#f0efec] px-5 py-4"><MapPin className="size-4 text-[#3e7a2e]" /><h2 className="text-[14.5px] font-semibold text-[#1b1b1b]">Regions &amp; cities</h2><Link href={buildCityCompareCanonicalHref({ country: "IE" })} className="ml-auto text-[11.5px] font-semibold text-[#2563eb] hover:text-[#1d4ed8]">Compare cities</Link><span className="text-[11.5px] font-medium text-[#a3a19b]">{cityCount} cities</span></div>
          <div className="grid gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2">{explorer.regions.map((region) => <div key={region.name}><h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1b1b1b]"><MapPin className="size-3.5 text-[#9c9a94]" />{region.name}</h3><div className="mt-2 flex flex-wrap gap-1.5">{region.cities.map((city) => {
            const cityPath = ieCityPath(city)
            const className = "rounded-md border border-[#e7e6e3] bg-[#fafaf8] px-2.5 py-1 text-[12px] font-medium text-[#4d4c48]"
            return cityPath ? <Link key={city} href={cityPath} className={`${className} hover:border-[#c9d7f5] hover:text-[#2563eb]`}>{city}</Link> : <span key={city} className={className}>{city}</span>
          })}</div></div>)}</div>
        </section>
        <section className="rounded-xl border border-[#e7e6e3] bg-white">
          <div className="flex items-center gap-2.5 border-b border-[#f0efec] px-5 py-4"><Sparkles className="size-4 text-[#2563eb]" /><h2 className="text-[14.5px] font-semibold text-[#1b1b1b]">Work opportunities</h2></div>
          {countryProfile.workOpportunities && <div className="px-5 py-4"><p className="text-[12.5px] font-semibold text-[#1b1b1b]">{countryProfile.workOpportunities.headline}</p><ul className="mt-3 space-y-2.5">{countryProfile.workOpportunities.items.map((item) => <li key={item.title} className="flex items-center gap-2"><span className="size-1.5 shrink-0 rounded-full bg-[#2563eb]" /><span className="text-[12.5px] font-medium text-[#4d4c48]">{item.title}</span></li>)}</ul></div>}
        </section>
      </div>
    </div>
  )
}
