"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { localizePath, type LocaleOption, withoutLocalePrefix } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"
import { CountryContextIndicator } from "./country-context-indicator"
import {
  DECISION_TOOL_DESTINATIONS,
  isCurrentPath,
  PRIMARY_DESTINATIONS,
  type NavDestination,
} from "./primary-product-nav"

type MobileNavigationProps = {
  pathname: string
  locale: LocaleOption
  className?: string
}

const DESKTOP_BREAKPOINT = "(min-width: 1024px)"

export function MobileNavigation({ pathname, locale, className }: MobileNavigationProps) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const currentPath = withoutLocalePrefix(pathname)
  const language = locale === "ko" ? "ko" : "en"

  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    const onResize = () => {
      if (window.matchMedia(DESKTOP_BREAKPOINT).matches) close()
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("resize", onResize)
    }
  }, [open, close])

  const copy = {
    openLabel: language === "ko" ? "메뉴 열기" : "Open menu",
    closeLabel: language === "ko" ? "메뉴 닫기" : "Close menu",
    dialogLabel: language === "ko" ? "주요 메뉴" : "Main menu",
    explore: language === "ko" ? "탐색" : "Explore",
    tools: language === "ko" ? "도구" : "Tools",
  }

  function MobileDestinationLink({ item }: { item: NavDestination }) {
    const active = isCurrentPath(currentPath, item.matches)
    return (
      <Link
        href={localizePath(item.href, locale)}
        prefetch={false}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-h-11 items-center rounded-cc-control px-3 py-2.5 text-sm transition-colors duration-cc-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
          active
            ? "bg-campcareer-surface font-semibold text-campcareer-ink shadow-cc-surface"
            : "font-medium text-campcareer-muted hover:bg-campcareer-surface/70 hover:text-campcareer-ink",
        )}
      >
        {item.label[language]}
      </Link>
    )
  }

  return (
    <div className={cn("lg:hidden", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={copy.openLabel}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-cc-control p-2 text-campcareer-muted transition-colors duration-cc-fast hover:bg-campcareer-surface/70 hover:text-campcareer-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
      </button>

      {open ? (
        <div
          id={panelId}
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={copy.dialogLabel}
        >
          <button
            type="button"
            aria-label={copy.closeLabel}
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 h-full w-full cursor-default bg-campcareer-ink/20"
          />
          <div
            ref={panelRef}
            className="absolute right-0 top-0 flex h-full w-full max-w-[calc(100vw-1rem)] flex-col overflow-y-auto border-l border-campcareer-border bg-campcareer-canvas shadow-cc-raised outline-none"
          >
            <div className="flex min-h-16 items-center gap-2 border-b border-campcareer-border px-4">
              <p className="campcareer-wordmark shrink-0 text-base text-campcareer-ink" aria-hidden="true">
                CampCareer
              </p>
              <div className="ml-auto flex items-center gap-2">
                <CountryContextIndicator pathname={pathname} locale={locale} className="inline-flex" />
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label={copy.closeLabel}
                  onClick={close}
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-cc-control p-2 text-campcareer-muted transition-colors duration-cc-fast hover:bg-campcareer-surface/70 hover:text-campcareer-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
              <nav aria-label={language === "ko" ? "주요 메뉴" : "Primary menu"}>
                <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-campcareer-muted">
                  {copy.explore}
                </p>
                <ul className="space-y-1">
                  {PRIMARY_DESTINATIONS.map((item) => (
                    <li key={item.href}>
                      <MobileDestinationLink item={item} />
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label={language === "ko" ? "의사 결정 도구 메뉴" : "Decision tools menu"}>
                <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-campcareer-muted">
                  {copy.tools}
                </p>
                <ul className="space-y-1">
                  {DECISION_TOOL_DESTINATIONS.map((item) => (
                    <li key={item.href}>
                      <MobileDestinationLink item={item} />
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}