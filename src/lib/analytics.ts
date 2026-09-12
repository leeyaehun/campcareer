"use client"

/**
 * Phase 6 measurement contract. This is the only browser boundary allowed to
 * send product events to measurement providers. Event names are deliberately
 * stable lower_snake_case identifiers; document a migration before changing
 * one so historical reports remain comparable.
 */

type AnalyticsValue = string | number | boolean | undefined

export const CORE_ANALYTICS_EVENTS = [
  "search",
  "filter_apply",
  "filter_clear",
  "compare_add",
  "compare_remove",
  "compare_view",
  "compare_complete",
  "compare_share",
  "source_open",
  "methodology_open",
  "entity_save",
  "education_outbound_click",
  "entity_view",
  "cross_entity_navigation",
  "decision_session",
] as const

export type CoreAnalyticsEventName = (typeof CORE_ANALYTICS_EVENTS)[number]
export type AnalyticsEntityType = "career" | "country" | "program" | "institution" | "compare" | "source" | "methodology" | "data_policy"

export type CoreAnalyticsEvent =
  | { name: "search"; params: { search_location: "careers"; result_count: number; entity_filter?: string; search_term?: string } }
  | { name: "filter_apply"; params: { search_location: "careers"; entity_filter: string } }
  | { name: "filter_clear"; params: { search_location: "careers"; entity_filter: string } }
  | { name: "compare_add" | "compare_remove"; params: { entity_type: AnalyticsEntityType; entity_count: number; comparison_category: "career" | "country" | "program" | "institution" } }
  | { name: "compare_view"; params: { entity_count: number; comparison_category: "career" | "country" | "city" | "program" | "institution" | "universal" } }
  | { name: "compare_complete"; params: { entity_count: number; comparison_category: "career" | "country" | "city" | "program" | "institution" } }
  | { name: "compare_share"; params: { entity_count: number; comparison_category: "career" | "country" | "city" | "program" | "institution"; share_method: "native" | "clipboard" } }
  | { name: "source_open"; params: { source_surface: "sources" | "career" } }
  | { name: "methodology_open"; params: { source_surface: "sources" | "career" | "data_policy" } }
  | { name: "entity_save"; params: { entity_type: AnalyticsEntityType } }
  | { name: "education_outbound_click"; params: { entity_type: "program" | "institution" } }
  | { name: "entity_view"; params: { entity_type: AnalyticsEntityType } }
  | { name: "cross_entity_navigation"; params: { from_entity_type: AnalyticsEntityType; to_entity_type: AnalyticsEntityType } }
  | { name: "decision_session"; params: { qualification: "compare_view" | "meaningful_entity_views" } }

const LEGACY_ANALYTICS_EVENTS = [
  "route_search_started",
  "route_search_submitted",
  "route_result_viewed",
  "route_external_link_clicked",
  "route_request_submitted",
  "map_opened_from_route",
  "guide_interest_submitted",
  "landing_view",
  "recommendation_start",
  "recommendation_result_view",
  "evidence_action",
  "plan_save_requested",
  "plan_save_confirmed",
  "plan_returned",
  "partner_exit",
  "affiliate_click",
  "affiliate_offer_view",
  "comparison_view",
  "comparison_personalized",
  "lead_request_submitted",
  "finder_search",
  "decision_start",
  "seo_landing_view",
  "visa_alert_submitted",
  "select_region",
  "select_state",
  "click_occupation",
  "switch_tab",
] as const

type LegacyAnalyticsEventName = (typeof LEGACY_ANALYTICS_EVENTS)[number]
const ALLOWED_LEGACY_EVENTS = new Set<string>(LEGACY_ANALYTICS_EVENTS)

const DISALLOWED_PARAM_NAMES = /(?:email|mail|phone|name|message|feedback|password|token|secret|address|document)/i
const EMAIL_PATTERN = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/
const PHONE_PATTERN = /(?:\+?\d[\d().\-\s]{6,}\d)/
const URL_PATTERN = /(?:https?:\/\/|www\.)/i
const IDENTIFIABLE_TITLE_CASE_NAME = /\b[A-Z][a-z]{1,}\s+[A-Z][a-z]{1,}\b/

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function isGoogleAnalyticsMeasurementId(value: string | undefined): value is string {
  return Boolean(value && /^G-[A-Z0-9]{6,16}$/i.test(value))
}

