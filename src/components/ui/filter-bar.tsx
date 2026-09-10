import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

function FilterBar({ children, className, label = "Filters" }: { children: ReactNode; className?: string; label?: string }) {
  return <div aria-label={label} className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>
}

function FilterChip({ active = false, children, className, ...props }: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "min-h-9 rounded-cc-control border px-3 text-xs font-semibold transition-colors duration-cc-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        active ? "border-primary bg-primary text-primary-foreground" : "border-campcareer-border bg-campcareer-surface text-campcareer-ink-secondary hover:border-brand/40 hover:text-brand",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { FilterBar, FilterChip }
