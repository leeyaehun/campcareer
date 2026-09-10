import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

function DataTable({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <div className="overflow-x-auto rounded-cc-surface border border-campcareer-border bg-campcareer-surface shadow-cc-surface">
      <table aria-label={label} className={cn("w-full border-collapse text-left text-sm", className)}>{children}</table>
    </div>
  )
}

function DataTableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <thead className={cn("bg-campcareer-canvas text-xs font-semibold text-campcareer-muted", className)}>{children}</thead>
}

function DataTableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("border-b border-campcareer-border last:border-b-0", className)}>{children}</tr>
}

function DataTableCell({ children, className, as = "td" }: { children: ReactNode; className?: string; as?: "td" | "th" }) {
  const Cell = as
  return <Cell className={cn("px-4 py-3.5 align-top", className)}>{children}</Cell>
}

export { DataTable, DataTableCell, DataTableHeader, DataTableRow }
