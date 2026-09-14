import Link from "next/link"
import { ArrowRight, ExternalLink, FileCheck2, ShieldAlert } from "lucide-react"
import type { VisaEntry } from "@/lib/workspace/visa-catalog"
import type { VisaDetail } from "@/lib/workspace/visa-detail"
import { IRELAND_VISA_DIRECTORY_PATH, irelandVisaCanonicalPath } from "@/lib/workspace/visa-routes"

const KIND_ORDER: readonly VisaEntry["kind"][] = ["Study", "Work", "Working holiday", "Skilled"]

const KIND_DESCRIPTION: Partial<Record<VisaEntry["kind"], string>> = {
  Study: "Recognised study permission",
  Work: "Post-graduation or employer-linked work permission",
  "Working holiday": "Temporary youth mobility or bilateral work-travel",
  Skilled: "Occupation-listed employment permits",
}

function Breadcrumb({ current }: { current?: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-campcareer-muted" aria-label="Breadcrumb">
      <Link href="/countries" className="hover:text-brand hover:underline">Countries</Link><span>/</span>
      <Link href="/countries/ie" className="hover:text-brand hover:underline">Ireland</Link><span>/</span>
      {current ? <><Link href={IRELAND_VISA_DIRECTORY_PATH} className="hover:text-brand hover:underline">Visas</Link><span>/</span><span>{current}</span></> : <span>Visas</span>}
    </nav>
  )
}

export function IrelandVisaDirectory({ visas }: { visas: readonly VisaEntry[] }) {
  const byKind = new Map(visas.map((visa) => [visa.name, visa.kind]))
  const grouped = KIND_ORDER
    .map((kind) => ({ kind, items: visas.filter((visa) => byKind.get(visa.name) === kind) }))
    .filter((group) => group.items.length > 0)

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-campcareer-canvas px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Breadcrumb />
        <section className="mt-6 rounded-cc-large border border-campcareer-border bg-brand-tint p-6 shadow-cc-surface sm:p-8">
          <p className="text-xs font-semibold tracking-[0.08em] text-brand">Ireland work-rights context</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-campcareer-ink sm:text-4xl">Ireland visas and work-rights pathways</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-campcareer-ink-secondary">Review verified study, graduate-work and employment-permit pathways. Eligibility and requirements depend on your circumstances; confirm the current position with the issuing authority.</p>
        </section>
        <div className="mt-8 space-y-8">
          {grouped.map((group) => (
            <section key={group.kind} aria-labelledby={`visa-kind-${group.kind}`}>
              <div className="flex items-baseline gap-2">
                <h2 id={`visa-kind-${group.kind}`} className="text-sm font-semibold text-campcareer-ink">{group.kind}</h2>
                <p className="text-xs text-campcareer-muted">{KIND_DESCRIPTION[group.kind] ?? "Official route context"}</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {group.items.map((visa) => (
                  <Link key={visa.name} href={irelandVisaCanonicalPath(visa.name)} className="group block rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-5 shadow-cc-surface transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20">
                    <h2 className="flex items-center gap-1.5 text-lg font-semibold text-campcareer-ink group-hover:text-brand">{visa.name}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></h2>
                    <p className="mt-2 text-sm leading-6 text-campcareer-ink-secondary">{visa.note}</p>
                    <p className="mt-4 text-xs font-semibold text-campcareer-muted">Official guidance: {visa.authority}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-8 flex gap-2 rounded-cc-surface border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950"><ShieldAlert className="mt-0.5 size-4 shrink-0" />This is general country context, not immigration or legal advice. Rules, fees and processing times can change.</p>
      </div>
    </main>
  )
}

export function IrelandVisaDetail({ visa, detail }: { visa: VisaEntry; detail: VisaDetail | null }) {
  const facts = detail ? [["Permission", detail.status], ["Processing", detail.processingTime], ["Duration", detail.duration]].filter(([, value]) => Boolean(value)) : []

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-campcareer-canvas px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Breadcrumb current={visa.name} />
        <article className="mt-6 rounded-cc-large border border-campcareer-border bg-campcareer-surface p-5 shadow-cc-surface sm:p-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-xs font-semibold text-brand">{visa.kind} pathway · Ireland</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-campcareer-ink sm:text-4xl">{visa.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-campcareer-ink-secondary">{visa.note}</p>
          <a href={visa.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 rounded-cc-control bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-press focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30">Official guidance from {visa.authority}<ExternalLink className="size-4" /></a>
          {facts.length ? <dl className="mt-7 grid gap-3 sm:grid-cols-3">{facts.map(([label, value]) => <div key={label} className="rounded-cc-surface border border-campcareer-border bg-campcareer-canvas p-3.5"><dt className="text-xs font-semibold uppercase tracking-[0.06em] text-campcareer-muted">{label}</dt><dd className="mt-1.5 text-sm font-semibold leading-5 text-campcareer-ink">{value}</dd></div>)}</dl> : null}
          {detail ? <section className="mt-8 border-t border-campcareer-border pt-6"><div className="flex items-center gap-2"><FileCheck2 className="size-4 text-brand" /><h2 className="text-lg font-semibold text-campcareer-ink">Official-route requirements to check</h2></div><ul className="mt-4 space-y-3">{detail.requirements.map((requirement) => <li key={requirement} className="text-sm leading-6 text-campcareer-ink-secondary">{requirement}</li>)}</ul><p className="mt-5 text-xs leading-5 text-campcareer-muted">{detail.costNote}</p></section> : null}
          <p className="mt-7 flex gap-2 rounded-cc-surface border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950"><ShieldAlert className="mt-0.5 size-4 shrink-0" />This page is not legal advice. The catalog provides an official issuing-authority link but does not store a separate review date; confirm current requirements directly before acting.</p>
        </article>
      </div>
    </main>
  )
}
