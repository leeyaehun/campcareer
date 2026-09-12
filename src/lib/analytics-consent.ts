export const ANALYTICS_CONSENT_COOKIE = "cc_analytics_consent"

export type AnalyticsConsent = "granted" | "denied" | null

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof document === "undefined") return null

  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`))
    ?.split("=")[1]

  return value === "granted" || value === "denied" ? value : null
}

export function setAnalyticsConsent(value: Exclude<AnalyticsConsent, null>) {
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`
  window.dispatchEvent(new Event("campcareer-consent"))
}

/** Create the server-managed, pseudonymous identifiers only after consent. */
export async function createOptionalMeasurementSession() {
  try {
    await fetch("/api/privacy/measurement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname: window.location.pathname, search: window.location.search }),
      keepalive: true,
    })
  } catch {
    // Measurement remains consent-gated even if the helper identifiers cannot
    // be created. A later navigation can retry without blocking the visitor.
  }
}

/** Clear the server-managed identifiers that exist only for optional measurement. */
export async function clearOptionalMeasurementCookies() {
  try {
    await fetch("/api/privacy/measurement", { method: "DELETE", keepalive: true })
  } catch {
    // The consent state is already denied locally; retrying deletion on a
    // future preference change is safer than blocking the visitor's choice.
  }
}

/**
 * Shared, dependency-free consent check for browser and server measurement
 * boundaries. A redirect may still work without consent; optional measurement
 * must not.
 */
export function hasGrantedAnalyticsConsent(cookieHeader: string | null | undefined) {
  return cookieHeader
    ?.split(";")
    .some((item) => item.trim() === `${ANALYTICS_CONSENT_COOKIE}=granted`) ?? false
}
