import { getLaunchCountry, getLaunchCountryBySlug, type LaunchCountry } from "@/data/launch-countries"

/**
 * P4.0 navigation foundation: derive the current Country context from the
 * route alone. This is a URL projection, not a new country state manager.
 * It reuses the launch-country registry so labels, slugs and codes always
 * agree with the Countries explorer, Career routing and Maps.
 */

const COUNTRY_CODE_SURFACES = ["cities", "visas", "occupation", "programs", "institutions", "courses"] as const

function resolveCountrySegment(value: string): LaunchCountry | null {
  return getLaunchCountryBySlug(value.toLowerCase()) ?? getLaunchCountry(value.toUpperCase())
}

/**
 * Returns the launch country implied by the bare (locale-stripped) pathname:
 * `/countries/ie`, `/countries/ie/degrees`, `/career/ireland/software-developer`,
 * `/cities/ie/dublin`, `/visas/ie/...`, `/programs/ie/...`, etc.
 * Returns null for global or non-country-scoped routes.
 */
export function findNavCountryContext(pathname: string): LaunchCountry | null {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length < 2) return null

  const [surface, segment] = segments

  if (surface === "countries") {
    return resolveCountrySegment(segment)
  }

  if (surface === "career") {
    return resolveCountrySegment(segment)
  }

  if ((COUNTRY_CODE_SURFACES as readonly string[]).includes(surface)) {
    return getLaunchCountry(segment.toUpperCase())
  }

  return null
}