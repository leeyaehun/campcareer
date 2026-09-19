import Link from "next/link"
import { localizePath, type LocaleOption, withoutLocalePrefix } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"
import { CountryContextIndicator } from "./country-context-indicator"
import { MobileNavigation } from "./mobile-navigation"

export type NavDestination = {
  href: string
  label: { en: string; ko: string }
  matches: readonly string[]
  lane: "primary" | "decision-tool"
}

export const PRIMARY_DESTINATIONS: readonly NavDestination[] = [
  { href: "/countries", label: { en: "Countries", ko: "국가" }, matches: ["/countries"], lane: "primary" },
  { href: "/careers", label: { en: "Careers", ko: "커리어" }, matches: ["/careers", "/career"], lane: "primary" },
  { href: "/institutions", label: { en: "Education", ko: "교육" }, matches: ["/institutions"], lane: "primary" },
  { href: "/programs", label: { en: "Degrees", ko: "학위" }, matches: ["/programs", "/courses"], lane: "primary" },
]

export const DECISION_TOOL_DESTINATIONS: readonly NavDestination[] = [
  { href: "/maps", label: { en: "Maps", ko: "지도" }, matches: ["/maps"], lane: "decision-tool" },
  { href: "/compare", label: { en: "Compare", ko: "비교" }, matches: ["/compare"], lane: "decision-tool" },
]

export function isCurrentPath(pathname: string, matches: readonly string[]) {
  return matches.some((match) => pathname === match || pathname.startsWith(`${match}/`))
}

type PrimaryProductNavigationProps = {
  pathname: string
  locale: LocaleOption
  className?: string
}

function destinationLinkClasses(active: boolean, lane: NavDestination["lane"]) {
  const base =
    "rounded-cc-control px-2.5 py-2 text-sm transition-colors duration-cc-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
  if (active) {
    return cn(base, "bg-campcareer-surface text-campcareer-ink shadow-cc-surface font-semibold")
  }
  if (lane === "decision-tool") {
    return cn(base, "font-medium text-campcareer-muted hover:bg-campcareer-surface/70 hover:text-campcareer-ink")
  }
  return cn(base, "font-semibold text-campcareer-muted hover:bg-campcareer-surface/70 hover:text-campcareer-ink")
}

function DestinationLink({ item, pathname, locale, language }: { item: NavDestination; pathname: string; locale: LocaleOption; language: "en" | "ko" }) {
  const active = isCurrentPath(pathname, item.matches)
  return (
    <Link
      href={localizePath(item.href, locale)}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={destinationLinkClasses(active, item.lane)}
    >
      {item.label[language]}
    </Link>
  )
}

export function PrimaryProductNavigation({ pathname, locale, className }: PrimaryProductNavigationProps) {
  const currentPath = withoutLocalePrefix(pathname)
  const language = locale === "ko" ? "ko" : "en"

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <nav
        className="hidden items-center gap-1 lg:flex"
        aria-label={locale === "ko" ? "주요 탐색" : "Primary navigation"}
      >
        {PRIMARY_DESTINATIONS.map((item) => (
          <DestinationLink key={item.href} item={item} pathname={currentPath} locale={locale} language={language} />
        ))}
      </nav>

      <span aria-hidden="true" className="hidden h-5 w-px bg-campcareer-border/70 lg:inline-block" />

      <nav
        className="hidden items-center gap-1 lg:flex"
        aria-label={locale === "ko" ? "의사 결정 도구" : "Decision tools"}
      >
        {DECISION_TOOL_DESTINATIONS.map((item) => (
          <DestinationLink key={item.href} item={item} pathname={currentPath} locale={locale} language={language} />
        ))}
      </nav>

      <CountryContextIndicator pathname={pathname} locale={locale} className="hidden lg:inline-flex" />

      <MobileNavigation pathname={pathname} locale={locale} />
    </div>
  )
}