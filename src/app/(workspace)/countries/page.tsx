import Link from "next/link"

import { LAUNCH_COUNTRIES } from "@/data/launch-countries"
import { loadCountryDiscoveryData } from "./countries-page-data"
import { CountryDiscoveryCard } from "./country-discovery-card"

export const metadata = {
  title: "Countries | Explore Study & Career Destinations",
  description: "Explore supported countries for studying, working and building a career — compare economic strengths, minimum wage, notable institutions and career opportunities.",
  alternates: { canonical: "/countries" },
  robots: { index: true, follow: true } as const,
}

export default async function CountriesPage() {
  const countries = await loadCountryDiscoveryData()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:px-10">
      <section>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-campcareer-ink sm:text-4xl">Countries</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-campcareer-ink-secondary">
          Explore where to study, work and build your career. Each destination profile summarises its economic strengths,
          minimum wage, notable institutions and career opportunities before you open the full country hub.
        </p>
      </section>

      <section className="mt-10" aria-label="Explore countries">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-campcareer-muted">
          {countries.length} supported countries
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((data) => (
            <li key={data.country.code}>
              <CountryDiscoveryCard data={data} />
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-10 border-t border-campcareer-border pt-6">
        <nav aria-label="Country pages">
          <ul className="flex flex-wrap gap-2">
            {LAUNCH_COUNTRIES.map((country) => (
              <li key={country.code}>
                <Link
                  href={`/countries/${country.code.toLowerCase()}`}
                  prefetch={false}
                  className="inline-flex min-h-9 items-center rounded-cc-control px-2.5 text-sm font-medium text-campcareer-muted transition-colors duration-cc-fast hover:bg-campcareer-surface hover:text-campcareer-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  {country.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </div>
  )
}
