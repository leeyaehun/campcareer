import { LAUNCH_COUNTRIES } from "@/data/launch-countries"

export function CareerCountrySelector() {
  const countries = [...LAUNCH_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <details className="relative">
      <summary
        role="button"
        className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-campcareer-border bg-campcareer-surface pl-2 pr-3 text-[13px] font-semibold text-campcareer-ink shadow-cc-surface transition-colors duration-cc-fast hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 [&::-webkit-details-marker]:hidden"
      >
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-tint text-[11px]" aria-hidden="true">◎</span>
        <span>All countries</span>
        <span className="text-campcareer-muted" aria-hidden="true">⌄</span>
      </summary>
      <div
        role="listbox"
        aria-label="Select country"
        className="absolute left-0 top-[calc(100%+6px)] z-30 w-56 overflow-hidden rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-1 shadow-cc-raised"
      >
        <ul className="max-h-72 overflow-y-auto">
          {countries.map((country) => (
            <li key={country.code}>
              <a
                role="option"
                aria-selected="false"
                href={`/careers?country=${country.code}`}
                className="flex min-h-9 w-full items-center rounded-cc-control px-2.5 py-2 text-left text-[13px] font-medium text-campcareer-ink-secondary transition-colors duration-cc-fast hover:bg-secondary"
              >
                {country.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
