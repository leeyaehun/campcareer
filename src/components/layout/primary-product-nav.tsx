import Link from "next/link"
import { localizePath, type LocaleOption, withoutLocalePrefix } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

const PRIMARY_DESTINATIONS = [
  { href: "/careers", label: { en: "Careers", ko: "커리어" }, matches: ["/careers", "/career"] },
  { href: "/countries", label: { en: "Countries", ko: "국가" }, matches: ["/countries"] },
  { href: "/programs", label: { en: "Degrees", ko: "학위" }, matches: ["/programs", "/courses"] },
  { href: "/institutions", label: { en: "Education", ko: "교육" }, matches: ["/institutions"] },
] as const

type PrimaryProductNavigationProps = {
  pathname: string
  locale: LocaleOption
  className?: string
}

function isCurrentPath(pathname: string, matches: readonly string[]) {
  return matches.some((match) => pathname === match || pathname.startsWith(`${match}/`))
}

export function PrimaryProductNavigation({ pathname, locale, className }: PrimaryProductNavigationProps) {
  const currentPath = withoutLocalePrefix(pathname)
  const language = locale === "ko" ? "ko" : "en"

  return (
    <nav className={cn("hidden items-center gap-1 lg:flex", className)} aria-label={locale === "ko" ? "주요 탐색" : "Primary navigation"}>
      {PRIMARY_DESTINATIONS.map((item) => {
        const active = isCurrentPath(currentPath, item.matches)
        return (
          <Link
            key={item.href}
            href={localizePath(item.href, locale)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[hsl(var(--cc-canvas))] text-[hsl(var(--cc-ink))]"
                : "text-[hsl(var(--cc-muted))] hover:bg-[hsl(var(--cc-canvas))] hover:text-[hsl(var(--cc-ink))]",
            )}
          >
            {item.label[language]}
          </Link>
        )
      })}
    </nav>
  )
}

export function CompareNavigationAction({ pathname, locale, className }: PrimaryProductNavigationProps) {
  const active = isCurrentPath(withoutLocalePrefix(pathname), ["/compare"])

  return (
    <Link
      href={localizePath("/compare", locale)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "hidden rounded-md border px-2.5 py-1.5 text-sm font-semibold transition-colors lg:inline-flex",
        active
          ? "border-brand bg-[hsl(var(--brand-tint))] text-brand"
          : "border-[hsl(var(--cc-border))] text-[hsl(var(--cc-ink-secondary))] hover:border-brand/40 hover:text-brand",
        className,
      )}
    >
      {locale === "ko" ? "비교" : "Compare"}
    </Link>
  )
}
