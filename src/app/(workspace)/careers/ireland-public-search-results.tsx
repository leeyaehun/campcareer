import Link from "next/link"
import { ArrowRight, Building2, BriefcaseBusiness, Globe2, MapPin } from "lucide-react"
import type { IrelandPublicSearchEntity } from "@/lib/search/ireland-public-entity-search"

function ResultIcon({ type }: { type: IrelandPublicSearchEntity["type"] }) {
  if (type === "country") return <Globe2 className="size-4" aria-hidden="true" />
  if (type === "career") return <BriefcaseBusiness className="size-4" aria-hidden="true" />
  if (type === "city") return <MapPin className="size-4" aria-hidden="true" />
  return <Building2 className="size-4" aria-hidden="true" />
}

export function IrelandPublicSearchResults({
  query,
  results,
}: {
  query: string
  results: readonly IrelandPublicSearchEntity[]
}) {
  if (!query.trim()) return null

  return (
    <section className="mt-6 rounded-cc-large border border-campcareer-border bg-campcareer-surface p-4 shadow-cc-surface" aria-labelledby="ireland-public-search-heading">
      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-brand">Public Ireland results</p>
        <h2 id="ireland-public-search-heading" className="mt-1 text-base font-semibold text-campcareer-ink">Ireland decision paths</h2>
      </div>
      {results.length > 0 ? (
        <ul className="mt-3 divide-y divide-campcareer-border border-y border-campcareer-border">
          {results.map((result) => (
            <li key={result.id}>
              <Link href={result.href} className="group flex items-center gap-3 py-3 transition hover:text-brand">
                <span className="grid size-8 shrink-0 place-items-center rounded-cc-control bg-brand-tint text-brand">
                  <ResultIcon type={result.type} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-campcareer-ink group-hover:text-brand">{result.name}</span>
                  <span className="mt-0.5 block text-xs text-campcareer-muted">{result.context}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-campcareer-muted group-hover:text-brand" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-campcareer-ink-secondary">
          No published Ireland country, Career, city or institution matches “{query}”.
        </p>
      )}
    </section>
  )
}
