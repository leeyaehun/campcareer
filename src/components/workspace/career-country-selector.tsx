"use client"

import { useState } from "react"
import { LAUNCH_COUNTRIES } from "@/data/launch-countries"

const DISCOVERY_COUNTRIES = [...LAUNCH_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name))

export function CareerCountrySelector() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false)
      }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-10 items-center rounded-full border border-campcareer-border bg-campcareer-surface px-3 text-[13px] font-semibold text-campcareer-ink shadow-cc-surface transition-colors duration-cc-fast hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        All countries
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Select country"
          className="absolute left-0 top-[calc(100%+6px)] z-30 w-56 overflow-hidden rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-1 shadow-cc-raised"
        >
          <div className="max-h-72 overflow-y-auto">
            {DISCOVERY_COUNTRIES.map((country) => (
              <a
                key={country.code}
                href={`/careers?country=${country.code}`}
                role="option"
                aria-selected={false}
                onClick={() => setOpen(false)}
                className="flex min-h-9 w-full items-center rounded-cc-control px-2.5 py-2 text-[13px] font-medium text-campcareer-ink-secondary transition-colors duration-cc-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                {country.name}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
