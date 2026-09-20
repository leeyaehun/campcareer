import Link from "next/link"
import { MapPin } from "lucide-react"
import { localizePath, type LocaleOption, withoutLocalePrefix } from "@/lib/i18n/config"
import { findNavCountryContext } from "@/lib/navigation/nav-country-context"
import { workspaceCountryLabel } from "@/lib/workspace/sidebar-i18n"
import { cn } from "@/lib/utils"

type CountryContextIndicatorProps = {
  pathname: string
  locale: LocaleOption
  className?: string
}

/**
 * P4.0 navigation foundation: a shallow country-context marker derived from
 * the current route. It links back to the country dashboard so users always
 * have a country continuation path. Reuses the launch-country registry only;
 * it does not add a new country state manager.
 */
export function CountryContextIndicator({ pathname, locale, className }: CountryContextIndicatorProps) {
  const country = findNavCountryContext(withoutLocalePrefix(pathname))
  if (!country) return null

  const language = locale === "ko" ? "ko" : "en"
  const label = workspaceCountryLabel(language, country)
  const contextLabel = language === "ko" ? `현재 국가: ${label}` : `Current country: ${label}`

  return (
    <Link
      href={localizePath(`/countries/${country.code.toLowerCase()}`, locale)}
      prefetch={false}
      aria-label={contextLabel}
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-cc-control border border-campcareer-border bg-campcareer-surface/70 px-2.5 text-sm font-medium text-campcareer-muted transition-colors duration-cc-fast hover:text-campcareer-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        className,
      )}
    >
      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  )
}