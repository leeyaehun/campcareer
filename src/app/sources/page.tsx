import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Sources — Country Data and Official References",
  description: "Country-by-country official sources used for CampCareer salary, costs, education, workforce and visa information.",
  path: "/sources",
})

const countries = [
  {
    name: "Australia",
    href: "/methodology/australia",
    summary: "Salary, student costs, academic calendar, workforce demand, institutions and visa pathways.",
    additions: [["QILT Graduate Outcomes Survey", "https://www.qilt.edu.au/surveys/graduate-outcomes-survey-(gos)"]],
  },
  {
    name: "Canada",
    href: "/methodology/canada",
    summary: "Occupation salaries, student budgets, academic calendar, labour projections, institutions and study pathways.",
    additions: [
      ["Statistics Canada", "https://www.statcan.gc.ca/"],
      ["Job Bank trend analysis", "https://www.jobbank.gc.ca/trend-analysis"],
      ["Post-Graduation Work Permit", "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation.html"],
    ],
  },
  {
    name: "United States",
    href: "/methodology/united-states",
    summary: "Wages, student budgets, tuition, academic calendar, employment projections, institutions and student visas.",
    additions: [
      ["BLS Occupational Outlook Handbook", "https://www.bls.gov/ooh/"],
      ["USCIS STEM OPT extension", "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt"],
    ],
  },
  {
    name: "United Kingdom",
    href: "/methodology/united-kingdom",
    summary: "Earnings, student costs, tuition, wages, academic calendar, workforce demand, institutions and student visas.",
    additions: [
      ["HESA Graduate Outcomes", "https://www.hesa.ac.uk/data-and-analysis/graduates"],
      ["Graduate visa", "https://www.gov.uk/graduate-visa"],
    ],
  },
  {
    name: "Ireland",
    href: "/methodology/ireland",
    summary: "Earnings, living costs, tuition, wages, academic calendar, critical skills, institutions and student permissions.",
    additions: [["HEA Graduate Outcomes", "https://hea.ie/statistics/graduate-outcomes-data-and-reports/"]],
  },
  { name: "Germany", href: "/methodology/germany", summary: "Salary, living costs, education, workforce and immigration references.", additions: [] },
  { name: "Netherlands", href: "/methodology/netherlands", summary: "Salary, living costs, education, workforce and immigration references.", additions: [] },
  { name: "Belgium", href: "/methodology/belgium", summary: "Salary, living costs, education, workforce and immigration references.", additions: [] },
  { name: "France", href: "/methodology/france", summary: "Salary, living costs, education, workforce and immigration references.", additions: [] },
  { name: "Spain", href: "/methodology/spain", summary: "Salary, student costs, education, workforce, institutions and immigration references.", additions: [] },
  { name: "Singapore", href: "/methodology/singapore", summary: "Salary, student costs, education, workforce, institutions and immigration references.", additions: [] },
  { name: "South Korea", href: "/methodology/south-korea", summary: "Salary, student costs, education, workforce, institutions and immigration references.", additions: [] },
  { name: "Japan", href: "/methodology/japan", summary: "Salary, student costs, education, workforce, institutions and immigration references.", additions: [] },
  { name: "New Zealand", href: "/methodology/new-zealand", summary: "Salary, student costs, education, workforce, institutions and immigration references.", additions: [] },
  { name: "Norway", href: "/methodology/norway", summary: "Salary, student costs, education, workforce, institutions and immigration references.", additions: [] },
  { name: "Sweden", href: "/methodology/sweden", summary: "Salary, student costs, education, workforce, institutions and immigration references.", additions: [] },
  { name: "Denmark", href: "/methodology/denmark", summary: "Salary, student costs, education, workforce, institutions and immigration references.", additions: [] },
  { name: "Finland", href: "/methodology/finland", summary: "Salary, student costs, education, workforce, institutions and immigration references.", additions: [] },
  { name: "Switzerland", href: "/methodology/switzerland", summary: "Salary, student costs, education, workforce, institutions and immigration references.", additions: [] },
  { name: "United Arab Emirates", href: "/methodology/united-arab-emirates", summary: "Wage-policy benchmarks, student costs, education, workforce, institutions and immigration references.", additions: [] },
] as const

export default function SourcesPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
      <JsonLd data={breadcrumbLd([{ name: "Sources", path: "/sources" }])} />

      <p className="text-sm font-semibold text-blue-600">Evidence library</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Sources</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        Official and primary references are organised by country. Each country record explains which data is used, how it is interpreted, its coverage and its limits. Method definitions and calculation rules are documented separately.
      </p>
      <Link href="/methodology" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:underline">
        Read the methodology
      </Link>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {countries.map((country) => (
          <section key={country.name} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-xl font-semibold text-slate-900">{country.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{country.summary}</p>
            <Link href={country.href} className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:underline">
              View country sources
            </Link>
            {country.additions.length > 0 ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Additional comparison references</h3>
                <ul className="mt-3 space-y-2">
                  {country.additions.map(([label, url]) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600">
                        {label}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">Shared reference</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Currency conversion is a display aid and does not replace the original local-currency record.
        </p>
        <a href="https://frankfurter.app/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
          Frankfurter exchange rates
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </section>
    </main>
  )
}
