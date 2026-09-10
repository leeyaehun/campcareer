import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

function EntityPageHeader({ eyebrow, title, titleId, subtitle, children, className }: { eyebrow?: string; title: string; titleId?: string; subtitle?: string; children?: ReactNode; className?: string }) {
  return (
    <header className={cn("max-w-3xl", className)}>
      {eyebrow ? <p className="text-xs font-semibold tracking-[0.08em] text-brand">{eyebrow}</p> : null}
      <h1 id={titleId} className="mt-2 text-3xl font-bold tracking-[-0.045em] text-campcareer-ink sm:text-4xl">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm font-medium text-campcareer-muted">{subtitle}</p> : null}
      {children}
    </header>
  )
}

function EntityPageSection({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("border-t border-campcareer-border py-8 sm:py-10", className)}>
      <h2 className="text-2xl font-bold tracking-[-0.04em] text-campcareer-ink sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-campcareer-ink-secondary sm:text-base">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export { EntityPageHeader, EntityPageSection }
