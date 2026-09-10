import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

function CompareShell({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("mt-1", className)} aria-label="Comparison">{children}</section>
}

function CompareHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <header className={cn("border-b border-campcareer-border pb-4", className)}>{children}</header>
}

function CompareSection({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("border-y border-campcareer-border", className)}>
      <h2 className="bg-campcareer-canvas px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-campcareer-muted">{title}</h2>
      {children}
    </section>
  )
}

function CompareCell({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 rounded-cc-surface bg-campcareer-canvas p-3", className)}>
      <p className="truncate text-xs font-semibold text-campcareer-muted">{label}</p>
      <div className="mt-1 min-w-0">{children}</div>
    </div>
  )
}

export { CompareCell, CompareHeader, CompareSection, CompareShell }
