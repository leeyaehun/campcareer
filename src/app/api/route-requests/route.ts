import { createHmac } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { parseRouteRequestInput } from "@/lib/validation/route-request"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 4_096
const MAX_REQUESTS_PER_HOUR = 8
const NO_STORE_HEADERS = { "Cache-Control": "no-store" }
const rateBuckets = new Map<string, { count: number; resetAt: number }>()

function accepted() {
  // A uniform response prevents the form from becoming an email-address or
  // anti-spam oracle. The browser can always continue its honest flow.
  return NextResponse.json({ accepted: true }, { status: 202, headers: NO_STORE_HEADERS })
}

function fingerprint(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const userAgent = request.headers.get("user-agent") ?? "unknown"
  const secret = process.env.ROUTE_REQUEST_FINGERPRINT_SECRET
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    ?? "route-request-local-development-only"
  return createHmac("sha256", secret).update(`${clientIp}|${userAgent}`).digest("hex")
}

function allowRequest(key: string) {
  const now = Date.now()
  const current = rateBuckets.get(key)
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + 60 * 60 * 1_000 })
    return true
  }
  if (current.count >= MAX_REQUESTS_PER_HOUR) return false
  current.count += 1
  if (rateBuckets.size > 2_000) {
    for (const [bucketKey, bucket] of rateBuckets) if (bucket.resetAt <= now) rateBuckets.delete(bucketKey)
  }
  return true
}

function sourcePath(request: NextRequest) {
  const referer = request.headers.get("referer")
  if (!referer) return "/"
  try {
    const url = new URL(referer)
    return url.pathname.slice(0, 500) || "/"
  } catch {
    return "/"
  }
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0")
  if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) return accepted()

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return accepted()
  }

  const parsed = parseRouteRequestInput(payload)
  const requestFingerprint = fingerprint(request)
  if (parsed.honeypot || !parsed.input || !allowRequest(requestFingerprint)) return accepted()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return accepted()

  try {
    const { supabaseAdmin } = await import("@/lib/supabase-admin")
    const { error } = await supabaseAdmin
      .from("route_search_requests")
      .upsert({
        citizenship_code: parsed.input.citizenshipCode,
        destination_code: parsed.input.destinationCode,
        route_goal: parsed.input.goal,
        field_normalized: parsed.input.field,
        request_kind: parsed.input.requestKind,
        locale: parsed.input.locale,
        notification_email: parsed.input.notificationEmail,
        notification_consent: parsed.input.notificationConsent,
        notification_consent_at: parsed.input.notificationConsent ? new Date().toISOString() : null,
        notification_consent_version: parsed.input.notificationConsent ? "route-notification-v1" : null,
        request_fingerprint: requestFingerprint,
        source_path: sourcePath(request),
      }, {
        onConflict: "request_fingerprint,citizenship_code,destination_code,route_goal,field_normalized,request_kind",
        ignoreDuplicates: true,
      })
    if (error) console.error("[route-requests] write failed:", error.message)
  } catch (error) {
    console.error("[route-requests] unexpected failure:", error)
  }

  return accepted()
}
