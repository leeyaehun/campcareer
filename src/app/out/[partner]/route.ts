import { NextResponse } from "next/server"
import { hasGrantedAnalyticsConsent } from "@/lib/analytics-consent"
import { getPartner } from "@/lib/partners"
import { getServerAcquisitionContext } from "@/lib/acquisition"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET(request: Request, props: { params: Promise<{ partner: string }> }) {
  const params = await props.params;
  const partner = getPartner(params.partner)
  if (!partner) return new NextResponse("Not found", { status: 404 })

  // Affiliate links remain available to every visitor. The optional event,
  // including attribution cookies and referrer context, is written only after
  // the same affirmative consent required by the browser analytics boundary.
  if (hasGrantedAnalyticsConsent(request.headers.get("cookie"))) {
    const acquisition = await getServerAcquisitionContext()
    const { error } = await supabaseAdmin.from("analytics_events").insert({
      event_name: "affiliate_click",
      session_id: acquisition.sessionId,
      path: new URL(request.url).pathname,
      first_path: acquisition.firstPath,
      utm: acquisition.utm,
      context: { partner: partner.id },
      referer: acquisition.referer,
    })

    if (error) console.error("[affiliate] click write failed:", error.message)
  }
  return NextResponse.redirect(partner.href, 307)
}
