import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, MapPin, Wallet } from "lucide-react"
import { JsonLd, breadcrumbLd, itemListLd } from "@/components/seo/json-ld"
import { buildCityCompareCanonicalHref } from "@/lib/compare-routes"
import {
  ieCityPath,
  PUBLISHED_IE_CITY_NAMES,
  PUBLISHED_IE_CITY_SLUGS,
  type PublishedIeCitySlug,
} from "@/lib/cities/city-routes"
import { getIeCityProfile, type IeCityProfile } from "@/lib/cities/ie-city-profile.server"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Cities in Ireland for Study and Career Planning",
  description: "Compare Dublin, Cork, Galway and Limerick using verified student living-cost, transport, institution and employment-sector context.",
  alternates: { canonical: "/countries/ie/cities" },
  robots: { index: true, follow: true },
}

function moneyRange(profile: IeCityProfile | null) {
  if (!profile?.livingCost) return "Verified range pending"
  const formatter = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: profile.livingCost.currency,
    maximumFractionDigits: 0,
  })
  return `${formatter.format(profile.livingCost.low)}–${formatter.format(profile.livingCost.high)} / ${profile.livingCost.period}`
}

async function safeCityProfile(slug: PublishedIeCitySlug) {
  try {
    return await getIeCityProfile(slug)
  } catch (error) {
    console.error(`Unable to load Ireland city profile: ${slug}`, error)
    return null
  }
}

export default async function IrelandCitiesPage() {
  const profiles = await Promise.all(PUBLISHED_IE_CITY_SLUGS.map(async (slug) => ({
    slug,
    name: PUBLISHED_IE_CITY_NAMES[slug],
    href: ieCityPath(slug)!,
    profile: await safeCityProfile(slug),
  })))

  return (
    <>
      <JsonLd data={breadcrumbLd([
        { name: "Countries", path: "/countries" },
        { name: "Ireland", path: "/countries/ie" },
        { name: "Cities", path: "/countries/ie/cities" },
      ])} />
      <JsonLd data={itemListLd(profiles.map((city) => ({ name: city.name, path: city.href })))} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#77746e]" aria-label="Breadcrumb">
          <Link href="/countries" className="hover:text-[#1b1b1b]">Countries</Link>
          <span>/</span>
          <Link href="/countries/ie" className="hover:text-[#1b1b1b]">Ireland</Link>
          <span>/</span>
          <span>Cities</span>
        </nav>

        <section className="mt-7 rounded-2xl border border-[#eadfca] bg-[#fffaf1] p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a86514]">Ireland city intelligence</p>
          <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.035em] text-[#1b1b1b] sm:text-[40px]">Cities in Ireland</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-[#6f604c]">
            Dublin, Cork, Galway and Limerick are the current published city scope. Compare student-planning metrics and verified institution coverage without inferring unverified programme delivery.
          </p>
          <Link href={buildCityCompareCanonicalHref({ country: "IE" })} className="mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#2557e0] px-4 text-[12px] font-semibold text-white hover:bg-[#1d4ed8]">
            Compare Ireland cities <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {profiles.map(({ slug, name, href, profile }) => (
            <Link key={slug} href={href} className="group rounded-xl border border-[#e7e6e3] bg-white p-5 transition hover:border-[#c9d7f5] hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8f8c85]"><MapPin className="size-3" />Published city</p>
                  <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#1b1b1b] group-hover:text-[#2563eb]">{name}</h2>
                </div>
                <ArrowRight className="mt-1 size-4 text-[#aaa7a0] group-hover:text-[#2563eb]" aria-hidden="true" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[#fafaf8] p-3">
                  <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#a86514]"><Wallet className="size-3" />Student living</p>
                  <p className="mt-1 text-[12px] font-semibold text-[#4d4c48]">{moneyRange(profile)}</p>
                </div>
                <div className="rounded-lg bg-[#f7faf5] p-3">
                  <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#3e7a2e]"><Building2 className="size-3" />Verified institutions</p>
                  <p className="mt-1 text-[12px] font-semibold text-[#4d4c48]">{profile ? profile.linkedInstitutionCount : "—"}</p>
                </div>
              </div>
              {profile?.employmentSectors.length ? (
                <p className="mt-3 text-[11px] leading-5 text-[#77746e]">{profile.employmentSectors.slice(0, 4).join(" · ")}</p>
              ) : null}
            </Link>
          ))}
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/countries/ie/careers" className="rounded-xl border border-[#d9e3f7] bg-[#f7f9fe] p-5">
            <h2 className="text-[16px] font-semibold text-[#1b1b1b]">Careers in Ireland</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#6f6d68]">Explore the six reviewed Career paths and their industry context.</p>
          </Link>
          <Link href="/countries/ie/education" className="rounded-xl border border-[#dfe8db] bg-[#f7faf5] p-5">
            <h2 className="text-[16px] font-semibold text-[#1b1b1b]">Education in Ireland</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#6f6d68]">See reviewed study areas and verified institution locations.</p>
          </Link>
        </section>
      </main>
    </>
  )
}