export function analyticsConsentGranted() {
  return typeof window !== "undefined" && document.cookie.split("; ").some((item) => item === "cc_analytics_consent=granted")
}

/** Returns a normalised search phrase only when it contains no obvious PII. */
export function sanitizeSearchTerm(value: string | undefined) {
  if (typeof value !== "string") return undefined
  const term = value.trim().replace(/\s+/g, " ").slice(0, 80)
  if (!term || EMAIL_PATTERN.test(term) || PHONE_PATTERN.test(term) || URL_PATTERN.test(term) || IDENTIFIABLE_TITLE_CASE_NAME.test(term)) {
    return undefined
  }
  return term
}

export function sanitizeAnalyticsParams(params: Record<string, AnalyticsValue>) {
  const safe: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(params).slice(0, 12)) {
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(key) || value === undefined || DISALLOWED_PARAM_NAMES.test(key)) continue
    if (typeof value === "string") {
      const sanitized = sanitizeSearchTerm(value)
      if (sanitized) safe[key] = sanitized
    } else if (typeof value === "number") {
      if (Number.isFinite(value)) safe[key] = value
    } else {
      safe[key] = value
    }
  }
  return safe
}

function emitDebugEvent(name: string, params: Record<string, string | number | boolean>) {
  window.dispatchEvent(new CustomEvent("campcareer-analytics-event", { detail: { name, params } }))
}

function sendMeasurementEvent(name: string, rawParams: Record<string, AnalyticsValue>) {
  if (typeof window === "undefined" || !analyticsConsentGranted()) return false
  const params = sanitizeAnalyticsParams(rawParams)
  emitDebugEvent(name, params)

  // GA4 is optional. A missing ID or a blocked script leaves product behaviour
  // unchanged; Vercel Analytics remains independently consent-gated.
  if (isGoogleAnalyticsMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) && typeof window.gtag === "function") {
    window.gtag("event", name, params)
  }

  void import("@vercel/analytics")
    .then(({ track: vercelTrack }) => vercelTrack(name, params))
    .catch(() => undefined)
  return true
}

export function trackAnalyticsEvent(event: CoreAnalyticsEvent) {
  const params = event.name === "search"
    ? { ...event.params, search_term: sanitizeSearchTerm(event.params.search_term) }
    : event.params
  return sendMeasurementEvent(event.name, params)
}

/** Compatibility for the narrowly allowlisted events that predate Phase 6. */
export function track(eventName: LegacyAnalyticsEventName, params?: Record<string, AnalyticsValue>) {
  if (!ALLOWED_LEGACY_EVENTS.has(eventName)) return false
  return sendMeasurementEvent(eventName, params ?? {})
}

function persistEvent(eventName: string, context: Record<string, string | undefined>) {
  if (!analyticsConsentGranted()) return
  void fetch("/api/v1/discovery-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, context }),
    keepalive: true,
  }).catch(() => undefined)
}

export function recordDiscoveryEvent(
  eventName: "recommendation_start" | "recommendation_result_view",
  context: { surface: "landing" | "country_results"; country: string; major: string; goal: string },
) {
  track(eventName, context)
  persistEvent(eventName, context)
}

export type RouteAnalyticsEvent =
  | "route_search_started"
  | "route_search_submitted"
  | "route_result_viewed"
  | "route_external_link_clicked"
  | "route_request_submitted"
  | "map_opened_from_route"
  | "guide_interest_submitted"

export function recordRouteEvent(
  eventName: RouteAnalyticsEvent,
  context: {
    route_id?: string
    locale?: "en" | "ko"
    link_type?: "visa" | "course" | "job" | "employer" | "map"
    surface?: "landing" | "route_result" | "maps"
  },
) {
  track(eventName, context)
  persistEvent(eventName, context)
}
