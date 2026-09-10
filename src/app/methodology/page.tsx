import Link from "next/link"
import { pageMetadata } from "@/lib/seo"
import { TAX_YEAR } from "@/lib/tax"
import { DEGREE_YEARS } from "@/lib/degree-years"
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld"

export const metadata = pageMetadata({
  title: "Methodology — Comparison, Costs and Pathways",
  description: "How CampCareer publishes comparisons, handles missing evidence, calculates financial estimates and communicates limitations.",
  path: "/methodology",
})

const LAST_UPDATED = "6 August 2026"

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
      {children}
    </div>
  )
}

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd data={breadcrumbLd([{ name: "Methodology", path: "/methodology" }])} />

      <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Methodology</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: {LAST_UPDATED} · Legacy ROI tax-model reference: {TAX_YEAR}</p>
      <p className="mt-5 text-sm leading-6 text-slate-600">
        This page explains CampCareer&apos;s calculation rules, release standards and limitations. Official references are maintained separately in the country-by-country Sources library.
      </p>
      <Link href="/sources" className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:underline">Browse sources</Link>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-600">
        <section id="career-comparison">
          <h2 className="font-display text-lg font-semibold text-slate-800">Career-country comparison release policy</h2>
          <p className="mt-2">
            CampCareer separates exploration from a publishable decision comparison. A destination can appear for discovery when useful geography or institution data exists, but it is not ranked and no financial result is shown until the exact career mapping and required evidence have passed review.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li><strong>Decision ready</strong> requires an exact occupation crosswalk plus current compensation, tax, housing, tuition and work-pathway evidence.</li>
            <li><strong>Discovery</strong> means useful profile data exists, but at least one decision input has not passed review.</li>
            <li><strong>Review required</strong> means there is not enough current evidence to publish the comparison.</li>
          </ul>
          <p className="mt-3">Missing values are never replaced with another country&apos;s average, treated as zero or presented as verified.</p>

          <h3 className="mt-5 font-display text-base font-semibold text-slate-700">Financial definitions</h3>
          <Formula>Take-home pay = annual gross pay − income tax − mandatory employee contributions</Formula>
          <Formula>Annual disposable income = take-home pay − 12 × (monthly rent + essential non-housing costs)</Formula>
          <Formula>First-year cash need = tuition deposit + visa/health costs + 12 months of living costs + travel/setup + contingency</Formula>
          <p>
            Money fields retain their original currency and source date. Currency conversion is a display convenience. The default tax scenario is a single filer with no dependants and full-year tax residency. Student housing defaults to shared housing; graduate housing defaults to a one-bedroom outside the city centre.
          </p>

          <h3 className="mt-5 font-display text-base font-semibold text-slate-700">Work and immigration status</h3>
          <p>
            CampCareer does not publish immigration success percentages. Eligibility labels are shown only when the relevant occupation list, post-study period, salary threshold, licensing or language requirement and policy date can be supported. The result is planning information, not legal or immigration advice.
          </p>

          <h3 className="mt-5 font-display text-base font-semibold text-slate-700">Evidence records and freshness</h3>
          <p>
            Published records retain the publisher, original URL, applicable date, retrieval date, review status and data version. Policy and visa records are reviewed when rules change; salary, tuition and housing records follow their stated review cadence. A stale or incomplete input removes the affected result until it is reviewed again.
          </p>
        </section>

        <section id="degree-risk">
          <h2 className="font-display text-lg font-semibold text-slate-800">Degree Risk score</h2>
          <p className="mt-2">
            Degree Risk estimates how expensive or narrow the route from an international degree to employment may be. It is not an instruction to avoid a field and it is not an individual probability.
          </p>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            <li><strong>Employment outcomes</strong> use the most comparable official graduate or occupational outcome series available for each country. Different reporting windows are disclosed and cross-country comparisons are treated cautiously.</li>
            <li><strong>Visa pathway</strong> checks whether typical occupations have a credible route from graduation to skilled work, including post-study duration and employer or occupation constraints.</li>
            <li><strong>Market demand</strong> combines vacancy trends, graduate intake and official shortage or projection signals. Because no single statistic captures current hiring demand, this layer is labelled as an estimate.</li>
            <li><strong>AI exposure</strong> maps published occupational exposure research to the roles graduates commonly enter. Exposure describes task change, not automatic job disappearance, and remains an estimate.</li>
            <li><strong>ROI</strong> compares international tuition with expected earnings after housing and living costs, then expresses the result as a payback measure.</li>
          </ol>
          <p className="mt-3">
            Official datasets rarely isolate international students. Cohort averages also hide individual variation, and a broad field can only approximate a specific programme or occupation. These constraints are carried as limitations rather than converted into false precision.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800">ROI score</h2>
          <p className="mt-2">The ROI score estimates how much of total tuition is recovered each year after housing and living costs, weighted by graduation rate.</p>
          <Formula>ROI = (net salary × graduation rate) ÷ total tuition × 100</Formula>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Net salary</strong> = median graduate earnings − estimated annual rent − estimated living costs.</li>
            <li><strong>Annual rent</strong> = city market median rent × 0.45 shared-housing factor × 12 months.</li>
            <li><strong>Living costs</strong> = annual rent × 0.4 for utilities, food and transport.</li>
            <li><strong>Total tuition</strong> = annual tuition × standard degree length: {Object.entries(DEGREE_YEARS).map(([country, years]) => `${country.toUpperCase()} ${years}yr`).join(" · ")}. Course-level duration takes precedence where available.</li>
          </ul>
          <p className="mt-2"><strong>Payback years</strong> = total tuition ÷ net salary, rounded to whole years.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800">After-tax estimates</h2>
          <p className="mt-2">
            The legacy ROI Explorer uses simplified {TAX_YEAR} single-filer models only where a maintained country rule exists. Credits, deductions, household circumstances, local taxes and professional advice are not modelled. Where no maintained model exists, tax and take-home results are marked unavailable instead of showing a zero-tax estimate.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800">Medicine override</h2>
          <p className="mt-2">
            Medical earnings sources often describe different career stages across countries. Medicine comparisons therefore replace inconsistent stored earnings with a common first-year attending or consultant stage before recalculating ROI and payback. This represents the post-residency stage, typically several years after graduation, rather than a graduate starting salary.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800">Career-stage adjustment</h2>
          <p className="mt-2">
            Source datasets measure earnings at different points after study. The career-stage toggle rescales earnings to a common target year using longitudinal patterns. Rent and living costs are held fixed across stages, so the adjusted result should be read as a salary-stage comparison rather than a full future-cost forecast.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-800">Known limitations</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Local-currency scores reflect different price levels, salary structures and tax systems; compare patterns rather than decimal points alone.</li>
            <li>Tuition can be a list price or net price depending on the underlying record, and scholarships are not modelled.</li>
            <li>Earnings medians hide field-level and person-level variance; visa work restrictions are not priced into every estimate.</li>
            <li>Shared-housing and non-housing cost factors are simplifying assumptions and may not match an individual budget.</li>
          </ul>
          <p className="mt-3">Found an error or have better evidence? <a href="mailto:contact@campcareer.com" className="text-blue-600 hover:underline">contact@campcareer.com</a></p>
        </section>
      </div>

      <div className="mt-12 flex items-center gap-4 border-t border-slate-200 pt-6 text-sm">
        <Link href="/sources" className="text-blue-600 hover:underline">Sources</Link>
        <Link href="/programs" className="text-blue-600 hover:underline">Programs</Link>
      </div>
    </main>
  )
}
