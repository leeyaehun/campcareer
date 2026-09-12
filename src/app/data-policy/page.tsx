import Link from "next/link"
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld"
import { DataIssueReport } from "@/components/feedback/data-issue-report"
import { MethodologyLink } from "@/components/analytics/tracked-link"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Data Policy — Sources, Reviews and Corrections",
  description: "How CampCareer prioritises sources, labels estimates, reviews data freshness and handles corrections.",
  path: "/data-policy",
})

export default function DataPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
      <JsonLd data={breadcrumbLd([{ name: "Data policy", path: "/data-policy" }])} />
      <p className="text-sm font-semibold text-blue-600">Trust and data operations</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Data policy</h1>
      <p className="mt-4 text-sm leading-6 text-slate-600">CampCareer publishes evidence to support a decision, not to manufacture certainty. A figure, score or pathway is shown only with the evidence and readiness required by the relevant product contract.</p>

      <div className="mt-10 space-y-9 text-sm leading-6 text-slate-600">
        <section>
          <h2 className="font-display text-xl font-semibold text-slate-900">Where data comes from</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Official government and statistical agencies</li>
            <li>Official education institutions</li>
            <li>Reputable primary industry sources</li>
            <li>High-quality secondary sources</li>
            <li>Estimates, clearly labelled as estimates</li>
          </ol>
          <p className="mt-3">A lower-priority source does not become more authoritative through presentation. Country-specific references are listed in <Link href="/sources" className="font-semibold text-blue-700 hover:underline">Sources</Link>.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-slate-900">Scores, estimates and missing evidence</h2>
          <p className="mt-3">Career publication follows the existing evidence and readiness rules. Missing evidence stays missing: it is not converted to zero, filled from another country, or shown as a verified result. Salary, demand, entry and pathway information may each have different source dates and limits.</p>
          <MethodologyLink sourceSurface="data_policy" className="mt-3 inline-flex font-semibold text-blue-700 hover:underline">Read the methodology</MethodologyLink>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-slate-900">Freshness and review</h2>
          <p className="mt-3">Important source inputs retain provenance such as source, applicable period, retrieval date and review state in the existing data foundation. Policy changes are reviewed when rules change; recurring datasets follow their recorded source cadence. A stale or incomplete input removes the affected decision result until it can be reviewed.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-slate-900">Corrections and what we do not claim</h2>
          <p className="mt-3">Material corrections are reviewed with their source history and may be marked internally as corrected, updated or source changed. CampCareer does not guarantee admissions, employment, salary, visa eligibility, or an individual outcome. Verify consequential decisions with the relevant official authority or provider.</p>
        </section>
      </div>

      <div className="mt-10"><DataIssueReport entityType="data_policy" /></div>
    </main>
  )
}
