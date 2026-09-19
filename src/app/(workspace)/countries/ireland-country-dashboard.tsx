import Link from "next/link"
import {
  ArrowRight,
  Banknote,
  Building2,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  Stamp,
  Wallet,
} from "lucide-react"
import { IRELAND_OCCUPATION_COUNTRY_PROFILE } from "@/data/ireland-occupation-country-profile"
import { EntityCardLink } from "@/components/ui/entity-card"
import { ieCityPath } from "@/lib/cities/city-routes"
import type { CountryDegreeConnection } from "@/lib/career-degree/contract"
import { buildCityCompareCanonicalHref } from "@/lib/compare-routes"
import type { IrelandEmploymentEcosystem } from "@/lib/employment/ireland-employment-ecosystem-contract"
import { institutionDetailPath } from "@/lib/institutions/institution-search"
import { buildIrelandCareerCompareHref } from "@/lib/ireland-career-comparison"
import type { IrelandInstitution } from "@/lib/institutions/ireland-institutions.server"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"
import { formatMoneyRange, formatRankingValue, type CountryMetrics } from "@/lib/workspace/country-metric-contract"
import { getCountryExplorer } from "@/lib/workspace/country-explorer"
import { VISA_CATALOG } from "@/lib/workspace/visa-catalog"
import { cn } from "@/lib/utils"
import { IrelandEmploymentEcosystemSection } from "./ireland-employment-ecosystem-section"
import { IrelandEmploymentSectorChart } from "./ireland-employment-sector-chart"

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

