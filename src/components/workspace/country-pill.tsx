"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, Globe2 } from "lucide-react"
import { LAUNCH_COUNTRIES } from "@/data/launch-countries"
import { useSelectedCountry } from "./country-context"
import { cn } from "@/lib/utils"

export function CountryPill({
  onChange,
  value,
  allowAll = true,
}: {
  onChange?: (code: string | null) => void
  value?: string | null
  allowAll?: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const { selectedCountry, setSelectedCountry } = useSelectedCountry()

  const countries = useMemo(
    () => [...LAUNCH_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  )
  const resolvedCode = value === undefined ? selectedCountry?.code ?? null : value
  const selected = resolvedCode
    ? LAUNCH_COUNTRIES.find((c) => c.code === resolvedCode) ?? null
    : null

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  function handlePick(code: string) {
    if (!allowAll && code === "") return
    const country = code === "" ? null : (LAUNCH_COUNTRIES.find((c) => c.code === code) ?? null)
    setSelectedCountry(
      country ? { code: country.code, name: country.name, currency: country.currency } : null
    )
    onChange?.(code === "" ? null : code)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-campcareer-border bg-campcareer-surface pl-2 pr-3 text-[13px] font-semibold text-campcareer-ink shadow-cc-surface transition-colors duration-cc-fast hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        {selected ? (
          <img
            src={selected.image}
            alt=""
            width={40}
            height={28}
            className="size-5 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-tint">
            <Globe2 className="size-3 text-brand" />
          </span>
        )}
        <span className="max-w-28 truncate">{selected?.name ?? "All countries"}</span>
        <ChevronDown
          className={cn("size-3.5 shrink-0 text-campcareer-muted transition-transform duration-cc-fast", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select country"
          className="absolute left-0 top-[calc(100%+6px)] z-30 w-56 overflow-hidden rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-1 shadow-cc-raised"
        >
          <ul className="max-h-72 overflow-y-auto">
            {allowAll && (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={!resolvedCode}
                  onClick={() => handlePick("")}
                  className={cn(
                    "flex min-h-9 w-full items-center gap-2.5 rounded-cc-control px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-cc-fast",
                    !resolvedCode ? "bg-brand-tint text-brand" : "text-campcareer-ink-secondary hover:bg-secondary"
                  )}
                >
                  <Globe2 className="size-4 shrink-0 text-campcareer-muted" />
                  All countries
                  {!resolvedCode && <Check className="ml-auto size-3.5" />}
                </button>
              </li>
            )}
            {countries.map((country) => (
              <li key={country.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={resolvedCode === country.code}
                  onClick={() => handlePick(country.code)}
                  className={cn(
                    "flex min-h-9 w-full items-center gap-2.5 rounded-cc-control px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-cc-fast",
                    resolvedCode === country.code
                      ? "bg-brand-tint text-brand"
                      : "text-campcareer-ink-secondary hover:bg-secondary"
                  )}
                >
                  <img
                    src={country.image}
                    alt=""
                    width={40}
                    height={28}
                    className="size-4 shrink-0 rounded-full object-cover"
                  />
                  <span className="truncate">{country.name}</span>
                  {resolvedCode === country.code && (
                    <Check className="ml-auto size-3.5" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
