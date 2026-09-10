import type { ReactNode } from "react"

type WorkspacePageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function WorkspacePageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: WorkspacePageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className ?? ""}`}>
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.08em] text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-campcareer-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-campcareer-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}
