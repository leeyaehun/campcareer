"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type CategorySearchProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  autoFocus?: boolean
}

export function CategorySearch({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
}: CategorySearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-campcareer-muted" />
      <Input
        type="search"
        role="searchbox"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-12 appearance-none rounded-cc-surface pr-12 pl-11 text-[15px] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-cc-control text-campcareer-muted transition-colors duration-cc-fast hover:bg-secondary hover:text-campcareer-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
