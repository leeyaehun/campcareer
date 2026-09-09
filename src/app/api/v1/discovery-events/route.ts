import { NextRequest, NextResponse } from "next/server"
import { getServerAcquisitionContext } from "@/lib/acquisition"

export const dynamic = "force-dynamic"

const EVENT_NAMES = new Set([
  "route_search_started",
  "route_search_submitted",
  "route_result_viewed",
  "route_external_link_clicked",
  "route_request_submitted",
  "map_opened_from_route",
  "guide_interest_submitted",
  "recommendation_start",
  "recommendation_result_view",
])

const CONTEXT_KEYS = [
  "surface",
  "country",
  "major",
  "goal",
  "locale",
  "route_id",
  "link_type",
] as const

export async function POST(request: NextRequest) {
  if (request.cookies.get("cc_analytics_consent")?.value !== "granted") {
    return new NextResponse(null, { status: 204 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!payload || typeof payload !== "object") return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  const value = payload as Record<string, unknown>
  const eventName = typeof value.eventName === "string" ? value.eventName : ""
  if (!EVENT_NAMES.has(eventName)) return NextResponse.json({ error: "Unsupported event" }, { status: 422 })

  const contextInput = value.context && typeof value.context === "object" ? value.context as Record<string, unknown> : {}
  const context = Object.fromEntries(
    CONTEXT_KEYS.flatMap((key) => {
      const item = contextInput[key]
      return typeof item === "string" && item.length > 0 ? [[key, item.slice(0, 80)]] : []
    }),
  )

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new NextResponse(null, { status: 204 })
  }

  try {
    const [{ supabaseAdmin }, acquisition] = await Promise.all([
      import("@/lib/supabase-admin"),
      getServerAcquisitionContext(),
    ])
    const { error } = await supabaseAdmin.from("analytics_events").insert({
      event_name: eventName,
      session_id: acquisition.sessionId,
      path: request.nextUrl.pathname,
      first_path: acquisition.firstPath,
      utm: acquisition.utm,
      context,
      referer: acquisition.referer,
    })
    if (error) console.error("[discovery-events] write failed:", error.message)
  } catch (error) {
    console.error("[discovery-events] unexpected write failure:", error)
  }

  return new NextResponse(null, { status: 204 })
}
