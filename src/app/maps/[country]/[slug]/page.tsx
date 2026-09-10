import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld"
import {
  formatMapSalary,
  getIndexableMapOccupations,
  isMapOccupationIndexable,
  isMapCountry,
  resolveMapOccupation,
} from "@/lib/map-slugs"
import { buildCountryCompareCanonicalHref } from "@/lib/compare-routes"
import { pageMetadata } from "@/lib/seo"

export const revalidate = 86400
export const dynamicParams = true

type Params = {
  country: string
  slug: string
}

export async function generateStaticParams() {
  const countries = ["us", "ie", "uk", "de", "nl", "be", "sg", "kr", "fr", "es"] as const
  const params: Array<{ country: string; slug: string }> = []
  for (const country of countries) {
    const occupations = await getIndexableMapOccupations(country)
    params.push(...occupations.map((occupation) => ({ country, slug: occupation.slug })))
  }
  return params
}

async function getOccupationFromParams(params: Params) {
  if (!isMapCountry(params.country)) return null
  return resolveMapOccupation(params.country, params.slug)
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const params = await props.params;
  const occupation = await getOccupationFromParams(params)
  if (!occupation) return { title: "Map page not found" }

  return {
    ...pageMetadata({
    title: `${occupation.name} Map in ${occupation.countryName} — Salary, Demand & Study Pathways`,
    description: `Explore ${occupation.name} pathways in ${occupation.countryName}: salary, labour demand, shortage signals, study direction, and related CampCareer planning tools.`,
    path: occupation.path,
    }),
    robots: { index: isMapOccupationIndexable(occupation), follow: true },
    ...(occupation.country === "fr" && { alternates: { canonical: occupation.path, languages: { en: occupation.path, "ko-KR": `/ko${occupation.path}` } } }),
  }
}

export default async function MapsOccupationPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  const occupation = await getOccupationFromParams(params)
  if (!occupation) notFound()

  if (params.slug !== occupation.slug) {
    redirect(occupation.path)
  }

  const salary = formatMapSalary(occupation.medianSalary, occupation.currency)
  const salaryLabel = occupation.salaryLabel ?? "Median salary"
  const demandLabel =
    occupation.shortageRating != null ? `${occupation.shortageRating}/5 shortage rating` :
    occupation.shortageScore != null ? `${occupation.shortageScore}/100 shortage score` :
    "Demand varies by region"
  const countryMapHref = `/maps?country=${occupation.country}`
  const compareHref = buildCountryCompareCanonicalHref({ goal: occupation.name })

  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: "CampCareer", path: "/" },
        { name: "Maps", path: "/maps" },
        { name: occupation.countryName, path: countryMapHref },
        { name: occupation.name, path: occupation.path },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Occupation",
        name: occupation.name,
        occupationCategory: `${occupation.codeLabel} ${occupation.code}`,
        description: `${occupation.name} pathways in ${occupation.countryName}. ${demandLabel}.`,
        ...(occupation.medianSalary && occupation.salaryLabel == null && {
          estimatedSalary: {
            "@type": "MonetaryAmount",
            currency: occupation.currency,
            value: occupation.medianSalary,
          },
        }),
        mainEntityOfPage: `https://www.campcareer.com${occupation.path}`,
      }} />

      <main className="min-h-screen bg-[#f7f7f5]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <nav className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link href="/maps" className="hover:text-slate-900">Maps</Link>
              <span>/</span>
              <Link href={countryMapHref} className="hover:text-slate-900">
                {occupation.countryName}
              </Link>
              <span>/</span>
              <span className="text-slate-900">{occupation.name}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {occupation.codeLabel} {occupation.code} · CampCareer Maps
                </p>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {occupation.name} map in {occupation.countryName}
                </h1>
                {occupation.localName && (
                  <p className="mt-3 text-lg text-slate-500">{occupation.localName}</p>
                )}
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                  Compare salary, demand, study direction, and migration-relevant signals for this pathway.
                  This page is the search-friendly map view for students deciding where a career can realistically lead.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-medium text-slate-500">Quick snapshot</div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">{salaryLabel}</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-950">{salary}</div>
                    {occupation.salaryLabel && <div className="mt-1 text-xs text-slate-400">Published MOM offer-range midpoint, not a resident wage median.</div>}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">Demand signal</div>
                    <div className="mt-1 text-lg font-semibold text-slate-950">{demandLabel}</div>
                  </div>
                  {occupation.field && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">Related field</div>
                      <div className="mt-1 text-lg font-semibold text-slate-950">{occupation.field}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">Data source</div>
                    <a
                      href={occupation.dataSource.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950 hover:underline"
                    >
                      {occupation.dataSource.sourceName}
                      <span aria-hidden="true">-&gt;</span>
                    </a>
                    <div className="mt-1 text-xs text-slate-400">Checked {occupation.dataSource.lastChecked}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
          {occupation.country === "au" && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">Career exploration</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Salary, shortage by state, skills map, live jobs, outlook and credentials — all in one place.
              </p>
              <Link href="/career" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
                Explore careers <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Study direction</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use this map as the entry point for choosing majors, cities, and institutions connected to {occupation.name}.
            </p>
            <Link href="/career" className="mt-5 inline-flex text-sm font-semibold text-slate-950 hover:underline">
              Explore careers
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Study programs</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Compare tuition, living cost, graduate salary, and payback time before committing to a country or course.
            </p>
            <Link href="/programs" className="mt-5 inline-flex text-sm font-semibold text-slate-950 hover:underline">
              Explore programs
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Interactive map</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Explore universities, regions, and labour-market signals in the full Google Maps-style interface.
            </p>
            <Link href={`/maps?country=${occupation.country}`} className="mt-5 inline-flex text-sm font-semibold text-slate-950 hover:underline">
              Open map
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Decision brief</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Compare this career direction against your budget, study level, migration goal, and country options.
            </p>
            <Link href={compareHref} className="mt-5 inline-flex text-sm font-semibold text-slate-950 hover:underline">
              Compare countries
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
