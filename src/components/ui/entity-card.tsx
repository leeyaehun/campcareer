import type { ReactNode } from "react"

import { EntityBadge } from "@/components/ui/data-display"
import { cn } from "@/lib/utils"

type EntityCardProps = {
  title: string
  description?: string
  meta?: ReactNode
  badge?: ReactNode
  action?: ReactNode
  children?: ReactNode
  className?: string
}

function EntityCard({ title, description, meta, badge, action, children, className }: EntityCardProps) {
  return (
    <article className={cn("rounded-cc-large border border-campcareer-border bg-campcareer-surface p-5 shadow-cc-surface transition-colors duration-cc-fast", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {badge ? <div className="mb-2">{typeof badge === "string" ? <EntityBadge>{badge}</EntityBadge> : badge}</div> : null}
          <h3 className="text-base font-semibold tracking-[-0.02em] text-campcareer-ink">{title}</h3>
          {description ? <p className="mt-1.5 text-sm leading-6 text-campcareer-ink-secondary">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {meta ? <div className="mt-3 text-xs leading-5 text-campcareer-muted">{meta}</div> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  )
}

export { EntityCard }
