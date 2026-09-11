import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"
import { SITE_URL } from "@/lib/seo-routes.mjs"
import {
  getAuOccupationStatePage,
  getAuOccupationStatePagesForCareer,
  getAuOccupationStatePagesForState,
} from "@/lib/workspace/au-occupation-state-seo"
import { getAuOccupationStatePageData } from "@/lib/workspace/au-occupation-state-seo.server"

type Params = { params: Promise<{ state: string; occupation: string }> }

export const dynamic = "force-dynamic"

function number(value: number | null, digits = 0) {
  if (value == null) return "Not published"
  return new Intl.NumberFormat("en-AU", { maximumFractionDigits: digits }).format(value)
}

function money(value: number | null) {
  if (value == null) return "Not published"
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value)
}

function percent(value: number | null) {
  if (value == null) return "Not published"
  return `${new Intl.NumberFormat("en-AU", { maximumFractionDigits: 1 }).format(value)}%`
}

function Metric({
  label,
  value,
  note,
  icon,
}: {
  label: string
  value: string
  note: string
  icon: React.ReactNode
}) {
  return (
    <article className="rounded-xl border border-[#e7e6e3] bg-white p-4">
      <div className="flex items-center gap-2 text-[#2563eb]">{icon}<p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#8f8c85]">{label}</p></div>
      <p className="mt-3 text-[23px] font-semibold tracking-[-0.025em] text-[#1b1b1b]">{value}</p>
      <p className="mt-1.5 text-[11px] leading-5 text-[#77746e]">{note}</p>
    </article>
  )
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { state, occupation } = await params
  const route = getAuOccupationStatePage(state, occupation)
  if (!route) {
    return { title: "Occupation demand page not found", robots: { index: false, follow: false } }
  }

  const data = await getAuOccupationStatePageData(state, occupation)
  if (!data) {
    return { title: "Occupation demand page not found", robots: { index: false, follow: false } }
  }

  return {
    title: `${route.career.label} Demand in ${route.state.label}, Australia`,
    description: `${route.career.label} demand in ${route.state.label}: ${number(data.region.vacancyCount, 1)} online vacancies, shortage rating ${number(data.region.shortageRating)}/3, state rank and Australia-wide earnings and outlook context.`,
    alternates: { canonical: `${SITE_URL}${route.path}` },
    // State demand is contextual evidence for the canonical Career Page, not a
    // second indexable Career surface.
    robots: { index: false, follow: true },
    openGraph: {
      title: `${route.career.label} Demand in ${route.state.label}`,
      description: `${number(data.region.vacancyCount, 1)} online vacancies and shortage rating ${number(data.region.shortageRating)}/3 in ${route.state.label}.`,
      url: `${SITE_URL}${route.path}`,
      type: "website",
    },
  }
}

