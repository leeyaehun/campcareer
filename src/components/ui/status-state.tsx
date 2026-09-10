import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function EmptyState({ icon, title, detail, action, className }: { icon?: ReactNode; title: string; detail: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-48 flex-col items-center justify-center rounded-cc-large border border-dashed border-campcareer-border bg-campcareer-surface px-6 py-10 text-center", className)}>
      {icon ? <div className="text-campcareer-muted">{icon}</div> : null}
      <h2 className="mt-3 text-base font-semibold text-campcareer-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-campcareer-ink-secondary">{detail}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

function ErrorState({ title = "Something went wrong", detail, action, className }: { title?: string; detail: string; action?: ReactNode; className?: string }) {
  return <EmptyState title={title} detail={detail} action={action} className={cn("border-campcareer-negative/25", className)} />
}

function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)} aria-label="Loading" role="status">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

export { EmptyState, ErrorState, LoadingState }
