"use client"

import { track as vercelTrack } from "@vercel/analytics"

type EventValue = string | number | boolean | undefined

const ALLOWED_EVENTS = new Set([
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
  "feedback_submitted",
  "comparison_view",
  "comparison_personalized",
  "lead_request_submitted",
  "finder_search",
  "decision_start",
  "seo_landing_view",
  "visa_alert_submitted",
])

export function track(eventName: string, params?: Record<string, EventValue>) {
  if (
    typeof window === "undefined" ||
    !ALLOWED_EVENTS.has(eventName) ||
    !document.cookie.split("; ").some((item) => item === "cc_analytics_consent=granted")
  ) return

  const properties = Object.fromEntries(
    Object.entries(params ?? {})
      .filter(([key, value]) => /^[a-z][a-z0-9_]{0,31}$/.test(key) && value !== undefined)
      .slice(0, 8)
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 80) : value]),
  ) as Record<string, string | number | boolean>

  vercelTrack(eventName, properties)
}

function analyticsConsentGranted() {
  return typeof window !== "undefined" && document.cookie.split("; ").some((item) => item === "cc_analytics_consent=granted")
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

/**
 * Route events deliberately accept only a small, non-identifying context.
 * Never pass an email address, free-text field, or a full URL query here.
 */
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