export default async function AuOccupationStatePage({ params }: Params) {
  const { state, occupation } = await params
  const route = getAuOccupationStatePage(state, occupation)
  if (!route) notFound()
  if (state !== route.state.slug || occupation !== route.career.slug) permanentRedirect(route.path)

  const data = await getAuOccupationStatePageData(state, occupation)
  if (!data) notFound()

  const { profile, region } = data
  const otherStates = getAuOccupationStatePagesForCareer(route.career.slug)
    .filter((page) => page.state.slug !== route.state.slug)
  const otherCareers = getAuOccupationStatePagesForState(route.state.slug)
    .filter((page) => page.career.slug !== route.career.slug)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${route.career.label} demand in ${route.state.label}, Australia`,
    url: `${SITE_URL}${route.path}`,
    about: { "@type": "Occupation", name: profile.officialTitle },
    spatialCoverage: {
      "@type": "AdministrativeArea",
      name: route.state.label,
      containedInPlace: { "@type": "Country", name: "Australia" },
    },
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 sm:px-8 lg:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#9a978f]" aria-label="Breadcrumb">
        <Link href="/countries/au" prefetch={false} className="hover:text-[#2563eb]">Australia</Link><span>/</span>
        <Link href="/occupation?country=AU" prefetch={false} className="hover:text-[#2563eb]">Occupations</Link><span>/</span>
        <span>{route.state.label}</span><span>/</span><span>{route.career.label}</span>
      </nav>

      <header className="mt-6 rounded-2xl border border-[#d9e3f7] bg-gradient-to-br from-[#f5f8ff] via-white to-[#f4f8f1] p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2563eb]">Australia state demand</p>
        <h1 className="mt-2 max-w-4xl text-[32px] font-semibold leading-tight tracking-[-0.035em] text-[#1b1b1b] sm:text-[42px]">
          {route.career.label} demand in {route.state.label}
        </h1>
        <p className="mt-3 max-w-3xl text-[13px] leading-6 text-[#66635d]">
          State and territory demand is based on the regional vacancy and shortage evidence attached to CampCareer&apos;s verified {profile.officialTitle} profile. Australia-wide earnings, employment and outlook are shown separately below.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/occupation?occupation=${route.career.slug}`} prefetch={false} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-[#1f55c9]">
            Open career explorer <ArrowRight className="size-3.5" />
          </Link>
          {route.state.citySlug && route.state.cityLabel && (
            <Link href={`/cities/au/${route.state.citySlug}`} prefetch={false} className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfd9ca] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#3e7a2e]">
              {route.state.cityLabel} city guide <MapPin className="size-3.5" />
            </Link>
          )}
        </div>
      </header>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="State occupation snapshot">
        <Metric label={`${route.state.code} vacancies`} value={number(region.vacancyCount, 1)} note={`Online vacancy measure · data as of ${region.asOfDate}`} icon={<BriefcaseBusiness className="size-4" />} />
        <Metric label="Vacancy rank" value={`#${data.vacancyRank}`} note={`Among ${data.rankedRegionCount} Australian states and territories with published vacancies`} icon={<TrendingUp className="size-4" />} />
        <Metric label="Regional share" value={percent(data.vacancySharePct)} note="Share of the profile's published state and territory vacancy total" icon={<MapPin className="size-4" />} />
        <Metric label="Shortage rating" value={`${number(region.shortageRating)}/3`} note="Official regional shortage evidence; higher value means stronger shortage signal" icon={<ShieldCheck className="size-4" />} />
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
        <section className="rounded-2xl border border-[#e7e6e3] bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-[#1b1b1b]">How {route.state.label} compares</h2>
          <p className="mt-2 text-[11.5px] leading-5 text-[#77746e]">The ranking below uses the same dated regional vacancy series for this occupation profile.</p>
          <div className="mt-4 divide-y divide-[#efeeeb]">
            {[...profile.regions]
              .filter((item) => item.vacancyCount != null && item.vacancyCount > 0)
              .sort((a, b) => (b.vacancyCount ?? 0) - (a.vacancyCount ?? 0))
              .map((item, index) => {
                const statePage = getAuOccupationStatePagesForCareer(route.career.slug).find((page) => page.state.code === item.regionCode)
                const row = (
                  <>
                    <div className="flex min-w-0 items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f3f5f8] text-[10.5px] font-bold text-[#77746e]">{index + 1}</span><div><p className="text-[12.5px] font-semibold text-[#33312d]">{statePage?.state.label ?? item.regionCode}</p><p className="mt-0.5 text-[10.5px] text-[#8f8c85]">Shortage {number(item.shortageRating)}/3</p></div></div>
                    <span className="text-[12px] font-semibold text-[#2563eb]">{number(item.vacancyCount, 1)}</span>
                  </>
                )
                return statePage ? <Link key={item.regionCode} href={statePage.path} prefetch={false} className="flex items-center justify-between gap-4 py-3 hover:bg-[#fafbfc]">{row}</Link> : <div key={item.regionCode} className="flex items-center justify-between gap-4 py-3">{row}</div>
              })}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border border-[#e7e6e3] bg-white p-5">
            <div className="flex items-center gap-2 text-[#3e7a2e]"><Banknote className="size-4" /><h2 className="text-[14.5px] font-semibold text-[#1b1b1b]">Australia-wide career context</h2></div>
            <div className="mt-4 space-y-3 text-[11.5px]">
              <div className="flex justify-between gap-4"><span className="text-[#77746e]">Annualised median salary</span><strong>{money(profile.metric.annualisedMedianSalary)}</strong></div>
              <div className="flex justify-between gap-4"><span className="text-[#77746e]">Employment</span><strong>{number(profile.metric.employmentTotal)}</strong></div>
              <div className="flex justify-between gap-4"><span className="text-[#77746e]">10-year growth</span><strong>{percent(profile.metric.employmentGrowth10yPct)}</strong></div>
              <div className="flex justify-between gap-4"><span className="text-[#77746e]">Opportunity Score</span><strong>{profile.metric.opportunityScore}/100</strong></div>
            </div>
            <p className="mt-4 rounded-lg bg-[#fff8ee] px-3 py-2.5 text-[10.5px] leading-4 text-[#795b34]">These four metrics are national Australia figures, not {route.state.label}-specific salary or employment estimates.</p>
          </section>

          <section className="rounded-xl border border-[#e7e0f3] bg-[#f8f6fc] p-5">
            <div className="flex items-center gap-2 text-[#6d4fc4]"><ShieldCheck className="size-4" /><h2 className="text-[14.5px] font-semibold text-[#3f3650]">Registration and entry</h2></div>
            <p className="mt-3 text-[11.5px] leading-5 text-[#655d70]">{profile.registrationRequired ? `Registration or licensing is required. ${profile.registrationAuthority ?? "Check the relevant state or national authority"}.` : "No mandatory registration requirement is recorded in the verified profile; check role-specific requirements before applying."}</p>
            {profile.registrationUrl && <a href={profile.registrationUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6d4fc4] hover:underline">Official registration source <ExternalLink className="size-3" /></a>}
          </section>
        </div>
      </div>

      {(data.jobLinks.length > 0 || data.employers.length > 0 || data.entryLinks.length > 0) && (
        <section className="mt-5 grid gap-4 lg:grid-cols-3">
          <ResourceList title="Job searches" icon={<BriefcaseBusiness className="size-4" />} links={data.jobLinks} />
          <ResourceList title="Employers" icon={<Building2 className="size-4" />} links={data.employers} />
          <ResourceList title="Entry pathways" icon={<Users className="size-4" />} links={data.entryLinks} />
        </section>
      )}

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e7e6e3] bg-white p-5">
          <h2 className="text-[14.5px] font-semibold text-[#1b1b1b]">{route.career.label} demand in other states</h2>
          <div className="mt-3 flex flex-wrap gap-2">{otherStates.map((page) => <Link key={page.path} href={page.path} prefetch={false} className="rounded-full border border-[#deddd8] px-3 py-1.5 text-[11px] font-semibold text-[#5f5d57] hover:border-[#2563eb]/40 hover:text-[#2563eb]">{page.state.label}</Link>)}</div>
        </div>
        <div className="rounded-xl border border-[#e7e6e3] bg-white p-5">
          <h2 className="text-[14.5px] font-semibold text-[#1b1b1b]">Other careers in {route.state.label}</h2>
          <div className="mt-3 flex flex-wrap gap-2">{otherCareers.map((page) => <Link key={page.path} href={page.path} prefetch={false} className="rounded-full border border-[#deddd8] px-3 py-1.5 text-[11px] font-semibold text-[#5f5d57] hover:border-[#3e7a2e]/40 hover:text-[#3e7a2e]">{page.career.label}</Link>)}</div>
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-[#e7e6e3] bg-[#fafaf8] p-5 sm:p-6">
        <h2 className="text-[14px] font-semibold text-[#1b1b1b]">Data scope and source</h2>
        <p className="mt-2 max-w-4xl text-[11.5px] leading-5 text-[#77746e]">State/territory vacancy and shortage figures are the dated regional evidence stored for this verified occupation profile. Salary, employment, growth and Opportunity Score are Australia-wide metrics and are deliberately labelled as national context. Vacancy figures describe the source&apos;s online vacancy measure, not the total number of jobs in the state.</p>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-semibold"><a href={region.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#2563eb] hover:underline">Regional demand source <ExternalLink className="size-3" /></a><span className="text-[#8f8c85]">Regional data: {region.asOfDate}</span><span className="text-[#8f8c85]">Profile checked: {profile.sourceCheckedAt}</span></div>
      </section>
    </div>
  )
}

function ResourceList({ title, icon, links }: { title: string; icon: React.ReactNode; links: Array<{ label: string; url: string }> }) {
  return (
    <div className="rounded-xl border border-[#e7e6e3] bg-white p-5">
      <div className="flex items-center gap-2 text-[#2563eb]">{icon}<h2 className="text-[14px] font-semibold text-[#1b1b1b]">{title}</h2></div>
      <div className="mt-3 space-y-2">{links.length > 0 ? links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-[#efeeeb] bg-[#fafaf8] px-3 py-2.5 text-[11.5px] font-semibold text-[#4f4d48] hover:border-[#cbd8ef]"><span className="truncate">{link.label}</span><ExternalLink className="size-3 shrink-0 text-[#9c9a94]" /></a>) : <p className="text-[11px] text-[#8f8c85]">No verified links published.</p>}</div>
    </div>
  )
}
