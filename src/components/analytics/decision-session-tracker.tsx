"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { withoutLocalePrefix } from "@/lib/i18n/config"
import { trackAnalyticsEvent, type AnalyticsEntityType } from "@/lib/analytics"

type SessionState = { viewedPaths: string[]; entityTypes: AnalyticsEntityType[]; decisionRecorded: boolean }
const STORAGE_KEY = "cc_decision_session_v1"

type CompareAnalyticsDetails = {
  entity_count: number
  comparison_category: "career" | "country" | "city" | "program" | "institution" | "universal"
}

function countDelimitedValues(value: string | null) {
  return new Set((value ?? "").split(",").map((item) => item.trim()).filter(Boolean)).size
}

/**
 * Compare routes keep their reconstructable state in a small, public query.
 * This extracts only the mode and count for measurement; no selected IDs or
 * other URL values are sent to analytics.
 */
export function getCompareAnalyticsDetails(searchParams: Pick<URLSearchParams, "get">): CompareAnalyticsDetails {
  const type = searchParams.get("type")
  if (type === "career") return { comparison_category: "career", entity_count: countDelimitedValues(searchParams.get("careers")) }
  if (type === "country") return { comparison_category: "country", entity_count: countDelimitedValues(searchParams.get("locations")) }
  if (type === "city") return { comparison_category: "city", entity_count: countDelimitedValues([searchParams.get("left"), searchParams.get("right")].filter(Boolean).join(",")) }
  if (type === "program") return { comparison_category: "program", entity_count: countDelimitedValues(searchParams.get("items")) }
  if (type === null) return { comparison_category: "program", entity_count: 0 }
  return { comparison_category: "universal", entity_count: 0 }
}

export function entityTypeForPath(pathname: string): AnalyticsEntityType | null {
  const path = withoutLocalePrefix(pathname)
  if (path.startsWith("/career/")) return "career"
  if (path.startsWith("/countries/")) return "country"
  if (/^\/programs\/[a-z]{2}\/.+/.test(path)) return "program"
  if (/^\/institutions\/[a-z]{2}\/.+/.test(path)) return "institution"
  if (path === "/compare") return "compare"
  if (path === "/sources") return "source"
  if (path === "/methodology") return "methodology"
  if (path === "/data-policy") return "data_policy"
  return null
}

export function nextDecisionSessionState(current: SessionState, path: string, entityType: AnalyticsEntityType): SessionState {
  if (current.viewedPaths.includes(path)) return current
  return {
    ...current,
    viewedPaths: [...current.viewedPaths, path].slice(-20),
    entityTypes: [...new Set([...current.entityTypes, entityType])],
  }
}

function readState(): SessionState {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<SessionState>
    return {
      viewedPaths: Array.isArray(value.viewedPaths) ? value.viewedPaths.filter((path): path is string => typeof path === "string").slice(-20) : [],
      entityTypes: Array.isArray(value.entityTypes) ? value.entityTypes.filter((type): type is AnalyticsEntityType => typeof type === "string").slice(-8) : [],
      decisionRecorded: value.decisionRecorded === true,
    }
  } catch {
    return { viewedPaths: [], entityTypes: [], decisionRecorded: false }
  }
}

function writeState(state: SessionState) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* storage is optional */ }
}

/**
 * A Decision Session is recorded once per browser session after a Compare view
 * or after three meaningful entity views spanning two entity types. It carries
 * no account ID and never creates a cross-device identifier.
 */
export function DecisionSessionTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousType = useRef<AnalyticsEntityType | null>(null)

  useEffect(() => {
    const path = withoutLocalePrefix(pathname)
    const entityType = entityTypeForPath(path)
    if (!entityType) return

    const before = readState()
    const state = nextDecisionSessionState(before, path, entityType)
    const isNewView = state !== before
    if (isNewView) trackAnalyticsEvent({ name: "entity_view", params: { entity_type: entityType } })
    if (previousType.current && previousType.current !== entityType && isNewView) {
      trackAnalyticsEvent({ name: "cross_entity_navigation", params: { from_entity_type: previousType.current, to_entity_type: entityType } })
    }
    previousType.current = entityType

    if (entityType === "compare" && isNewView) {
      trackAnalyticsEvent({ name: "compare_view", params: getCompareAnalyticsDetails(searchParams) })
    }

    if (!state.decisionRecorded) {
      const qualification = entityType === "compare"
        ? "compare_view"
        : state.viewedPaths.length >= 3 && state.entityTypes.length >= 2
          ? "meaningful_entity_views"
          : null
      if (qualification) {
        trackAnalyticsEvent({ name: "decision_session", params: { qualification } })
        state.decisionRecorded = true
      }
    }
    writeState(state)
  }, [pathname, searchParams])

  return null
}
