import type { Metadata } from "next"
import Link from "next/link"
import { permanentRedirect } from "next/navigation"
import {
  BriefcaseBusiness,
  Factory,
  HandHeart,
  Hammer,
  HeartPulse,
  Landmark,
  Laptop,
  Palette,
  Plane,
  Search,
  ShoppingBag,
  Sprout,
} from "lucide-react"
import { CAREER_CATALOGUE } from "@/lib/career-data-foundation/career-catalogue"
import { STUDY_CATEGORIES } from "@/data/study-concepts"
import { getIndexableOccupationRoute } from "@/lib/workspace/occupation-routes"
import { CareerCountrySelector } from "@/components/workspace/career-country-selector"

export const metadata: Metadata = {
  title: "Careers",
  description: "Explore CampCareer's career catalogue by field, country and keyword.",
  alternates: { canonical: "/careers" },
  robots: { index: false, follow: true },
}

const SHORT_CATEGORY_LABELS = new Map([
  ["trades", "Trades & Construction"],
  ["health", "Health & Care"],
  ["technology", "Technology"],
  ["engineering", "Engineering"],
  ["business", "Business & Law"],
  ["education", "Education"],
  ["environment", "Environment"],
  ["design", "Design & Creative"],
  ["hospitality", "Hospitality"],
  ["transport", "Transport & Logistics"],
])

const CATEGORY_ICON = new Map([
  ["trades", Hammer],
  ["health", HeartPulse],
  ["technology", Laptop],
  ["engineering", Factory],
  ["business", Landmark],
  ["education", HandHeart],
  ["environment", Sprout],
  ["design", Palette],
  ["hospitality", ShoppingBag],
  ["transport", Plane],
])

function CareerDiscovery() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="hidden text-xs font-semibold tracking-[0.08em] text-brand sm:block">Explore</p>
          <div className="flex flex-wrap items-center gap-2 sm:mt-1.5 sm:gap-3">
            <h1 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-campcareer-ink sm:text-3xl">
              Careers
            </h1>
            <CareerCountrySelector />
          </div>
        </div>
      </div>

      <form action="/careers" className="mt-4 lg:mt-6 lg:max-w-xl">
        <label htmlFor="career-search" className="sr-only">Search careers</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-campcareer-muted" />
          <input
            id="career-search"
            name="q"
            type="search"
            placeholder="Search careers, e.g. Nurse or Electrician…"
            className="h-12 w-full rounded-cc-control border border-campcareer-border bg-campcareer-surface pl-11 pr-24 text-sm text-campcareer-ink shadow-cc-surface outline-none focus:border-brand focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 min-h-9 -translate-y-1/2 rounded-cc-control bg-brand px-3 text-xs font-semibold text-white"
          >
            Search
          </button>
        </div>
      </form>

      <section className="mt-6" aria-labelledby="field-discovery-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-brand">Start here</p>
            <h2 id="field-discovery-heading" className="mt-2 text-xl font-semibold tracking-[-0.03em] text-campcareer-ink sm:text-2xl">
              Explore career fields
            </h2>
          </div>
          <p className="hidden max-w-52 text-right text-xs leading-5 text-campcareer-muted sm:block">
            Choose a field first, then compare the careers inside it.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {STUDY_CATEGORIES.map((category, index) => {
            const careersInCategory = CAREER_CATALOGUE.filter((career) => career.categoryId === category.id)
            const example = careersInCategory[0]
            const Icon = CATEGORY_ICON.get(category.id) ?? BriefcaseBusiness
            return (
              <Link
                key={category.id}
                href={`/careers?category=${category.id}`}
                prefetch={false}
                className={`${index >= 6 ? "hidden sm:block" : "block"} group min-h-32 rounded-cc-large border border-campcareer-border bg-campcareer-surface p-4 text-left shadow-cc-surface transition-colors duration-cc-standard hover:border-brand/40 hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:min-h-36`}
              >
                <span className="grid size-9 place-items-center rounded-cc-surface bg-brand-tint text-brand"><Icon className="size-[18px]" /></span>
                <span className="mt-3 block text-sm font-semibold leading-5 tracking-[-0.015em] text-campcareer-ink">
                  <span className="sm:hidden">{SHORT_CATEGORY_LABELS.get(category.id) ?? category.label}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                </span>
                <span className="mt-1.5 block text-xs font-medium text-campcareer-muted">{careersInCategory.length} roles</span>
                {example ? <span className="mt-1 hidden truncate text-xs text-campcareer-ink-secondary sm:block">e.g. {example.label}</span> : null}
              </Link>
            )
          })}
        </div>

        <Link
          href="/careers?browse=1"
          prefetch={false}
          className="mt-4 inline-flex min-h-10 items-center rounded-cc-control px-1 text-sm font-semibold text-brand transition-colors duration-cc-fast hover:text-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          Browse all careers
        </Link>
      </section>
    </>
  )
}

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const q = typeof sp.q === "string" ? sp.q : ""
  const occupation = typeof sp.occupation === "string" ? sp.occupation : ""
  const country = typeof sp.country === "string" ? sp.country : ""
  const category = typeof sp.category === "string" ? sp.category : ""
  const browse = sp.browse === "1"
  const canonicalRoute = country && occupation
    ? getIndexableOccupationRoute(country, occupation)
    : null

  if (canonicalRoute) permanentRedirect(canonicalRoute.path)

  if (!q.trim() && !occupation && !country && !category && !browse) {
    return <CareerDiscovery />
  }

  const { OccupationExplorer } = await import("../occupation/occupation-explorer")

  return (
    <OccupationExplorer
      basePath="/careers"
      initialQuery={q}
      initialOccupation={occupation}
      initialCountry={country.toUpperCase() === "GB" ? "UK" : country.toUpperCase()}
      initialCategory={category}
      initialBrowseAll={browse}
    />
  )
}