function DegreeConnectionCard({ connection }: { connection: CountryDegreeConnection }) {
  return (
    <article className="rounded-lg border border-[#dfe8db] bg-[#f7faf5] p-4">
      <h3 className="text-[14px] font-semibold text-[#254d1e]">{connection.degree.name}</h3>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66805f]">Related careers</p>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-2">
        {connection.careers.map((career) => (
          <Link key={career.careerId} href={careerCanonicalPath("IE", career.careerId)} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
            {career.careerName} <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </article>
  )
}

function InstitutionConnectionCard({ institution }: { institution: IrelandInstitution }) {
  const detailPath = institutionDetailPath("IE", institution.slug)
  const locations = institution.locations

  return (
    <EntityCardLink href={detailPath} className="rounded-lg border-[#e5e4df] bg-[#fafaf8] px-4 py-4 hover:border-[#cfd9ca] hover:bg-[#fafaf8]">
      <div className="inline-flex items-center gap-1 text-[12.5px] font-semibold leading-4 text-[#1b1b1b] transition group-hover:text-[#3e7a2e]">
        {institution.name} <ArrowRight className="size-3" aria-hidden="true" />
      </div>
      <p className="mt-1 text-[10.5px] font-medium text-[#6f6d68]">HEA-recognised institution</p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
        {locations.map((location) => (
          <span key={location.id} className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#6f6d68]">
            <MapPin className="size-3" aria-hidden="true" />{location.city.name}
          </span>
        ))}
      </div>
    </EntityCardLink>
  )
}

function IrelandCareerCards({ degreeConnections }: { degreeConnections: readonly CountryDegreeConnection[] }) {
  const careers = new Map<string, { name: string; studyAreaCount: number }>()
  for (const connection of degreeConnections) {
    for (const career of connection.careers) {
      const existing = careers.get(career.careerId)
      careers.set(career.careerId, {
        name: career.careerName,
        studyAreaCount: (existing?.studyAreaCount ?? 0) + 1,
      })
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[...careers.entries()].map(([careerId, career]) => (
        <EntityCardLink key={careerId} href={careerCanonicalPath("IE", careerId)} className="rounded-xl bg-white p-4 hover:bg-[#fafcff]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8f8c85]">Reviewed career</p>
          <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.015em] text-[#1b1b1b] transition group-hover:text-[#2563eb]">{career.name}</h3>
          <p className="mt-2 text-[11px] font-medium text-[#6f6d68]">{career.studyAreaCount} related study {career.studyAreaCount === 1 ? "area" : "areas"}</p>
        </EntityCardLink>
      ))}
    </div>
  )
}

export function IrelandCountryDashboard({
  metrics,
  degreeConnections,
  institutions,
  employmentEcosystem,
}: {
  metrics: CountryMetrics
  degreeConnections: readonly CountryDegreeConnection[]
  institutions: readonly IrelandInstitution[]
  employmentEcosystem: IrelandEmploymentEcosystem
}) {
  const explorer = getCountryExplorer("IE")
  const profile = IRELAND_OCCUPATION_COUNTRY_PROFILE
  const visas = VISA_CATALOG.filter((visa) => visa.countryCode === "IE")
  if (!explorer) return null
  const publishedRegions = explorer.regions
    .map((region) => ({ ...region, cities: region.cities.filter((city) => Boolean(ieCityPath(city))) }))
    .filter((region) => region.cities.length > 0)
  const cityCount = publishedRegions.reduce((total, region) => total + region.cities.length, 0)
  const compareHref = buildIrelandCareerCompareHref()
  const salaryHint = metrics.salaryRange
    ? `CSO sector-average range · comparison value ${formatRankingValue(metrics.salaryRange)}`
    : "Verified salary range coming soon"
  const livingHint = metrics.livingCostRange ? "Immigration finance floor to Eurostudent observed average · tuition excluded" : "Verified student planning range coming soon"

  return (
    <div>
      <div id="overview" className="scroll-mt-24 grid gap-4 sm:grid-cols-3">
        <MetricCard icon={<Stamp className="size-4 text-[#6d4fc4]" />} accent="bg-[#f3f0fa]" label="Visa pathways" value={String(visas.length)} hint="Study, graduate-work and critical-skills routes" href="/countries/ie/visas" />
        <MetricCard icon={<Banknote className="size-4 text-[#2563eb]" />} accent="bg-[#eef4ff]" label="Salary range" value={formatMoneyRange(metrics.salaryRange)} hint={salaryHint} />
        <MetricCard icon={<Wallet className="size-4 text-[#c2691e]" />} accent="bg-[#fbf0e7]" label="Living costs" value={formatMoneyRange(metrics.livingCostRange)} hint={livingHint} />
      </div>
      <section className="mt-4 rounded-xl border border-[#e7e6e3] bg-[#fafaf8] px-5 py-4" aria-labelledby="ireland-identity-heading">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8f8c85]">Ireland snapshot</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h2 id="ireland-identity-heading" className="text-[18px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">English-speaking higher education</h2>
          <p className="text-[11.5px] font-medium text-[#6f6d68]">Employment clusters</p>
          <ul className="flex flex-wrap gap-2" aria-label="Ireland employment clusters">
            {["Technology", "Life sciences", "Financial services", "Healthcare"].map((cluster) => <li key={cluster} className="rounded-md border border-[#e5e4df] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4d4c48]">{cluster}</li>)}
          </ul>
        </div>
      </section>
      <nav className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" aria-label="Ireland sections">
        {[
          ["#careers", "Careers"],
          ["#education", "Education"],
          ["#cities", "Cities"],
          ["#industries", "Industries"],
        ].map(([href, label]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#e7e6e3] bg-white px-4 text-[12px] font-semibold text-[#3e4a5b] transition hover:border-[#c9d7f5] hover:bg-[#f8faff] hover:text-[#2563eb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2563eb]/15">{label}</Link>)}
        <Link href="/countries/ie/visas" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#e7e6e3] bg-white px-4 text-[12px] font-semibold text-[#3e4a5b] transition hover:border-[#c9d7f5] hover:bg-[#f8faff] hover:text-[#2563eb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2563eb]/15">Visas</Link>
        <Link href="/countries/ie/degrees" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#e7e6e3] bg-white px-4 text-[12px] font-semibold text-[#3e4a5b] transition hover:border-[#c9d7f5] hover:bg-[#f8faff] hover:text-[#2563eb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2563eb]/15">Degrees</Link>
      </nav>
      <section id="careers" className="scroll-mt-24 mt-10" aria-labelledby="ireland-careers-heading">
        <div className="flex flex-wrap items-center gap-2"><BriefcaseBusiness className="size-4 text-[#2563eb]" /><h2 id="ireland-careers-heading" className="text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Careers in Ireland</h2><Link href={compareHref} className="ml-auto text-[11.5px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline">Compare reviewed careers</Link></div>
        <p className="mt-1 text-[12px] text-[#6f6d68]">Six reviewed Career paths with connected study areas.</p>
        <Link href="/countries/ie/careers" className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563eb] hover:underline">Explore Ireland careers <ArrowRight className="size-3" aria-hidden="true" /></Link>
        <div className="mt-4"><IrelandCareerCards degreeConnections={degreeConnections} /></div>
      </section>
      <section id="education" className="scroll-mt-24 mt-12 rounded-xl border border-[#e7e6e3] bg-white p-5 sm:p-6" aria-labelledby="ireland-education-heading">
        <div className="flex items-center gap-2 text-[#3e7a2e]"><GraduationCap className="size-4" /><h2 id="ireland-education-heading" className="text-[20px] font-semibold tracking-[-0.02em]">Education in Ireland</h2></div>
        <div className="mt-6">
          <h3 className="text-[15px] font-semibold text-[#1b1b1b]">Study areas</h3>
          <p className="mt-1 text-[12px] text-[#6f6d68]">Fields connected to reviewed Ireland Career paths.</p>
          <Link href="/countries/ie/education" className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563eb] hover:underline">Explore Ireland education <ArrowRight className="size-3" aria-hidden="true" /></Link>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{degreeConnections.map((connection) => <DegreeConnectionCard key={connection.degree.id} connection={connection} />)}</div>
        </div>
        <aside className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-[#eef0ec] bg-[#fafaf8] px-4 py-3" aria-label="Academic year details">
          <p className="text-[11px] font-semibold text-[#4d4c48]">Academic year</p>
          <p className="text-[11px] text-[#6f6d68]">{profile.academicYear.headline}</p>
          <div className="flex flex-wrap gap-1.5">{profile.academicYear.intakes.map((intake) => <span key={intake} className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-[#6f6d68]">{intake}</span>)}</div>
        </aside>
        <div className="mt-8 border-t border-[#f0efec] pt-6">
          <div className="flex items-center gap-2 text-[#6d4fc4]"><Building2 className="size-4" /><h3 className="text-[15px] font-semibold text-[#1b1b1b]">Verified institutions</h3><Link href="/institutions/ie" className="ml-auto text-[11.5px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline">View all</Link></div>
          <p className="mt-1 text-[12px] text-[#6f6d68]">Nine HEA-recognised institutions.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{institutions.map((institution) => <InstitutionConnectionCard key={institution.id} institution={institution} />)}</div>
        </div>
      </section>
      <div id="cities" className="scroll-mt-24 mt-12">
        <div className="flex flex-wrap items-center gap-2"><MapPin className="size-4 text-[#3e7a2e]" /><h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Cities</h2><span className="text-[12px] font-medium text-[#8f8c85]">{cityCount} public cities</span><Link href={buildCityCompareCanonicalHref({ country: "IE" })} className="ml-auto text-[11.5px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline">Compare cities</Link></div>
        <Link href="/countries/ie/cities" className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563eb] hover:underline">Explore Ireland cities <ArrowRight className="size-3" aria-hidden="true" /></Link>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{publishedRegions.flatMap((region) => region.cities).map((city) => {
          const cityPath = ieCityPath(city)
          return <Link key={city} href={cityPath!} className="group flex min-h-20 items-center justify-between rounded-xl border border-[#e7e6e3] bg-white px-4 py-3 text-[14px] font-semibold text-[#1b1b1b] transition hover:border-[#c9d7f5] hover:bg-[#f8faff] hover:text-[#2563eb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2563eb]/15"><span className="inline-flex items-center gap-2"><MapPin className="size-4 text-[#8f8c85] transition group-hover:text-[#2563eb]" aria-hidden="true" />{city}</span><ArrowRight className="size-4 text-[#aaa7a0] transition group-hover:translate-x-0.5 group-hover:text-[#2563eb]" aria-hidden="true" /></Link>
        })}</div>
      </div>
      <div id="industries" className="scroll-mt-24"><IrelandEmploymentEcosystemSection ecosystem={employmentEcosystem} /></div>
      <IrelandEmploymentSectorChart ecosystem={employmentEcosystem} />
      <section className="mt-12 rounded-xl border border-[#e7e6e3] bg-[#fafaf8] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8" aria-labelledby="ireland-visas-heading">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8f8c85]">Path context</p><h2 id="ireland-visas-heading" className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Ireland visa information</h2><p className="mt-1 text-[12px] text-[#6f6d68]">Review study, graduate-work and critical-skills pathways.</p></div>
        <Link href="/countries/ie/visas" className="mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[#2557e0] px-4 text-[12px] font-semibold text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2563eb]/20 sm:mt-0">View Ireland visas <ArrowRight className="size-4" aria-hidden="true" /></Link>
      </section>
    </div>
  )
}
